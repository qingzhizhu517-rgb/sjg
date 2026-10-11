package com.sjg.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
public class ProductionConfigurationGuard {
    private final Environment environment;
    public ProductionConfigurationGuard(Environment environment) { this.environment = environment; }
    @PostConstruct
    public void validate() {
        String origins = environment.getProperty("cors.allowed-origins", "");
        if (origins.isBlank()) throw new IllegalStateException("生产环境必须配置 CORS_ALLOWED_ORIGINS");
        for (String origin : origins.split(",")) {
            if (!origin.trim().matches("https://[A-Za-z0-9.-]+(?::[0-9]+)?")) {
                throw new IllegalStateException("生产CORS仅允许明确的HTTPS域名");
            }
        }
        String url = environment.getProperty("spring.datasource.url", "");
        if (!url.contains("sslMode=VERIFY_IDENTITY")) {
            throw new IllegalStateException("生产数据库连接必须配置sslMode=VERIFY_IDENTITY与可信CA");
        }
        if (environment.getProperty("spring.datasource.password", "").isBlank()) {
            throw new IllegalStateException("生产环境必须配置数据库凭据");
        }
    }
}
