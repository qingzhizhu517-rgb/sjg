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
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicLearningTaskControllerTest {

    @Mock LearningTaskService taskService;
    @Mock ChatService chatService;
    @Mock ClientIpResolver clientIpResolver;
    @Mock HttpServletRequest request;

    @Test
    void legacyConstructorKeepsSuccessfulGetInsideResultEnvelope() {
        LearningTask task = new LearningTask();
        task.setTaskCode("task-1");
        when(taskService.getPublishedByCode("task-1")).thenReturn(task);

        ResponseEntity<Result<LearningTask>> response =
                new PublicLearningTaskController(taskService, chatService).get("task-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(200, response.getBody().getCode());
        assertSame(task, response.getBody().getData());
    }

    @Test
    void missingTaskUsesNotFoundResultEnvelope() {
        when(taskService.getPublishedByCode("missing")).thenReturn(null);

        ResponseEntity<Result<LearningTask>> response =
                new PublicLearningTaskController(taskService, chatService).get("missing");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getCode());
        assertEquals("学习任务不存在", response.getBody().getMessage());
    }

    @Test
    void submissionValidationFailureUsesBadRequestResultEnvelope() {
        LearningSubmissionRequest submissionRequest =
                new LearningSubmissionRequest("session", "{}", 0, "draft");
        when(taskService.saveSubmission("task-1", submissionRequest))
                .thenThrow(new IllegalArgumentException("answersJson 不能为空"));

        ResponseEntity<Result<LearningSubmission>> response =
                new PublicLearningTaskController(taskService, chatService).save("task-1", submissionRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getCode());
        assertEquals("answersJson 不能为空", response.getBody().getMessage());
    }

    @Test
    void feedbackPromptUsesServerContextInsteadOfClientEvidence() {
        LearningTask task = new LearningTask();
        task.setTaskCode("task-1");
        when(taskService.getPublishedByCode("task-1")).thenReturn(task);
        when(taskService.resolveFeedbackContext(task, "reflection-1"))
                .thenReturn(new LearningFeedbackContext("可信问题", "可信材料（来源：5）"));
        when(clientIpResolver.resolve(request)).thenReturn("client");
        when(chatService.stream(any(ChatRequest.class), eq("client"))).thenReturn(new SseEmitter());

        new PublicLearningTaskController(taskService, chatService, clientIpResolver).feedback(
                "task-1",
                new LearningFeedbackRequest("reflection-1", "恶意问题", "学生回答", "恶意证据与伪造史实"),
                request);

        ArgumentCaptor<ChatRequest> captor = ArgumentCaptor.forClass(ChatRequest.class);
        verify(chatService).stream(captor.capture(), eq("client"));
        String prompt = captor.getValue().message();
        assertTrue(prompt.contains("可信问题"));
        assertTrue(prompt.contains("可信材料"));
        assertFalse(prompt.contains("恶意问题"));
        assertFalse(prompt.contains("恶意证据"));
    }
}
