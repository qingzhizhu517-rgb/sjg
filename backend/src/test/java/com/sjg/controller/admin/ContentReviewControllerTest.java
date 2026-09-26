package com.sjg.controller.admin;

import com.sjg.dto.Result;
import com.sjg.entity.ContentReview;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import com.sjg.service.ContentReviewService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ContentReviewControllerTest {

    private final ContentReviewService service = mock(ContentReviewService.class);
    private final UserMapper userMapper = mock(UserMapper.class);

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void usesAuthenticatedAdminIdInsteadOfClientReviewerId() {
        User admin = new User();
        admin.setId(42L);
        admin.setUsername("admin");
        when(userMapper.selectOne(any())).thenReturn(admin);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "n/a",
                        List.of(new SimpleGrantedAuthority("admin"))));

        ContentReview saved = new ContentReview();
        when(service.transition("poem", 1L, ContentReview.PUBLISHED, 42L, "已核验"))
                .thenReturn(saved);

        ResponseEntity<Result<ContentReview>> response = controller().transition(
                "poem", 1L,
                Map.of("status", ContentReview.PUBLISHED, "reviewerId", 999L, "reviewNote", "已核验"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(service).transition("poem", 1L, ContentReview.PUBLISHED, 42L, "已核验");
        verify(service, never()).transition(eq("poem"), eq(1L), eq(ContentReview.PUBLISHED),
                eq(999L), eq("已核验"));
    }

    @Test
    void rejectsReviewTransitionWhenAuthenticatedAdminCannotBeResolved() {
        SecurityContextHolder.clearContext();

        ResponseEntity<Result<ContentReview>> response = controller().transition(
                "poem", 1L,
                Map.of("status", ContentReview.NEEDS_REVIEW, "reviewerId", 999L));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals(401, response.getBody().getCode());
        verify(service, never()).transition(any(), any(), any(), any(), any());
    }

    private ContentReviewController controller() {
        return new ContentReviewController(service, userMapper);
    }
}
