"""Short-lived, authenticated release maintenance; never deploy as a permanent API."""
import base64
import gzip
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import subprocess
import ssl
import tempfile
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import pymysql

TOKEN = os.environ['MAINTENANCE_TOKEN']
if len(TOKEN) < 32:
    raise RuntimeError('A strong temporary maintenance token is required')
START = time.monotonic()


def database(verify=False, ca=None):
    bootstrap = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    bootstrap.check_hostname = False
    bootstrap.verify_mode = ssl.CERT_NONE
    # Bootstrap stays on the selected private network; new application clients
    # are not published until the newly provisioned identity is verified.
    options = {'ssl': bootstrap}
    if verify:
        options = {'ssl_ca': ca, 'ssl_verify_cert': True, 'ssl_verify_identity': True}
    return pymysql.connect(host=os.environ['DB_HOST'], port=int(os.getenv('DB_PORT', '3306')),
                           user=os.environ['DB_USER'], password=os.environ['DB_PASSWORD'],
                           database=os.environ['DB_NAME'], charset='utf8mb4', autocommit=True,
                           connect_timeout=15, read_timeout=60, **options)


def backup():
    with database() as connection, connection.cursor() as cursor:
        cursor.execute('SHOW FULL TABLES WHERE Table_type="BASE TABLE"')
        tables = [row[0] for row in cursor.fetchall()]
        cursor.execute('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ')
        cursor.execute('START TRANSACTION WITH CONSISTENT SNAPSHOT')
        sql = ['SET NAMES utf8mb4;', 'SET FOREIGN_KEY_CHECKS=0;']
        counts = {}
        for table in tables:
            if not re.fullmatch(r'[A-Za-z0-9_]+', table):
                raise RuntimeError('Unsupported table identifier')
            cursor.execute(f'SHOW CREATE TABLE `{table}`')
            sql.append(cursor.fetchone()[1] + ';')
            cursor.execute(f'SELECT * FROM `{table}`')
            columns = ','.join('`' + column[0] + '`' for column in cursor.description)
            rows = cursor.fetchall()
            counts[table] = len(rows)
            for row in rows:
                values = ','.join(connection.escape(value) for value in row)
                sql.append(f'INSERT INTO `{table}` ({columns}) VALUES ({values});')
        cursor.execute('COMMIT')
        sql.append('SET FOREIGN_KEY_CHECKS=1;')
    content = gzip.compress(('\n'.join(sql) + '\n').encode('utf8'))
    return content, counts


def install_tls():
    host = os.environ['DB_HOST']
    if not re.fullmatch(r'[A-Za-z0-9.-]+\.railway\.internal', host):
        raise RuntimeError('Refusing TLS provisioning outside the known private database')
    with tempfile.TemporaryDirectory() as directory:
        cert = Path(directory) / 'cert.pem'
        key = Path(directory) / 'key.pem'
        subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '365',
                        '-keyout', str(key), '-out', str(cert), '-subj', '/CN=' + host,
                        '-addext', 'subjectAltName=DNS:' + host], check=True, capture_output=True)
        prefix = '/var/lib/mysql/sjg-tls/sjg-release-tls-' + str(int(time.time()))
        with database() as connection, connection.cursor() as cursor:
            cursor.execute('SHOW VARIABLES WHERE Variable_name IN ("ssl_ca","ssl_cert","ssl_key")')
            previous = dict(cursor.fetchall())
            cursor.execute('SELECT %s INTO DUMPFILE %s', (cert.read_bytes(), prefix + '-cert.pem'))
            cursor.execute('SELECT %s INTO DUMPFILE %s', (key.read_bytes(), prefix + '-key.pem'))
            try:
                cursor.execute('SET PERSIST ssl_ca=%s', (prefix + '-cert.pem',))
                cursor.execute('SET PERSIST ssl_cert=%s', (prefix + '-cert.pem',))
                cursor.execute('SET PERSIST ssl_key=%s', (prefix + '-key.pem',))
                cursor.execute('ALTER INSTANCE RELOAD TLS')
                with database(verify=True, ca=str(cert)) as verified, verified.cursor() as check:
                    check.execute('SHOW SESSION STATUS LIKE "Ssl_cipher"')
                    cipher = check.fetchone()[1]
                    if not cipher:
                        raise RuntimeError('TLS verification did not negotiate encryption')
            except Exception:
                for name, value in previous.items():
                    cursor.execute(f'SET PERSIST {name}=%s', (value,))
                cursor.execute('ALTER INSTANCE RELOAD TLS')
                raise
        return {'ca_pem_base64': base64.b64encode(cert.read_bytes()).decode(), 'host': host,
                'verified_identity': True, 'cipher': cipher, 'valid_days': 365, 'previous_paths': previous,
                'certificate_path': prefix + '-cert.pem', 'private_key_path': prefix + '-key.pem'}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log credentials or SQL data.

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200); self.end_headers(); self.wfile.write(b'OK'); return
        if time.monotonic() - START > 1800 or not hmac.compare_digest(self.headers.get('Authorization', ''), 'Bearer ' + TOKEN):
            self.send_response(401); self.end_headers(); return
        try:
            if self.path == '/backup':
                content, counts = backup()
                self.send_response(200)
                self.send_header('Content-Type', 'application/gzip')
                self.send_header('X-Backup-SHA256', hashlib.sha256(content).hexdigest())
                self.send_header('X-Backup-Counts', json.dumps(counts))
                self.end_headers(); self.wfile.write(content)
            elif self.path == '/inspect':
                with database() as connection, connection.cursor() as cursor:
                    cursor.execute('SHOW VARIABLES WHERE Variable_name IN ("secure_file_priv","ssl_ca","ssl_cert","ssl_key","version")')
                    value = dict(cursor.fetchall())
                self.send_response(200); self.send_header('Content-Type', 'application/json')
                self.end_headers(); self.wfile.write(json.dumps(value).encode())
            else:
                self.send_response(404); self.end_headers()
        except Exception as error:
            print('Maintenance failed:', type(error).__name__, flush=True)
            self.send_response(500); self.end_headers()

    def do_POST(self):
        if self.path != '/tls' or time.monotonic() - START > 1800 or not hmac.compare_digest(self.headers.get('Authorization', ''), 'Bearer ' + TOKEN):
            self.send_response(401); self.end_headers(); return
        try:
            value = install_tls()
            self.send_response(200); self.send_header('Content-Type', 'application/json')
            self.end_headers(); self.wfile.write(json.dumps(value).encode())
        except Exception as error:
            print('TLS provisioning failed:', type(error).__name__, getattr(error, 'args', [None])[0], flush=True)
            self.send_response(500); self.end_headers()


HTTPServer(('0.0.0.0', int(os.getenv('PORT', '8080'))), Handler).serve_forever()
