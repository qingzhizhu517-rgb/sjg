package com.sjg;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.sjg.mapper")
public class SjgApplication {
    public static void main(String[] args) {
        // 清除可能被 IDE / 环境误注入的代理系统属性，避免 MySQL(StandardSocketFactory 读
        // socksProxyHost) 与 LLM HttpClient 走已失效的 SOCKS 代理导致 "Can't connect to SOCKS proxy"。
        // 本项目 DB 在阿里云、国产大模型直连，均不需要代理；如某外呼确需代理，请在对应 client 内单独配置。
        clearProxySystemProperties();
        SpringApplication.run(SjgApplication.class, args);
    }

    private static void clearProxySystemProperties() {
        // 关闭读取操作系统级代理设置（防止 Clash 等开启 macOS 系统 SOCKS 代理）
        System.setProperty("java.net.useSystemProxies", "false");
        String[] keys = {
                "socksProxyHost", "socksProxyPort",
                "http.proxyHost", "http.proxyPort",
                "https.proxyHost", "https.proxyPort"
        };
        for (String k : keys) {
            if (System.getProperty(k) != null) {
                System.clearProperty(k);
            }
        }
    }
}
