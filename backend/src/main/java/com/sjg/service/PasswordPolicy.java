package com.sjg.service;

import com.sjg.exception.BusinessException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Set;

public final class PasswordPolicy {
    private static final Set<String> BLOCKED = Set.of("123456789012345", "1234567890123456",
            "password12345678", "password123456789", "qwertyuiopasdfgh", "administrator123",
            "abcdefghijklmno", "000000000000000", "111111111111111", "letmein123456789");
    private PasswordPolicy() { }
    public static void validate(String password) {
        if (password == null || password.isBlank()) throw new BusinessException("密码不能为空");
        if (password.codePointCount(0, password.length()) < 15) throw new BusinessException("密码长度不能少于15个字符，可使用易记的长短语");
        // BCrypt's byte limit must be checked before hashing to avoid silent truncation.
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) throw new BusinessException("密码的UTF-8编码不能超过72字节");
        String normalized = password.toLowerCase(Locale.ROOT);
        if (BLOCKED.contains(normalized) || password.codePoints().distinct().count() < 3) {
            throw new BusinessException("请勿使用常见弱口令或重复字符密码");
        }
    }
}
