package com.sjg.ops;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.util.Base64;

/** Application receives public CA material only; database private keys are never passed to it. */
public final class DatabaseTls {
    private DatabaseTls() { }
    public static void configureFromEnvironment() throws Exception {
        String ca = System.getenv("MYSQL_CA_PEM_BASE64");
        if (ca == null || ca.isBlank()) return;
        var certificate = CertificateFactory.getInstance("X.509").generateCertificate(new ByteArrayInputStream(Base64.getDecoder().decode(ca)));
        KeyStore store = KeyStore.getInstance("PKCS12");
        char[] password = "sjg-public-ca".toCharArray();
        store.load(null, password);
        // Retain the standard HTTPS roots used by OSS and LLM clients.
        KeyStore defaults = KeyStore.getInstance("JKS");
        try (var input = Files.newInputStream(java.nio.file.Path.of(System.getProperty("java.home"), "lib", "security", "cacerts"))) {
            defaults.load(input, "changeit".toCharArray());
        }
        var aliases = defaults.aliases();
        while (aliases.hasMoreElements()) {
            String alias = aliases.nextElement();
            store.setCertificateEntry(alias, defaults.getCertificate(alias));
        }
        store.setCertificateEntry("mysql-ca", certificate);
        var file = Files.createTempFile("sjg-mysql-ca-", ".p12");
        file.toFile().deleteOnExit();
        try (var output = Files.newOutputStream(file)) { store.store(output, password); }
        System.setProperty("javax.net.ssl.trustStore", file.toString());
        System.setProperty("javax.net.ssl.trustStoreType", "PKCS12");
        System.setProperty("javax.net.ssl.trustStorePassword", new String(password));
    }
}
