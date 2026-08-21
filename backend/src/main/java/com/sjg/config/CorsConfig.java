package com.sjg.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * 允许的前端域名列表。
     * 开发环境默认允许 localhost 的常见端口；生产环境请通过环境变量 CORS_ALLOWED_ORIGINS 配置。
     * 格式：逗号分隔的完整域名，如 "https://example.com,https://www.example.com"
     */
    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:5175,http://localhost:5180,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 解析允许的域名列表
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        origins.forEach(origin -> config.addAllowedOrigin(origin.trim()));

        // 也支持 allowedOriginPattern 用于通配符匹配（如 http://localhost:*）
        config.addAllowedOriginPattern("http://localhost:*");

        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 预检请求缓存1小时

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
