package com.sjg.dto;

import java.util.List;

public record EvidenceSnippet(
        String entityType,
        Long entityId,
        String title,
        String snippet,
        List<Long> sourceIds,
        double score
) {
}
