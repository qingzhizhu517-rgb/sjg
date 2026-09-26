package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.ContentReview;
import com.sjg.entity.ContentSourceLink;
import com.sjg.entity.PoemAnalysis;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.PoemAnalysisMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.time.LocalDateTime;

/** 删除实体时同步清理多态治理表，避免留下无法回溯的审核和来源孤儿记录。 */
@Service
public class ContentGovernanceCleanupService {

    private final ContentReviewMapper reviewMapper;
    private final ContentSourceLinkMapper sourceLinkMapper;
    private final PoemAnalysisMapper analysisMapper;

    public ContentGovernanceCleanupService(ContentReviewMapper reviewMapper,
                                            ContentSourceLinkMapper sourceLinkMapper) {
        this(reviewMapper, sourceLinkMapper, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public ContentGovernanceCleanupService(ContentReviewMapper reviewMapper,
                                            ContentSourceLinkMapper sourceLinkMapper,
                                            PoemAnalysisMapper analysisMapper) {
        this.reviewMapper = reviewMapper;
        this.sourceLinkMapper = sourceLinkMapper;
        this.analysisMapper = analysisMapper;
    }

    @Transactional
    public void deleteEntityReferences(String entityType, Long entityId) {
        if (entityType == null || entityId == null) return;
        deleteEntityReferences(entityType, List.of(entityId));
    }

    @Transactional
    public void deleteEntityReferences(String entityType, Collection<Long> entityIds) {
        if (entityType == null || entityIds == null || entityIds.isEmpty()) return;
        sourceLinkMapper.delete(new LambdaQueryWrapper<ContentSourceLink>()
                .eq(ContentSourceLink::getEntityType, entityType)
                .in(ContentSourceLink::getEntityId, entityIds));
        reviewMapper.delete(new LambdaQueryWrapper<ContentReview>()
                .eq(ContentReview::getEntityType, entityType)
                .in(ContentReview::getEntityId, entityIds));
    }

    /** 删除诗词前清理赏析缓存及其审核/来源记录，兼容 poem_analysis 的非级联外键。 */
    @Transactional
    public void deletePoems(Collection<Long> poemIds) {
        if (poemIds == null || poemIds.isEmpty()) return;
        if (analysisMapper != null) {
            List<PoemAnalysis> analyses = analysisMapper.selectList(
                    new LambdaQueryWrapper<PoemAnalysis>().in(PoemAnalysis::getPoemId, poemIds));
            if (analyses != null && !analyses.isEmpty()) {
                List<Long> analysisIds = analyses.stream().map(PoemAnalysis::getId).toList();
                deleteEntityReferences("poem_analysis", analysisIds);
            }
            analysisMapper.delete(new LambdaQueryWrapper<PoemAnalysis>()
                    .in(PoemAnalysis::getPoemId, poemIds));
        }
        deleteEntityReferences("poem", poemIds);
    }

    /** 新实体进入治理队列；重复调用保持原审核状态不变。 */
    @Transactional
    public void ensureNeedsReview(String entityType, Long entityId) {
        if (entityType == null || entityId == null || entityId <= 0) return;
        ContentReview existing = reviewMapper.selectOne(new LambdaQueryWrapper<ContentReview>()
                .eq(ContentReview::getEntityType, entityType)
                .eq(ContentReview::getEntityId, entityId));
        if (existing != null) return;
        ContentReview review = new ContentReview();
        review.setEntityType(entityType);
        review.setEntityId(entityId);
        review.setStatus(ContentReview.NEEDS_REVIEW);
        review.setReviewNote("新建实体待人工审核");
        review.setCreatedAt(LocalDateTime.now());
        reviewMapper.insert(review);
    }

    /** 实体内容被编辑后撤销公开资格，要求重新完成审核流转。 */
    @Transactional
    public void resetReviewForEdit(String entityType, Long entityId) {
        if (entityType == null || entityId == null || entityId <= 0) return;
        ContentReview existing = reviewMapper.selectOne(new LambdaQueryWrapper<ContentReview>()
                .eq(ContentReview::getEntityType, entityType)
                .eq(ContentReview::getEntityId, entityId));
        if (existing == null) {
            ensureNeedsReview(entityType, entityId);
            return;
        }
        if (ContentReview.NEEDS_REVIEW.equals(existing.getStatus())) return;
        existing.setStatus(ContentReview.NEEDS_REVIEW);
        existing.setReviewerId(null);
        existing.setReviewedAt(null);
        existing.setReviewNote("实体内容更新，需重新审核");
        reviewMapper.updateById(existing);
    }
}
