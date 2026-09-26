package com.sjg.controller.pub;

import com.sjg.dto.ChatRequest;
import com.sjg.dto.ChatFeedbackRequest;
import com.sjg.dto.Result;
import com.sjg.service.AiAuditService;
import com.sjg.service.ClientIpResolver;
import com.sjg.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * AI 小文公开对话接口（SSE 流式，无需认证）。
 * 路径 /api/public/chat 已在 SecurityConfig 中 permitAll。
 */
@Tag(name = "公开AI对话", description = "AI小文对话接口（SSE流式，无需认证）")
@RestController
@RequestMapping("/api/public")
public class PublicChatController {

    private final ChatService chatService;
    private final AiAuditService auditService;
    private final ClientIpResolver clientIpResolver;

    public PublicChatController(ChatService chatService, AiAuditService auditService) {
        this(chatService, auditService, new ClientIpResolver(""));
    }

    @org.springframework.beans.factory.annotation.Autowired
    public PublicChatController(ChatService chatService, AiAuditService auditService,
                                ClientIpResolver clientIpResolver) {
        this.chatService = chatService;
        this.auditService = auditService;
        this.clientIpResolver = clientIpResolver;
    }

    /**
     * AI 小文对话：提交用户消息与历史，返回 SSE 流式回复。
     * 事件 data 形如 {"delta":"..."} / {"error":"..."}。
     */
    @Operation(summary = "AI小文对话", description = "POST 用户消息，SSE 流式返回回复")
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody ChatRequest req, HttpServletRequest http) {
        return chatService.stream(req, clientIpResolver.resolve(http));
    }

    @Operation(summary = "提交AI回复反馈", description = "记录有帮助、无帮助或事实错误反馈")
    @PostMapping("/chat/feedback")
    public Result<Void> feedback(@RequestBody ChatFeedbackRequest request) {
        try {
            auditService.recordFeedback(request == null ? null : request.auditId(),
                    request == null ? null : request.feedback(),
                    request == null ? null : request.comment());
            return Result.success();
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        }
    }

}
