package com.sjg.controller.pub;

import com.sjg.dto.ChatRequest;
import com.sjg.dto.LearningFeedbackContext;
import com.sjg.dto.LearningFeedbackRequest;
import com.sjg.dto.LearningSubmissionRequest;
import com.sjg.dto.Result;
import com.sjg.entity.LearningSubmission;
import com.sjg.entity.LearningTask;
import com.sjg.service.ChatService;
import com.sjg.service.ClientIpResolver;
import com.sjg.service.LearningTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@Tag(name = "公开学习任务", description = "一城一课诗词探究任务")
@RestController
@RequestMapping("/api/public/learning-tasks")
public class PublicLearningTaskController {
    private final LearningTaskService taskService;
    private final ChatService chatService;
    private final ClientIpResolver clientIpResolver;

    public PublicLearningTaskController(LearningTaskService taskService, ChatService chatService) {
        this(taskService, chatService, new ClientIpResolver(""));
    }

    @org.springframework.beans.factory.annotation.Autowired
    public PublicLearningTaskController(LearningTaskService taskService, ChatService chatService,
                                        ClientIpResolver clientIpResolver) {
        this.taskService = taskService;
        this.chatService = chatService;
        this.clientIpResolver = clientIpResolver;
    }

    @Operation(summary = "读取已发布学习任务")
    @GetMapping("/{taskCode}")
    public ResponseEntity<Result<LearningTask>> get(@PathVariable String taskCode) {
        LearningTask task = taskService.getPublishedByCode(taskCode);
        if (task == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "学习任务不存在"));
        return ResponseEntity.ok(Result.success(task));
    }

    @Operation(summary = "保存学习成果草稿或提交成果")
    @PostMapping("/{taskCode}/submissions")
    public ResponseEntity<Result<LearningSubmission>> save(
            @PathVariable String taskCode, @RequestBody LearningSubmissionRequest request) {
        try {
            return ResponseEntity.ok(Result.success(taskService.saveSubmission(taskCode, request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        }
    }

    @Operation(summary = "获取反思步骤 AI 反馈", description = "AI 只指出证据覆盖和推理遗漏，不代写答案")
    @PostMapping(value = "/{taskCode}/feedback", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter feedback(@PathVariable String taskCode,
                               @RequestBody LearningFeedbackRequest request,
                               HttpServletRequest http) {
        LearningTask task = taskService.getPublishedByCode(taskCode);
        if (task == null) {
            SseEmitter emitter = new SseEmitter(5000L);
            try { emitter.send(SseEmitter.event().name("error").data(Map.of("error", "学习任务不存在"))); } catch (Exception ignored) { }
            emitter.complete();
            return emitter;
        }
        if (request == null || request.questionId() == null || request.questionId().isBlank()
                || request.answer() == null || request.answer().isBlank()) {
            return errorEmitter("questionId 和 answer 不能为空");
        }
        LearningFeedbackContext context;
        try {
            context = taskService.resolveFeedbackContext(task, request.questionId());
        } catch (IllegalArgumentException e) {
            return errorEmitter(e.getMessage());
        }
        String prompt = "你是诗词探究任务的反馈导师。只做两件事：1）指出回答使用了哪些证据、遗漏了哪些题目要求的证据；2）指出推理中一处可以继续追问的地方。不要替学生改写答案，不要补写没有证据支持的史实。\n"
                + "【问题】\n" + limit(context.question(), 1200)
                + "\n【学生回答】\n" + limit(request.answer(), 4000)
                + "\n【任务证据】\n" + limit(context.evidence(), 3000);
        return chatService.stream(new ChatRequest(prompt, List.of(),
                Map.of("type", "learning_task", "taskCode", taskCode)), clientIpResolver.resolve(http));
    }

    private SseEmitter errorEmitter(String message) {
        SseEmitter emitter = new SseEmitter(5000L);
        try { emitter.send(SseEmitter.event().name("error").data(Map.of("error", message))); } catch (Exception ignored) { }
        emitter.complete();
        return emitter;
    }

    private String limit(String value, int max) {
        if (value == null) return "（未提供）";
        return value.length() > max ? value.substring(0, max) : value;
    }

}
