package com.sjg.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.sjg.entity.User;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.Mac;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    @PostConstruct
    public void initialize() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET 必须配置为至少32字节的随机密钥");
        }
        if (expiration <= 0) throw new IllegalStateException("JWT expiration 必须为正数");
        getSigningKey();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("credentials", credentialFingerprint(user))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean matchesUser(String token, User user) {
        if (user == null || !"approved".equalsIgnoreCase(user.getStatus())) return false;
        try {
            Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
            String value = claims.get("credentials", String.class);
            return user.getUsername().equals(claims.getSubject()) && value != null
                    && MessageDigest.isEqual(value.getBytes(StandardCharsets.UTF_8), credentialFingerprint(user).getBytes(StandardCharsets.UTF_8));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) { return false; }
    }

    private String credentialFingerprint(User user) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(getSigningKey());
            String state = user.getId() + "\u0000" + user.getUsername() + "\u0000" + user.getPassword()
                    + "\u0000" + user.getRole() + "\u0000" + user.getStatus() + "\u0000" + user.getCredentialVersion();
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(state.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) { throw new IllegalStateException("Cannot bind JWT credentials", e); }
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
