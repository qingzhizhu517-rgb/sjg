package com.sjg.dto;

/**
 * 服务端根据已发布学习任务重建的反馈上下文。
 */
public record LearningFeedbackContext(String question, String evidence) {
}
