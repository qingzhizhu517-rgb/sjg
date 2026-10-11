package com.sjg.service;

import com.sjg.exception.BusinessException;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Reject active formats and verify declared extension/type against the file header. */
public final class UploadPolicy {
    private static final Map<String, Set<String>> TYPES = Map.ofEntries(
            Map.entry("png", Set.of("image/png")), Map.entry("jpg", Set.of("image/jpeg", "image/jpg")),
            Map.entry("jpeg", Set.of("image/jpeg", "image/jpg")), Map.entry("gif", Set.of("image/gif")),
            Map.entry("webp", Set.of("image/webp")), Map.entry("bmp", Set.of("image/bmp")),
            Map.entry("tif", Set.of("image/tiff")), Map.entry("tiff", Set.of("image/tiff")),
            Map.entry("mp4", Set.of("video/mp4")), Map.entry("mov", Set.of("video/quicktime")),
            Map.entry("webm", Set.of("video/webm", "audio/webm")), Map.entry("ogg", Set.of("video/ogg", "audio/ogg")),
            Map.entry("avi", Set.of("video/x-msvideo")), Map.entry("wav", Set.of("audio/wav", "audio/x-wav")),
            Map.entry("mp3", Set.of("audio/mpeg", "audio/mp3")), Map.entry("aac", Set.of("audio/aac")),
            Map.entry("xls", Set.of("application/vnd.ms-excel")),
            Map.entry("xlsx", Set.of("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")));
    private UploadPolicy() { }

    public static String validate(MultipartFile file, String directory) throws IOException {
        if (directory == null || !directory.matches("[a-zA-Z0-9_-]+(?:/[a-zA-Z0-9_-]+)*")) throw new BusinessException("上传目录不合法");
        if (file == null || file.isEmpty()) throw new BusinessException("上传文件不能为空");
        String name = file.getOriginalFilename();
        if (name == null || !name.contains(".")) throw new BusinessException("文件必须提供受支持的扩展名");
        String extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        String type = file.getContentType();
        if (type == null || !TYPES.getOrDefault(extension, Set.of()).contains(type.toLowerCase(Locale.ROOT))) throw new BusinessException("文件类型或扩展名不受支持（不允许SVG）");
        byte[] header;
        try (var stream = file.getInputStream()) { header = stream.readNBytes(32); }
        if (!matches(extension, header)) throw new BusinessException("文件内容与声明类型不匹配");
        return "." + extension;
    }

    private static boolean matches(String extension, byte[] h) {
        return switch (extension) {
            case "png" -> starts(h, 137,80,78,71,13,10,26,10);
            case "jpg", "jpeg" -> starts(h,255,216,255);
            case "gif" -> text(h,0,"GIF87a") || text(h,0,"GIF89a");
            case "webp" -> text(h,0,"RIFF") && text(h,8,"WEBP");
            case "bmp" -> text(h,0,"BM");
            case "tif", "tiff" -> starts(h,73,73,42,0) || starts(h,77,77,0,42);
            case "mp4", "mov" -> text(h,4,"ftyp");
            case "webm" -> starts(h,26,69,223,163);
            case "ogg" -> text(h,0,"OggS");
            case "avi" -> text(h,0,"RIFF") && text(h,8,"AVI ");
            case "wav" -> text(h,0,"RIFF") && text(h,8,"WAVE");
            case "mp3" -> text(h,0,"ID3") || h.length > 1 && (h[0]&255)==255 && (h[1]&224)==224;
            case "aac" -> h.length > 1 && (h[0]&255)==255 && (h[1]&246)==240;
            case "xls" -> starts(h,208,207,17,224,161,177,26,225);
            case "xlsx" -> starts(h,80,75,3,4);
            default -> false;
        };
    }
    private static boolean starts(byte[] h, int... expected) {
        if (h.length < expected.length) return false;
        for (int i=0;i<expected.length;i++) if ((h[i]&255)!=expected[i]) return false;
        return true;
    }
    private static boolean text(byte[] h, int offset, String value) {
        return h.length >= offset + value.length() && new String(h, offset, value.length(), StandardCharsets.US_ASCII).equals(value);
    }
}
