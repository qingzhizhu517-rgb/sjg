package com.sjg.dto;

import java.util.List;

public record BatchReviewResult(int total, int successCount, int failureCount, List<Item> items) {
    public BatchReviewResult {
        items = List.copyOf(items);
    }

    public record Item(Long reviewId, String entityType, Long entityId, boolean success,
                       String status, String message) {
    }
}
