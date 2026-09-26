package com.sjg.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.PageResult;
import com.sjg.dto.Result;
import com.sjg.entity.ContentReview;
import com.sjg.entity.ContentSourceLink;
import com.sjg.entity.SourceDocument;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import com.sjg.service.ContentReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "内容来源与审核", description = "来源文献关联和内容审核状态流转（管理员）")
@RestController
@RequestMapping("/api/admin")
public class ContentReviewController {

    private final ContentReviewService service;
    private final UserMapper userMapper;

    /** 保留轻量构造器，兼容不需要认证解析的旧单元测试和调用方。 */
    public ContentReviewController(ContentReviewService service) {
        this(service, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public ContentReviewController(ContentReviewService service, UserMapper userMapper) {
        this.service = service;
        this.userMapper = userMapper;
    }

    @Operation(summary = "分页查询审核记录")
    @GetMapping("/content-reviews")
    public ResponseEntity<Result<PageResult<ContentReview>>> listReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(Result.success(service.listReviews(page, size, entityType, status)));
    }

    @Operation(summary = "查询实体审核记录")
    @GetMapping("/content-reviews/{entityType}/{entityId}")
    public ResponseEntity<Result<ContentReview>> getReview(
            @PathVariable String entityType, @PathVariable Long entityId) {
        ContentReview review = service.getReview(entityType, entityId);
        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "审核记录不存在"));
        }
        return ResponseEntity.ok(Result.success(review));
    }

    @Operation(summary = "流转审核状态", description = "按 draft -> needs_review -> approved -> published -> archived 顺序流转")
    @PutMapping("/content-reviews/{entityType}/{entityId}")
    public ResponseEntity<Result<ContentReview>> transition(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestBody Map<String, Object> body) {
        Long reviewerId = resolveAuthenticatedReviewerId();
        if (reviewerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Result.error(401, "未登录或无法确定当前审核人"));
        }
        try {
            String status = body == null ? null : stringValue(body.get("status"));
            String reviewNote = body == null ? null : stringValue(body.get("reviewNote"));
            return ResponseEntity.ok(Result.success(
                    service.transition(entityType, entityId, status, reviewerId, reviewNote)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Result.error(409, e.getMessage()));
        }
    }

    @Operation(summary = "分页查询来源文献")
    @GetMapping("/source-documents")
    public ResponseEntity<Result<PageResult<SourceDocument>>> listSources(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(Result.success(service.listSources(page, size, keyword)));
    }

    @Operation(summary = "创建来源文献")
    @PostMapping("/source-documents")
    public ResponseEntity<Result<SourceDocument>> createSource(@RequestBody SourceDocument source) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(Result.success(service.createSource(source)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        }
    }

    @Operation(summary = "编辑来源文献")
    @PutMapping("/source-documents/{id}")
    public ResponseEntity<Result<SourceDocument>> updateSource(
            @PathVariable Long id, @RequestBody SourceDocument source) {
        try {
            return ResponseEntity.ok(Result.success(service.updateSource(id, source)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        }
    }

    @Operation(summary = "查询实体的来源关联")
    @GetMapping("/source-links/{entityType}/{entityId}")
    public ResponseEntity<Result<java.util.List<com.sjg.dto.SourceSummary>>> listLinks(
            @PathVariable String entityType, @PathVariable Long entityId) {
        try {
            return ResponseEntity.ok(Result.success(service.listSourceSummaries(entityType, entityId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        }
    }

    @Operation(summary = "关联实体与来源文献")
    @PostMapping("/source-links")
    public ResponseEntity<Result<ContentSourceLink>> linkSource(@RequestBody ContentSourceLink link) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(Result.success(service.linkSource(link)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        }
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    /**
     * 审核人必须来自当前已认证的管理员，而不是请求体中的可伪造字段。
     * SecurityConfig 将用户名放入 principal，因此这里再通过用户表解析稳定的用户 ID。
     */
    private Long resolveAuthenticatedReviewerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !hasAdminAuthority(authentication) || userMapper == null) {
            return null;
        }
        String username = authentication.getName();
        if (username == null || username.isBlank() || "anonymousUser".equals(username)) return null;
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username));
        if (user == null || user.getId() == null || user.getId() <= 0) return null;
        return user.getId();
    }

    private boolean hasAdminAuthority(Authentication authentication) {
        return authentication.getAuthorities().stream().anyMatch(authority -> {
            String value = authority == null ? null : authority.getAuthority();
            return "admin".equalsIgnoreCase(value) || "ROLE_ADMIN".equalsIgnoreCase(value);
        });
    }
}
