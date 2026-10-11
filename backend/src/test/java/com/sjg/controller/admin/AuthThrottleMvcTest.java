package com.sjg.controller.admin;

import com.sjg.config.GlobalExceptionHandler;
import com.sjg.mapper.UserMapper;
import com.sjg.service.*;
import com.sjg.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthThrottleMvcTest {
    @Test void rotatingIpCannotBypassTheAccountLimitAndResponseHasRetryAfter() throws Exception {
        UserMapper users = mock(UserMapper.class);
        var service = new AuthService(users,new BCryptPasswordEncoder(),mock(JwtUtil.class));
        var mvc = MockMvcBuilders.standaloneSetup(new AuthController(service,new ClientIpResolver("")))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        for (int attempt=0; attempt<6; attempt++) {
            final int index=attempt;
            var result = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"username\":\"reader\",\"password\":\"wrong\"}")
                    .with(request -> { request.setRemoteAddr("203.0.113."+(index+1)); return request; }));
            if (attempt<5) result.andExpect(status().isBadRequest());
            else result.andExpect(status().isTooManyRequests()).andExpect(jsonPath("$.code").value(429))
                    .andExpect(header().string("Retry-After","60"));
        }
        verify(users,times(5)).selectOne(any());
    }
    @Test void rotatingAccountCannotBypassTheIpLimit() throws Exception {
        var service = new AuthService(mock(UserMapper.class),new BCryptPasswordEncoder(),mock(JwtUtil.class));
        var mvc = MockMvcBuilders.standaloneSetup(new AuthController(service,new ClientIpResolver("")))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        for (int attempt=0;attempt<6;attempt++) {
            var result=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"username\":\"reader"+attempt+"\",\"password\":\"wrong\"}"));
            if(attempt<5) result.andExpect(status().isBadRequest());
            else result.andExpect(status().isTooManyRequests());
        }
    }
}
