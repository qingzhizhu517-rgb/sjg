package com.sjg.service;

import com.sjg.dto.BatchReviewRequest;
import com.sjg.dto.BatchReviewResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

/** 批次不持有事务；通过另一个Spring bean逐条提交，单条失败不会回滚整批。 */
@Service
public class BatchContentReviewService {
    private static final Logger LOG = LoggerFactory.getLogger(BatchContentReviewService.class);
    private final ContentReviewService reviews;

    public BatchContentReviewService(ContentReviewService reviews) {
        this.reviews = reviews;
    }

    public BatchReviewResult approveAndPublish(BatchReviewRequest request, Long reviewerId) {
        var results = new ArrayList<BatchReviewResult.Item>();
        Set<Long> seen = new HashSet<>();
        int successes = 0;
        for (Long id : request.reviewIds()) {
            if (!seen.add(id)) {
                results.add(failure(id, "重复选择的审核记录"));
                continue;
            }
            try {
                var published = request.allowUnreferenced()
                        ? reviews.approveAndPublish(id, reviewerId, request.reviewNote(), true)
                        : reviews.approveAndPublish(id, reviewerId, request.reviewNote());
                results.add(new BatchReviewResult.Item(id, published.getEntityType(), published.getEntityId(),
                        true, published.getStatus(), published.getReviewNote() != null
                                && published.getReviewNote().startsWith("[来源待补充]")
                                ? "已发布到用户端（来源待补充）" : "审核通过，已发布到用户端"));
                successes++;
            } catch (IllegalArgumentException | IllegalStateException error) {
                results.add(failure(id, error.getMessage()));
            } catch (RuntimeException error) {
                LOG.error("Batch review failed: reviewId={}, reviewerId={}", id, reviewerId, error);
                results.add(failure(id, "处理失败，请刷新队列核对后重试"));
            }
        }
        return new BatchReviewResult(results.size(), successes, results.size() - successes, results);
    }

    private BatchReviewResult.Item failure(Long id, String message) {
        return new BatchReviewResult.Item(id, null, null, false, null, message);
    }
}
