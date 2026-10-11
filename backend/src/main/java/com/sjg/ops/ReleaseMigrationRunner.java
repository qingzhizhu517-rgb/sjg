package com.sjg.ops;

import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import java.sql.Connection;
import java.sql.DriverManager;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

/** Railway pre-deploy only: does not import snapshots or alter publication states. */
public final class ReleaseMigrationRunner {
    private static final List<String> MIGRATIONS = List.of("V35__user_credential_version.sql", "V36__rag_fulltext_indexes.sql");
    private ReleaseMigrationRunner() { }
    public static void main(String[] args) throws Exception {
        String revision = required("SJG_RELEASE_REVISION");
        if (!revision.matches("[a-fA-F0-9]{40}") || !revision.equals(required("SJG_BACKUP_CONFIRMED"))) {
            throw new IllegalStateException("Release requires a matching backup confirmation");
        }
        DatabaseTls.configureFromEnvironment();
        try (Connection connection = DriverManager.getConnection(required("SPRING_DATASOURCE_URL"),
                required("SPRING_DATASOURCE_USERNAME"), required("SPRING_DATASOURCE_PASSWORD"))) {
            migrate(connection, revision);
        } catch (java.sql.SQLException e) {
            System.err.println("Database migration connection failed: SQLState=" + e.getSQLState());
            System.exit(1);
        }
    }

    public static void migrate(Connection connection, String revision) throws Exception {
        try (var lock = connection.createStatement(); var result = lock.executeQuery("SELECT GET_LOCK('sjg_release_migration', 30)")) {
            if (!result.next() || result.getInt(1) != 1) throw new IllegalStateException("Migration lock unavailable");
        }
        try {
            try (var statement = connection.createStatement()) {
                // Refuse an empty or wrong target database; fresh installation is a separate operation.
                statement.executeQuery("SELECT id FROM user LIMIT 1").close();
                statement.executeQuery("SELECT entity_type FROM content_review LIMIT 1").close();
                statement.execute("CREATE TABLE IF NOT EXISTS _sjg_release_migration (filename VARCHAR(120) PRIMARY KEY, checksum CHAR(64) NOT NULL, release_revision CHAR(40) NOT NULL, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            }
            for (String filename : MIGRATIONS) {
                var resource = new ClassPathResource("db/migration/" + filename);
                String checksum;
                try (var stream = resource.getInputStream()) {
                    checksum = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(stream.readAllBytes()));
                }
                try (var statement = connection.prepareStatement("SELECT checksum FROM _sjg_release_migration WHERE filename=?")) {
                    statement.setString(1, filename);
                    try (var previous = statement.executeQuery()) {
                        if (previous.next()) {
                            if (!checksum.equals(previous.getString(1))) throw new IllegalStateException("Applied migration checksum changed: " + filename);
                            continue;
                        }
                    }
                }
                ScriptUtils.executeSqlScript(connection, resource);
                try (var statement = connection.prepareStatement("INSERT INTO _sjg_release_migration(filename,checksum,release_revision) VALUES(?,?,?)")) {
                    statement.setString(1, filename); statement.setString(2, checksum); statement.setString(3, revision); statement.executeUpdate();
                }
                System.out.println("Release migration applied: " + filename);
            }
        } finally {
            try (var statement = connection.createStatement()) { statement.executeQuery("SELECT RELEASE_LOCK('sjg_release_migration')").close(); }
        }
    }
    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException("Missing required variable: " + name);
        return value;
    }
}
