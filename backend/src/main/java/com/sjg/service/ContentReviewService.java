package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.dto.SourceSummary;
import com.sjg.entity.ContentReview;
import com.sjg.entity.ContentSourceLink;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.SourceDocument;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import com.sjg.mapper.ScenicSpotMapper;
import com.sjg.mapper.SourceDocumentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ContentReviewService {

    private static final Set<String> ENTITY_TYPES = Set.of(
            "dynasty", "poem", "poet", "scenic_spot", "event", "cultural_item", "poem_analysis",
            "poet_relation");

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            ContentReview.DRAFT, Set.of(ContentReview.NEEDS_REVIEW),
            ContentReview.NEEDS_REVIEW, Set.of(ContentReview.APPROVED),
            ContentReview.APPROVED, Set.of(ContentReview.PUBLISHED),
            ContentReview.PUBLISHED, Set.of(ContentReview.ARCHIVED));

    private final ContentReviewMapper reviewMapper;
    private final SourceDocumentMapper sourceDocumentMapper;
    private final ContentSourceLinkMapper sourceLinkMapper;
    private final DynastyMapper dynastyMapper;
    private final PoemMapper poemMapper;
    private final PoetMapper poetMapper;
    private final ScenicSpotMapper scenicSpotMapper;
    private final EventMapper eventMapper;
    private final CulturalItemMapper culturalItemMapper;
    private final PoemAnalysisMapper poemAnalysisMapper;
    private final PoetRelationMapper poetRelationMapper;

    public ContentReviewService(ContentReviewMapper reviewMapper,
                                SourceDocumentMapper sourceDocumentMapper,
                                ContentSourceLinkMapper sourceLinkMapper,
                                DynastyMapper dynastyMapper,
                                PoemMapper poemMapper,
                                PoetMapper poetMapper,
                                ScenicSpotMapper scenicSpotMapper,
                                EventMapper eventMapper,
                                CulturalItemMapper culturalItemMapper,
                                PoemAnalysisMapper poemAnalysisMapper) {
        this(reviewMapper, sourceDocumentMapper, sourceLinkMapper, dynastyMapper, poemMapper, poetMapper,
                scenicSpotMapper, eventMapper, culturalItemMapper, poemAnalysisMapper, null);
    }

    @Autowired
    public ContentReviewService(ContentReviewMapper reviewMapper,
                                SourceDocumentMapper sourceDocumentMapper,
                                ContentSourceLinkMapper sourceLinkMapper,
                                DynastyMapper dynastyMapper,
                                PoemMapper poemMapper,
                                PoetMapper poetMapper,
                                ScenicSpotMapper scenicSpotMapper,
                                EventMapper eventMapper,
                                CulturalItemMapper culturalItemMapper,
                                PoemAnalysisMapper poemAnalysisMapper,
                                PoetRelationMapper poetRelationMapper) {
        this.reviewMapper = reviewMapper;
        this.sourceDocumentMapper = sourceDocumentMapper;
        this.sourceLinkMapper = sourceLinkMapper;
        this.dynastyMapper = dynastyMapper;
        this.poemMapper = poemMapper;
        this.poetMapper = poetMapper;
        this.scenicSpotMapper = scenicSpotMapper;
        this.eventMapper = eventMapper;
        this.culturalItemMapper = culturalItemMapper;
        this.poemAnalysisMapper = poemAnalysisMapper;
        this.poetRelationMapper = poetRelationMapper;
    }

    /** 保留给不需要业务实体校验的轻量单元测试和兼容调用。 */
    public ContentReviewService(ContentReviewMapper reviewMapper,
                                SourceDocumentMapper sourceDocumentMapper,
                                ContentSourceLinkMapper sourceLinkMapper) {
        this(reviewMapper, sourceDocumentMapper, sourceLinkMapper,
                null, null, null, null, null, null, null);
    }

    public PageResult<ContentReview> listReviews(int page, int size,
                                                 String entityType, String status) {
        LambdaQueryWrapper<ContentReview> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(entityType)) wrapper.eq(ContentReview::getEntityType, normalizeEntityType(entityType));
        if (StringUtils.hasText(status)) wrapper.eq(ContentReview::getStatus, status.trim());
        wrapper.orderByDesc(ContentReview::getUpdatedAt).orderByDesc(ContentReview::getId);
        Page<ContentReview> result = reviewMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public ContentReview getReview(String entityType, Long entityId) {
        return reviewMapper.selectOne(new LambdaQueryWrapper<ContentReview>()
                .eq(ContentReview::getEntityType, normalizeEntityType(entityType))
                .eq(ContentReview::getEntityId, requireEntityId(entityId)));
    }

    public List<SourceSummary> listSourceSummaries(String entityType, Long entityId) {
        String normalizedType = normalizeEntityType(entityType);
        long validEntityId = requireEntityId(entityId);
        List<ContentSourceLink> links = sourceLinkMapper.selectList(
                new LambdaQueryWrapper<ContentSourceLink>()
                        .eq(ContentSourceLink::getEntityType, normalizedType)
                        .eq(ContentSourceLink::getEntityId, validEntityId)
                        .orderByAsc(ContentSourceLink::getId));
        ContentReview review = getReview(normalizedType, validEntityId);
        String reviewStatus = review == null ? null : review.getStatus();
        List<SourceSummary> summaries = new ArrayList<>();
        for (ContentSourceLink link : links) {
            SourceDocument source = sourceDocumentMapper.selectById(link.getSourceDocumentId());
            if (source == null) continue;
            SourceSummary summary = new SourceSummary();
            summary.setSourceId(source.getId());
            summary.setTitle(source.getTitle());
            summary.setAuthorOrg(source.getAuthorOrg());
            summary.setPublicationYear(source.getPublicationYear());
            summary.setUrl(source.getUrl());
            summary.setCitation(source.getCitation());
            summary.setLocator(link.getLocator());
            summary.setQuote(link.getQuote());
            summary.setNote(link.getNote());
            summary.setReviewStatus(reviewStatus);
            summaries.add(summary);
        }
        return summaries;
    }

    @Transactional
    public ContentReview transition(String entityType, Long entityId, String targetStatus,
                                    Long reviewerId, String reviewNote) {
        String normalizedType = normalizeEntityType(entityType);
        long validEntityId = requireEntityId(entityId);
        if (!StringUtils.hasText(targetStatus)) throw new IllegalArgumentException("status 不能为空");
        String target = targetStatus.trim();

        // 审核记录是多态关联，写入前必须确认业务实体仍然存在，避免产生孤儿审核记录。
        validateEntityExists(normalizedType, validEntityId);

        ContentReview current = getReview(normalizedType, validEntityId);
        if (current == null) {
            if (!ContentReview.NEEDS_REVIEW.equals(target)) {
                throw new IllegalStateException("不存在审核记录的实体只能创建为 needs_review");
            }
            current = new ContentReview();
            current.setEntityType(normalizedType);
            current.setEntityId(validEntityId);
            current.setStatus(ContentReview.NEEDS_REVIEW);
            current.setCreatedAt(LocalDateTime.now());
            applyReviewMetadata(current, reviewerId, reviewNote);
            reviewMapper.insert(current);
            return current;
        }

        String currentStatus = StringUtils.hasText(current.getStatus())
                ? current.getStatus() : ContentReview.DRAFT;
        if (!ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(target)) {
            throw new IllegalStateException("不允许从 " + currentStatus + " 转为 " + target);
        }
        if (ContentReview.PUBLISHED.equals(target) && sourceLinkMapper != null) {
            long sourceCount = sourceLinkMapper.selectCount(new LambdaQueryWrapper<ContentSourceLink>()
                    .eq(ContentSourceLink::getEntityType, normalizedType)
                    .eq(ContentSourceLink::getEntityId, validEntityId));
            if (sourceCount < 1) {
                throw new IllegalStateException("实体至少需要一条来源关联才能发布");
            }
        }
        current.setStatus(target);
        applyReviewMetadata(current, reviewerId, reviewNote);
        reviewMapper.updateById(current);
        syncLegacyCulturalStatus(normalizedType, validEntityId, target);
        return current;
    }

    /**
     * cultural_item 早期版本还保留独立 status 字段。审核工作台是新的权威入口，
     * 因此在发布/归档时同步旧字段，避免管理端与公开端出现状态分裂。
     */
    private void syncLegacyCulturalStatus(String entityType, long entityId, String reviewStatus) {
        if (culturalItemMapper == null || !"cultural_item".equals(entityType)) return;
        if (ContentReview.PUBLISHED.equals(reviewStatus)) {
            CulturalItem item = new CulturalItem();
            item.setId(entityId);
            item.setStatus(CulturalItemService.STATUS_PUBLISHED);
            culturalItemMapper.updateById(item);
        } else if (ContentReview.ARCHIVED.equals(reviewStatus)) {
            CulturalItem item = new CulturalItem();
            item.setId(entityId);
            item.setStatus(CulturalItemService.STATUS_DRAFT);
            culturalItemMapper.updateById(item);
        }
    }

    public PageResult<SourceDocument> listSources(int page, int size, String keyword) {
        LambdaQueryWrapper<SourceDocument> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(SourceDocument::getTitle, keyword.trim())
                    .or().like(SourceDocument::getAuthorOrg, keyword.trim());
        }
        wrapper.orderByDesc(SourceDocument::getUpdatedAt).orderByDesc(SourceDocument::getId);
        Page<SourceDocument> result = sourceDocumentMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    @Transactional
    public SourceDocument createSource(SourceDocument source) {
        if (source == null || !StringUtils.hasText(source.getTitle())) {
            throw new IllegalArgumentException("来源标题不能为空");
        }
        source.setTitle(source.getTitle().trim());
        sourceDocumentMapper.insert(source);
        return source;
    }

    @Transactional
    public SourceDocument updateSource(Long id, SourceDocument incoming) {
        if (id == null || id <= 0) throw new IllegalArgumentException("sourceId 必须为正数");
        SourceDocument current = sourceDocumentMapper.selectById(id);
        if (current == null) throw new IllegalArgumentException("来源文献不存在");
        if (incoming == null || !StringUtils.hasText(incoming.getTitle())) {
            throw new IllegalArgumentException("来源标题不能为空");
        }
        incoming.setId(id);
        incoming.setTitle(incoming.getTitle().trim());
        incoming.setCreatedAt(current.getCreatedAt());
        incoming.setUpdatedAt(LocalDateTime.now());
        sourceDocumentMapper.updateById(incoming);
        return incoming;
    }

    @Transactional
    public ContentSourceLink linkSource(ContentSourceLink link) {
        if (link == null) throw new IllegalArgumentException("来源关联不能为空");
        link.setEntityType(normalizeEntityType(link.getEntityType()));
        link.setEntityId(requireEntityId(link.getEntityId()));
        if (link.getSourceDocumentId() == null || link.getSourceDocumentId() <= 0) {
            throw new IllegalArgumentException("sourceDocumentId 必须为正数");
        }
        if (sourceDocumentMapper.selectById(link.getSourceDocumentId()) == null) {
            throw new IllegalArgumentException("来源文献不存在");
        }
        validateEntityExists(link.getEntityType(), link.getEntityId());
        ContentSourceLink duplicate = sourceLinkMapper.selectOne(new LambdaQueryWrapper<ContentSourceLink>()
                .eq(ContentSourceLink::getEntityType, link.getEntityType())
                .eq(ContentSourceLink::getEntityId, link.getEntityId())
                .eq(ContentSourceLink::getSourceDocumentId, link.getSourceDocumentId())
                .eq(ContentSourceLink::getLocator, link.getLocator()));
        if (duplicate != null) throw new IllegalArgumentException("该实体与来源已存在相同定位的关联");
        sourceLinkMapper.insert(link);
        return link;
    }

    private void validateEntityExists(String entityType, Long entityId) {
        if (dynastyMapper == null) return;
        boolean exists = switch (entityType) {
            case "dynasty" -> dynastyMapper.selectById(entityId) != null;
            case "poem" -> poemMapper.selectById(entityId) != null;
            case "poet" -> poetMapper.selectById(entityId) != null;
            case "scenic_spot" -> scenicSpotMapper.selectById(entityId) != null;
            case "event" -> eventMapper.selectById(entityId) != null;
            case "cultural_item" -> culturalItemMapper.selectById(entityId) != null;
            case "poem_analysis" -> poemAnalysisMapper.selectById(entityId) != null;
            case "poet_relation" -> poetRelationMapper != null && poetRelationMapper.selectById(entityId) != null;
            default -> throw new IllegalArgumentException("不支持的实体类型: " + entityType);
        };
        if (!exists) throw new IllegalArgumentException("实体不存在：" + entityType + " " + entityId);
    }

    private void applyReviewMetadata(ContentReview review, Long reviewerId, String reviewNote) {
        review.setReviewerId(reviewerId);
        review.setReviewedAt(LocalDateTime.now());
        review.setReviewNote(StringUtils.hasText(reviewNote) ? reviewNote.trim() : null);
    }

    private String normalizeEntityType(String entityType) {
        if (!StringUtils.hasText(entityType)) {
            throw new IllegalArgumentException("不支持的实体类型: " + entityType);
        }
        String normalized = entityType.trim().toLowerCase();
        if ("relation".equals(normalized)) normalized = "poet_relation";
        if (!ENTITY_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("不支持的实体类型: " + entityType);
        }
        return normalized;
    }

    private long requireEntityId(Long entityId) {
        if (entityId == null || entityId <= 0) throw new IllegalArgumentException("entityId 必须为正数");
        return entityId;
    }
}
