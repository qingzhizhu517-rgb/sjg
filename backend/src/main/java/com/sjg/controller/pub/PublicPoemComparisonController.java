package com.sjg.controller.pub;

import com.sjg.dto.PoemComparisonRequest;
import com.sjg.service.ClientIpResolver;
import com.sjg.service.PoemComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/public/poems")
public class PublicPoemComparisonController {

    private final PoemComparisonService service;
    private final ClientIpResolver clientIpResolver;

    public PublicPoemComparisonController(PoemComparisonService service, ClientIpResolver clientIpResolver) {
        this.service = service;
        this.clientIpResolver = clientIpResolver;
    }

    @Operation(summary = "两篇诗词对照阅读", description = "服务端读取已发布原文与来源，SSE 返回阅读线索或个人思考反馈")
    @PostMapping(value = "/compare", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter compare(@RequestBody(required = false) PoemComparisonRequest request,
                              HttpServletRequest http) {
        return service.stream(request, clientIpResolver.resolve(http));
    }
}
