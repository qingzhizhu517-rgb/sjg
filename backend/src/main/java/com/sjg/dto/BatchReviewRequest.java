package com.sjg.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BatchReviewRequest(
        @NotEmpty(message = "请选择待审核记录")
        @Size(max = 100, message = "每批最多审核100条记录")
        List<@NotNull @Positive Long> reviewIds,
        @Size(max = 500, message = "审核备注最多500字") String reviewNote, boolean allowUnreferenced) {
    public BatchReviewRequest(List<Long> reviewIds, String reviewNote) {
        this(reviewIds, reviewNote, false);
    }
}
