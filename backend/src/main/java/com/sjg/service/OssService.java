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

    /** 允许上传的文件类型白名单 */
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        // 图片
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml",
        "image/bmp", "image/tiff",
        // 视频
        "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo",
        // 音频
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/aac",
        // 文档（供批量导入 Excel）
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
    );

    /** 允许的文件扩展名白名单（作为 content-type 的补充校验） */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tiff", ".tif",
        ".mp4", ".webm", ".ogg", ".mov", ".avi",
        ".mp3", ".wav", ".aac",
        ".xlsx", ".xls"
    );

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
    public String upload(MultipartFile file, String directory) throws IOException {
        if (ossClient == null) {
            throw new IOException("OSS client not initialized, check OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET");
        }

        // 校验文件是否为空
        if (file == null || file.isEmpty()) {
            throw new IOException("上传文件不能为空");
        }

        // 校验文件类型
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        // 校验 content-type
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IOException("不支持的文件类型: " + contentType + "。允许的类型: 图片(jpg/png/gif/webp/svg)、视频(mp4/webm)、音频(mp3/wav)");
        }

        // 校验文件扩展名
        if (originalFilename != null) {
            String lowerName = originalFilename.toLowerCase();
            boolean hasAllowedExt = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
            if (!hasAllowedExt) {
                throw new IOException("不支持的文件扩展名。允许: " + String.join(", ", ALLOWED_EXTENSIONS));
            }
        }

        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
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

    @PreDestroy
    public void destroy() {
        if (ossClient != null) {
            ossClient.shutdown();
        }
    }
}
