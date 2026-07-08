package com.sjg.controller.pub;

import com.sjg.dto.ChatRequest;
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

    public PublicChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * AI 小文对话：提交用户消息与历史，返回 SSE 流式回复。
     * 事件 data 形如 {"delta":"..."} / {"error":"..."}。
     */
    @Operation(summary = "AI小文对话", description = "POST 用户消息，SSE 流式返回回复")
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody ChatRequest req, HttpServletRequest http) {
        return chatService.stream(req, clientIp(http));
    }

    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("x-forwarded-for");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String real = req.getHeader("x-real-ip");
        if (real != null && !real.isBlank()) {
            return real;
        }
        return req.getRemoteAddr();
    }
}
