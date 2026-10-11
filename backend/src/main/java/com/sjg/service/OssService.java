package com.sjg.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.ObjectMetadata;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
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

    private final java.util.Map<String, Quota> quotas = new java.util.HashMap<>();
    private record Quota(java.time.LocalDate day, long bytes, int count) { }

    @PostConstruct
    public void init() {
        if (!isBlank(accessKeyId) && !isBlank(accessKeySecret) && !isBlank(endpoint) && !isBlank(bucketName)) {
            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * 上传文件到 OSS，包含文件类型白名单校验
     */
    public String upload(MultipartFile file, String directory) throws IOException { return upload(file, directory, "internal"); }

    public String upload(MultipartFile file, String directory, String account) throws IOException {
        if (ossClient == null) {
            throw new IOException("OSS client not initialized, check OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET");
        }

        String extension = UploadPolicy.validate(file, directory);
        reserveQuota(account, file.getSize());
        String contentType = file.getContentType();
        String objectName = directory + "/" + UUID.randomUUID() + extension;
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setHeader("x-oss-object-acl", "public-read");
        // 设置正确的 content-type
        if (contentType != null) {
            metadata.setContentType(contentType);
        }
        try (var is = file.getInputStream()) {
            ossClient.putObject(bucketName, objectName, is, metadata);
        }
        return "https://" + bucketName + "." + endpoint + "/" + objectName;
    }

    private synchronized void reserveQuota(String account, long bytes) {
        java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
        quotas.entrySet().removeIf(e -> !e.getValue().day().equals(today));
        Quota old = quotas.getOrDefault(account, new Quota(today, 0, 0));
        if (old.count() >= 50 || bytes > 200L * 1024 * 1024 || old.bytes() + bytes > 1024L * 1024 * 1024) {
            throw new com.sjg.exception.BusinessException("上传额度已达上限（每日50次/1GiB，单文件200MiB）");
        }
        quotas.put(account, new Quota(today, old.bytes() + bytes, old.count() + 1));
    }

    @PreDestroy
    public void destroy() {
        if (ossClient != null) {
            ossClient.shutdown();
        }
    }
}
