package com.sjg.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class OssService {

    @Value("${oss.endpoint}")
    private String endpoint;
    @Value("${oss.access-key-id}")
    private String accessKeyId;
    @Value("${oss.access-key-secret}")
    private String accessKeySecret;
    @Value("${oss.bucket-name}")
    private String bucketName;

    private volatile OSS ossClient;

    @PostConstruct
    public void init() {
        if (accessKeyId != null && accessKeySecret != null) {
            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        }
    }

    public String upload(MultipartFile file, String directory) throws IOException {
        if (ossClient == null) {
            throw new IOException("OSS client not initialized, check OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET");
        }
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String objectName = directory + "/" + UUID.randomUUID() + extension;
        try (var is = file.getInputStream()) {
            ossClient.putObject(bucketName, objectName, is);
        }
        return "https://" + bucketName + "." + endpoint + "/" + objectName;
    }

    @PreDestroy
    public void destroy() {
        if (ossClient != null) {
            ossClient.shutdown();
        }
    }
}
