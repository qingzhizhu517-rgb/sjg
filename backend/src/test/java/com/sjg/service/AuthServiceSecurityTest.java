package com.sjg.service;

import com.sjg.dto.LoginRequest;
import com.sjg.dto.RegisterRequest;
import com.sjg.dto.ResetPasswordRequest;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import com.sjg.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceSecurityTest {
    private final UserMapper users = mock(UserMapper.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final AuthService auth = new AuthService(users, encoder, mock(JwtUtil.class));

    @Test
    void sixthLoginAttemptIsLimitedBeforeDatabaseLookup() {
        LoginRequest request = new LoginRequest();
        request.setUsername("someone");
        request.setPassword("wrong");
        for (int i = 0; i < 5; i++) assertThrows(RuntimeException.class, () -> auth.login(request));
        RuntimeException error = assertThrows(RuntimeException.class, () -> auth.login(request));
        assertTrue(error.getMessage().contains("频繁"));
        verify(users, times(5)).selectOne(any());
    }

    @Test
    void registrationRejectsShortPasswordBeforeDatabaseLookup() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("reader");
        request.setPassword("short123");
        assertThrows(RuntimeException.class, () -> auth.register(request));
        verifyNoInteractions(users);
    }

    @Test
    void administratorResetUsesTheSamePasswordPolicy() {
        User user = new User(); user.setId(1L);
        when(users.selectById(1L)).thenReturn(user);
        ResetPasswordRequest request = new ResetPasswordRequest(); request.setNewPassword("abc123");
        assertThrows(RuntimeException.class, () -> new UserService(users, encoder).resetPassword(1L, request));
        verify(users, never()).updateById(any(User.class));
    }
}
