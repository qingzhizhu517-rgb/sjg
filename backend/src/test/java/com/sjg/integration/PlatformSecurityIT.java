package com.sjg.integration;

import com.sjg.dto.*;
import com.sjg.entity.Poem;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import com.sjg.service.*;
import com.sjg.util.JwtUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.mysql.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.*;
import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"jwt.secret=test-only-integration-signing-key-32-bytes", "llm.api-key=", "oss.access-key-id="})
class PlatformSecurityIT {
    @Container static final MySQLContainer database = new MySQLContainer("mysql:8.4")
            .withDatabaseName("sjg_integration").withInitScript("integration-schema.sql");
    @DynamicPropertySource static void databaseProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", database::getJdbcUrl);
        properties.add("spring.datasource.username", database::getUsername);
        properties.add("spring.datasource.password", database::getPassword);
    }
    @Autowired AuthService auth;
    @Autowired UserService userService;
    @Autowired UserMapper users;
    @Autowired JwtUtil jwt;
    @Autowired PoemService poems;
    @Autowired ContentReviewService reviews;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper json;
    @Autowired javax.sql.DataSource dataSource;
    @Value("${local.server.port}") int port;
    private final HttpClient client = HttpClient.newHttpClient();

    private HttpResponse<String> get(String path, String token) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:"+port+path));
        if (token != null) request.header("Authorization", "Bearer "+token);
        return client.send(request.GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    private User register(String username) {
        RegisterRequest request = new RegisterRequest(); request.setUsername(username); request.setPassword("the river carries poetry 2026");
        auth.register(request, username);
        return users.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
    }

    @Test void approvalAndPasswordResetAreEnforcedByTheRealSecurityFilter() throws Exception {
        User user = register("it-reader");
        LoginRequest login = new LoginRequest(); login.setUsername(user.getUsername()); login.setPassword("the river carries poetry 2026");
        assertThrows(RuntimeException.class, () -> auth.login(login, "reader-login"));
        userService.approve(user.getId());
        String token = auth.login(login, "reader-login").getToken();
        assertEquals(403, get("/api/admin/users", token).statusCode());
        ResetPasswordRequest reset = new ResetPasswordRequest(); reset.setNewPassword("new river reading phrase 2026");
        userService.resetPassword(user.getId(), reset);
        assertEquals(401, get("/api/admin/users", token).statusCode());
        assertFalse(jwt.matchesUser(token, users.selectById(user.getId())));
    }

    @Test void publicationAndEditingAreVisibleThroughActualMysqlQueriesAndHttp() throws Exception {
        Poem poem = new Poem(); poem.setTitle("it-published-poem"); poem.setContent("黄河之水天上来");
        poems.create(poem);
        assertTrue(poems.listPublished(1,20,"it-published-poem",null).getRecords().isEmpty());
        jdbc.update("INSERT INTO source_document(source_type,title) VALUES('book','integration source')");
        Long source = jdbc.queryForObject("SELECT id FROM source_document LIMIT 1", Long.class);
        jdbc.update("INSERT INTO content_source_link(entity_type,entity_id,source_document_id) VALUES('poem',?,?)", poem.getId(),source);
        reviews.transition("poem",poem.getId(),"approved",null,"verified");
        reviews.transition("poem",poem.getId(),"published",null,"verified");
        var response = get("/api/public/poems?keyword=it-published-poem", null);
        assertEquals(200,response.statusCode());
        assertEquals(1,json.readTree(response.body()).path("data").path("records").size());
        poems.update(poem.getId(),poem);
        assertTrue(poems.listPublished(1,20,"it-published-poem",null).getRecords().isEmpty());
    }

    @Test void healthIsPublicButOperationalAndSchemaDetailsRequireAdmin() throws Exception {
        assertEquals(200,get("/actuator/health",null).statusCode());
        assertEquals("backend",json.readTree(get("/api/public/deployment",null).body()).path("data").path("service").asText());
        assertFalse(get("/actuator/health",null).body().contains("components"));
        assertEquals(401,get("/actuator/prometheus",null).statusCode());
        assertEquals(401,get("/v3/api-docs",null).statusCode());
        User admin = register("it-admin"); userService.approve(admin.getId());
        jdbc.update("UPDATE user SET role='admin' WHERE id=?",admin.getId());
        String token = jwt.generateToken(users.selectById(admin.getId()));
        assertEquals(200,get("/actuator/prometheus",token).statusCode());
        assertEquals(200,get("/v3/api-docs",token).statusCode());
        userService.disable(admin.getId()); userService.enable(admin.getId());
        assertEquals(401,get("/actuator/prometheus",token).statusCode());
    }

    @Test void securityMigrationsAreIdempotentAndNgramSearchUsesARealIndex() throws Exception {
        try (var connection = dataSource.getConnection()) {
            for (int pass=0;pass<2;pass++) {
                for (String migration : java.util.List.of("V35__user_credential_version.sql","V36__rag_fulltext_indexes.sql")) {
                    org.springframework.jdbc.datasource.init.ScriptUtils.executeSqlScript(connection,
                            new org.springframework.core.io.ClassPathResource("db/migration/"+migration));
                }
            }
        }
        jdbc.update("INSERT INTO poem(title,content) VALUES('ngram-test','齐鲁沧浪文化')");
        Long hits = jdbc.queryForObject("SELECT COUNT(*) FROM poem WHERE MATCH(title,content,background) AGAINST (? IN NATURAL LANGUAGE MODE)",Long.class,"沧浪");
        assertEquals(1L,hits);
        var plan=jdbc.queryForList("EXPLAIN SELECT * FROM poem WHERE MATCH(title,content,background) AGAINST (? IN NATURAL LANGUAGE MODE)","沧浪");
        assertEquals("fulltext",plan.get(0).get("type"));
        String revision = "a".repeat(40);
        try (var connection = dataSource.getConnection()) {
            com.sjg.ops.ReleaseMigrationRunner.migrate(connection, revision);
            com.sjg.ops.ReleaseMigrationRunner.migrate(connection, revision);
        }
        assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM _sjg_release_migration", Integer.class));
        jdbc.update("UPDATE _sjg_release_migration SET checksum=? WHERE filename=?", "0".repeat(64), "V35__user_credential_version.sql");
        try (var connection = dataSource.getConnection()) {
            assertThrows(IllegalStateException.class, () -> com.sjg.ops.ReleaseMigrationRunner.migrate(connection, revision));
        }
    }

    @Test void publicReadPerformanceHasARepeatableSmallDatasetBudget() throws Exception {
        var builder = new ProcessBuilder("node","scripts/perf-check.mjs","http://localhost:"+port);
        builder.directory(java.nio.file.Path.of(System.getProperty("user.dir")).getParent().toFile());
        builder.redirectErrorStream(true);
        var process=builder.start();
        String report=new String(process.getInputStream().readAllBytes(),java.nio.charset.StandardCharsets.UTF_8);
        assertEquals(0,process.waitFor(),report);
    }
}
