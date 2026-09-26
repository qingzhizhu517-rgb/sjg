#!/usr/bin/env python3
"""Regression tests for the migration runner's local preflight behavior."""

import os
from pathlib import Path
import subprocess
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "apply_migration.py"


class ApplyMigrationPreflightTest(unittest.TestCase):
    def test_missing_pymysql_reports_actionable_error_without_secret(self):
        secret = "migration-test-secret-should-not-leak"
        environment = os.environ.copy()
        environment.update(
            {
                "DB_HOST": "192.0.2.1",
                "DB_PORT": "65535",
                "DB_PASSWORD": secret,
            }
        )
        environment.pop("PYTHONPATH", None)

        result = subprocess.run(
            [sys.executable, "-S", str(SCRIPT), str(ROOT / "missing.sql")],
            cwd=ROOT,
            env=environment,
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )

        output = result.stdout + result.stderr
        self.assertEqual(result.returncode, 2, output)
        self.assertIn("pymysql", output.lower())
        self.assertRegex(output, r"(?i)(install|安装|依赖)")
        self.assertNotIn(secret, output)
        self.assertNotIn("Traceback", output)


if __name__ == "__main__":
    unittest.main()
