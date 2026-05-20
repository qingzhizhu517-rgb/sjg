package com.sjg;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.sjg.mapper")
public class SjgApplication {
    public static void main(String[] args) {
        SpringApplication.run(SjgApplication.class, args);
    }
}
