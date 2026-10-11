package com.sjg.service;

import com.sjg.entity.User;
import com.sjg.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;

class JwtCredentialBindingTest {
    private JwtUtil jwt() {
        JwtUtil jwt = new JwtUtil();
        ReflectionTestUtils.setField(jwt, "secret", "test-only-32-byte-random-signing-secret");
        ReflectionTestUtils.setField(jwt, "expiration", 3600000L);
        return jwt;
    }
    private User user() {
        User user = new User(); user.setId(1L); user.setUsername("reader");
        user.setPassword("bcrypt-hash"); user.setStatus("approved"); user.setRole("user"); return user;
    }
    @Test void passwordAndRoleChangesInvalidatePreviouslyIssuedToken() {
        var jwt = jwt(); var user = user(); String token = jwt.generateToken(user);
        assertTrue(jwt.matchesUser(token, user));
        user.setPassword("new-bcrypt-hash"); assertFalse(jwt.matchesUser(token, user));
        user.setPassword("bcrypt-hash"); user.setRole("admin"); assertFalse(jwt.matchesUser(token, user));
        user.setRole("user"); user.setId(2L); assertFalse(jwt.matchesUser(token, user));
    }
    @Test void weakSigningSecretFailsAtInitialization() {
        var jwt = jwt(); ReflectionTestUtils.setField(jwt, "secret", "short");
        assertThrows(IllegalStateException.class, jwt::initialize);
    }
}
