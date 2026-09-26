package com.sjg.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sjg.dto.LearningSubmissionRequest;
import com.sjg.dto.LearningFeedbackContext;
import com.sjg.entity.LearningSubmission;
import com.sjg.entity.LearningTask;
import com.sjg.entity.ContentReview;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.Poem;
import com.sjg.entity.SourceDocument;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.LearningSubmissionMapper;
import com.sjg.mapper.LearningTaskMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.ScenicSpotMapper;
import com.sjg.mapper.SourceDocumentMapper;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.entity.ContentSourceLink;
import com.sjg.service.CulturalItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LearningTaskServiceTest {
    private final LearningTaskMapper taskMapper = mock(LearningTaskMapper.class);
    private final LearningSubmissionMapper submissionMapper = mock(LearningSubmissionMapper.class);
    private final PoetMapper poetMapper = mock(PoetMapper.class);
    private final PoemMapper poemMapper = mock(PoemMapper.class);
    private final ScenicSpotMapper scenicSpotMapper = mock(ScenicSpotMapper.class);
    private final CulturalItemMapper culturalItemMapper = mock(CulturalItemMapper.class);
    private final EventMapper eventMapper = mock(EventMapper.class);
    private final SourceDocumentMapper sourceDocumentMapper = mock(SourceDocumentMapper.class);
    private final ContentSourceLinkMapper sourceLinkMapper = mock(ContentSourceLinkMapper.class);
    private final ContentReviewMapper contentReviewMapper = mock(ContentReviewMapper.class);
    private final LearningTaskService service = new LearningTaskService(
            taskMapper, submissionMapper, new ObjectMapper(), poetMapper, poemMapper,
            scenicSpotMapper, culturalItemMapper, eventMapper, sourceDocumentMapper, contentReviewMapper,
            sourceLinkMapper);

    @BeforeEach
    void defaultSourceLinkExists() {
        when(sourceLinkMapper.selectOne(any())).thenReturn(link(1L, 2L));
        when(sourceDocumentMapper.selectById(anyLong())).thenReturn(new SourceDocument());
    }

    @Test
    void publishValidationRequiresThreeBoundSteps() {
        LearningTask task = task("jinan-poetry", "{\"resources\":[{\"entityType\":\"poem\",\"entityId\":1,\"title\":\"材料\",\"snippet\":\"摘要\",\"sourceIds\":[2]}],\"steps\":[{\"type\":\"evidence\",\"questions\":[{\"prompt\":\"看到了什么\",\"entityIds\":[1],\"sourceIds\":[2]}]}]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(sourceDocumentMapper.selectById(2L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("三个步骤"));
    }

    @Test
    void publishValidationRejectsTaskWithoutResources() {
        LearningTask task = task("jinan-poetry", "{\"steps\":["
                + mixedStep("evidence") + "," + mixedStep("compare") + "," + mixedStep("reflection") + "]}");
        stubReviewedMixedEntities();

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));

        assertTrue(error.getMessage().contains("resources"));
    }

    @Test
    void publishValidationRejectsEmptyResourcesArray() {
        LearningTask task = task("jinan-poetry", "{\"resources\":[],\"steps\":["
                + mixedStep("evidence") + "," + mixedStep("compare") + "," + mixedStep("reflection") + "]}");
        stubReviewedMixedEntities();

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));

        assertTrue(error.getMessage().contains("resources"));
    }

    @Test
    void publishValidationAcceptsEvidenceCompareReflection() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L, 3L, 4L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],\"steps\":["
                + step("evidence") + "," + mixedStep("compare") + "," + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(sourceDocumentMapper.selectById(2L)).thenReturn(new SourceDocument());
        when(sourceDocumentMapper.selectById(3L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));
        when(sourceLinkMapper.selectOne(any())).thenReturn(link(1L, 2L));
        assertDoesNotThrow(() -> service.validateForPublish(task));
    }

    @Test
    void publishValidationNormalizesStepTypesLikeOfflineChecker() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L, 3L, 4L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],\"steps\":["
                + step(" Evidence ") + "," + mixedStep(" COMPARE ") + "," + step(" Reflection ") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));

        assertDoesNotThrow(() -> service.validateForPublish(task));
    }

    @Test
    void publishValidationRejectsPlaceholderTextLikeOfflineChecker() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L, 3L, 4L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],"
                + "\"teacherNotes\":{\"note\":\"TODO：补充课堂说明\"},\"steps\":["
                + step("evidence") + "," + mixedStep("compare") + "," + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));

        assertTrue(error.getMessage().contains("占位"));
    }

    @Test
    void publishValidationRejectsMissingQuestionId() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L, 3L, 4L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],\"steps\":["
                + "{\"type\":\"evidence\",\"questions\":[{\"prompt\":\"请回答\","
                + "\"entityType\":\"poem\",\"entityIds\":[1],\"sourceIds\":[2]}]},"
                + mixedStep("compare") + "," + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));

        assertTrue(error.getMessage().contains("题目 ID") && error.getMessage().contains("不能为空"));
    }

    @Test
    void publishValidationRejectsDuplicateQuestionIdsAcrossSteps() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L, 3L, 4L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],\"steps\":["
                + step("evidence") + ","
                + "{\"type\":\"compare\",\"questions\":[{\"id\":\" evidence-1 \",\"prompt\":\"请比较\","
                + "\"entityRefs\":[{\"type\":\"poem\",\"id\":1},{\"type\":\"scenic_spot\",\"id\":2}],"
                + "\"sourceIds\":[3,4]}]},"
                + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));

        assertTrue(error.getMessage().contains("题目 ID") && error.getMessage().contains("唯一"));
    }

    @Test
    void publishValidationRejectsComparisonQuestionWithOneEntity() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L) + "],\"steps\":["
                + step("evidence") + ","
                + step("compare") + ","
                + step("reflection") + "]}");
        task.setContentJson("{\"resources\":["
                + resource("poem", 1L, 2L) + "],\"steps\":["
                + step("evidence") + ","
                + step("compare", "poem", 1L, 2L) + ","
                + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(sourceDocumentMapper.selectById(2L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));
        when(sourceLinkMapper.selectOne(any())).thenReturn(link(1L, 2L));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("compare") || error.getMessage().contains("两个实体"));
    }

    @Test
    void publishValidationRejectsComparisonQuestionWithOneSource() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L, 3L) + "," + resource("scenic_spot", 2L, 3L) + "],\"steps\":["
                + step("evidence") + ","
                + "{\"type\":\"compare\",\"title\":\"步骤\",\"questions\":[{"
                + "\"id\":\"compare-sources\",\"prompt\":\"请比较材料\","
                + "\"entityRefs\":[{\"type\":\"poem\",\"id\":1},{\"type\":\"scenic_spot\",\"id\":2}],"
                + "\"sourceIds\":[3]}]},"
                + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(sourceDocumentMapper.selectById(anyLong())).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));
        when(sourceLinkMapper.selectOne(any())).thenReturn(link(1L, 3L));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("两个不同来源") || error.getMessage().contains("compare"));
    }

    @Test
    void publishValidationRejectsSourceNotLinkedToQuestionEntity() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 3L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],\"steps\":["
                + mixedStep("evidence") + "," + mixedStep("compare") + "," + mixedStep("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(sourceDocumentMapper.selectById(3L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));
        when(sourceLinkMapper.selectOne(any())).thenReturn(null);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("关联") || error.getMessage().contains("来源"));
    }

    @Test
    void publishValidationRejectsResourceSourceNotLinkedToResourceEntity() {
        LearningTask task = task("jinan-poetry", "{\"resources\":[{"
                + "\"entityType\":\"poem\",\"entityId\":1,"
                + "\"title\":\"诗词材料\",\"snippet\":\"来源摘要\",\"sourceIds\":[2]}],"
                + "\"steps\":[" + mixedStep("evidence") + "," + mixedStep("compare") + ","
                + mixedStep("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(sourceDocumentMapper.selectById(2L)).thenReturn(new SourceDocument());
        when(sourceDocumentMapper.selectById(3L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));
        when(sourceLinkMapper.selectOne(any())).thenReturn(null);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("资源") || error.getMessage().contains("关联"));
    }

    @Test
    void publishValidationAcceptsResourceWithReviewedLinkedSource() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L) + "," + resource("scenic_spot", 2L, 2L, 3L) + "],"
                + "\"steps\":[" + step("evidence", "poem", 1L, 2L) + ","
                + mixedCompareStepWithSources(2L, 3L) + "," + mixedStepWithSource("reflection", 2L) + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(sourceDocumentMapper.selectById(2L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));

        assertDoesNotThrow(() -> service.validateForPublish(task));
    }

    @Test
    void publishValidationRejectsQuestionEntityAndSourceNotCoveredByResources() {
        LearningTask task = task("jinan-poetry", "{\"resources\":[{"
                + "\"entityType\":\"poem\",\"entityId\":1,"
                + "\"title\":\"诗词材料\",\"snippet\":\"来源摘要\",\"sourceIds\":[3]}],"
                + "\"steps\":["
                + step("evidence", "poem", 1L, 3L) + ","
                + mixedCompareStepWithSources(3L, 4L) + ","
                + step("reflection", "poem", 1L, 3L) + "]}");
        stubReviewedMixedEntities();
        when(sourceDocumentMapper.selectById(4L)).thenReturn(new SourceDocument());

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));

        assertTrue(error.getMessage().contains("资源") || error.getMessage().contains("覆盖"));
    }

    @Test
    void publishValidationTreatsSpotAliasesAsOneComparisonEntity() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + "{\"entityType\":\"poem\",\"entityId\":1,\"title\":\"诗词材料\",\"snippet\":\"摘要\",\"sourceIds\":[3]},"
                + "{\"entityType\":\"scenic_spot\",\"entityId\":2,\"title\":\"景观材料\",\"snippet\":\"摘要\",\"sourceIds\":[3,4]}],"
                + "\"steps\":["
                + step("evidence", "poem", 1L, 3L) + ","
                + "{\"type\":\"compare\",\"title\":\"步骤\",\"questions\":[{\"id\":\"compare-alias\",\"prompt\":\"请比较材料\","
                + "\"entityRefs\":[{\"type\":\"spot\",\"id\":2},{\"type\":\"scenic_spot\",\"id\":2}],\"sourceIds\":[3,4]}]},"
                + step("reflection", "poem", 1L, 3L) + "]}");
        stubReviewedMixedEntities();
        when(sourceDocumentMapper.selectById(4L)).thenReturn(new SourceDocument());

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));

        assertTrue(error.getMessage().contains("两个实体") || error.getMessage().contains("compare"));
    }

    @Test
    void publishValidationRejectsMissingEntityReference() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L) + "],\"steps\":["
                + step("evidence") + "," + step("compare") + "," + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(null);
        when(sourceDocumentMapper.selectById(2L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.APPROVED));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("poem") && error.getMessage().contains("1"));
    }

    @Test
    void publishValidationRejectsMissingSourceReference() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 2L) + "],\"steps\":["
                + step("evidence") + "," + step("compare") + "," + step("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(sourceDocumentMapper.selectById(2L)).thenReturn(null);
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("来源") && error.getMessage().contains("2"));
    }

    @Test
    void publishValidationRejectsUnpublishedCulturalItem() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("cultural_item", 1L, 2L) + "],\"steps\":["
                + step("evidence", "cultural_item") + ","
                + step("compare", "cultural_item") + ","
                + step("reflection", "cultural_item") + "]}");
        CulturalItem item = new CulturalItem();
        item.setStatus(CulturalItemService.STATUS_DRAFT);
        when(culturalItemMapper.selectById(1L)).thenReturn(item);
        when(sourceDocumentMapper.selectById(2L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.APPROVED));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("cultural_item") && error.getMessage().contains("发布"));
    }

    @Test
    void publishValidationAcceptsMixedEntityReferences() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 3L, 4L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],\"steps\":["
                + mixedStep("evidence") + "," + mixedStep("compare") + "," + mixedStep("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(sourceDocumentMapper.selectById(3L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));

        assertDoesNotThrow(() -> service.validateForPublish(task));
    }

    @Test
    void publishValidationRejectsApprovedButNotPublishedEntity() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + resource("poem", 1L, 3L, 4L) + "," + resource("scenic_spot", 2L, 3L, 4L) + "],\"steps\":["
                + mixedStep("evidence") + "," + mixedStep("compare") + "," + mixedStep("reflection") + "]}");
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(sourceDocumentMapper.selectById(3L)).thenReturn(new SourceDocument());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.APPROVED));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.validateForPublish(task));
        assertTrue(error.getMessage().contains("未通过审核") || error.getMessage().contains("published"));
    }

    @Test
    void copyPublishedTaskCreatesIndependentDraft() {
        LearningTask original = task("jinan-poetry", "{\"steps\":[]}");
        original.setId(9L);
        original.setCity("济南");
        original.setGoal("认识诗词与城市");
        original.setBackground("任务背景");
        original.setExportTemplate("markdown");
        when(taskMapper.selectById(9L)).thenReturn(original);
        when(taskMapper.selectOne(any())).thenReturn(null);
        doAnswer(invocation -> {
            LearningTask saved = invocation.getArgument(0);
            saved.setId(10L);
            return 1;
        }).when(taskMapper).insert(any(LearningTask.class));

        LearningTask copied = service.copy(9L);

        assertEquals(10L, copied.getId());
        assertEquals(LearningTask.DRAFT, copied.getStatus());
        assertTrue(copied.getTaskCode().startsWith("jinan-poetry-copy-"));
        assertNotEquals(original.getTaskCode(), copied.getTaskCode());
        assertEquals(original.getContentJson(), copied.getContentJson());
        verify(taskMapper).insert(any(LearningTask.class));
        verifyNoInteractions(submissionMapper);
    }

    @Test
    void copyMissingTaskFailsClearly() {
        when(taskMapper.selectById(404L)).thenReturn(null);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.copy(404L));

        assertEquals("学习任务不存在", error.getMessage());
        verify(taskMapper, never()).insert(any(LearningTask.class));
    }

    @Test
    void createAlwaysStartsAsDraftEvenWhenRequestClaimsPublished() {
        LearningTask incoming = task("jinan-published-bypass", "{\"steps\":[]}");
        incoming.setStatus(LearningTask.PUBLISHED);

        service.create(incoming);

        assertEquals(LearningTask.DRAFT, incoming.getStatus());
        verify(taskMapper).insert(argThat(saved -> LearningTask.DRAFT.equals(saved.getStatus())));
    }

    @Test
    void editingPublishedTaskReturnsItToDraft() {
        LearningTask current = task("jinan-published", "{\"steps\":[]}");
        current.setId(12L);
        current.setStatus(LearningTask.PUBLISHED);
        LearningTask incoming = task("jinan-published", "{\"steps\":[]}");
        incoming.setStatus(LearningTask.PUBLISHED);
        when(taskMapper.selectById(12L)).thenReturn(current);

        LearningTask updated = service.update(12L, incoming);

        assertEquals(LearningTask.DRAFT, updated.getStatus());
        verify(taskMapper).updateById(argThat(saved -> LearningTask.DRAFT.equals(saved.getStatus())));
    }

    @Test
    void saveSubmissionUpsertsByHashedSessionKey() {
        LearningTask task = task("jinan-poetry", "{\"steps\":[]}");
        task.setId(7L);
        when(taskMapper.selectOne(any())).thenReturn(task);
        when(submissionMapper.selectOne(any())).thenReturn(null);
        doAnswer(invocation -> {
            LearningSubmission saved = invocation.getArgument(0);
            saved.setId(11L);
            return 1;
        }).when(submissionMapper).insert(any(LearningSubmission.class));

        LearningSubmission result = service.saveSubmission("jinan-poetry",
                new LearningSubmissionRequest(" browser-session ", "{\"q1\":\"答案\"}", 2, "submitted"));

        assertEquals(11L, result.getId());
        assertEquals("submitted", result.getStatus());
        assertEquals(2, result.getCurrentStep());
        verify(submissionMapper).insert(any(LearningSubmission.class));
    }

    @Test
    void resolvesCanonicalFeedbackContextFromQuestionIdAndBoundResources() {
        LearningTask task = task("jinan-poetry", "{\"resources\":["
                + "{\"entityType\":\"poem\",\"entityId\":1,\"title\":\"可信材料\","
                + "\"snippet\":\"月光照在泉边\",\"sourceIds\":[5]},"
                + "{\"entityType\":\"poem\",\"entityId\":2,\"title\":\"无关材料\","
                + "\"snippet\":\"不应进入提示词\",\"sourceIds\":[6]}],\"steps\":[{"
                + "\"type\":\"reflection\",\"questions\":[{\"id\":\"reflection-1\","
                + "\"prompt\":\"根据材料判断\",\"entityRefs\":[{\"type\":\"poem\",\"id\":1}],"
                + "\"sourceIds\":[5]}]}]}");

        LearningFeedbackContext context = service.resolveFeedbackContext(task, "reflection-1");

        assertEquals("根据材料判断", context.question());
        assertTrue(context.evidence().contains("可信材料"));
        assertFalse(context.evidence().contains("无关材料"));
    }

    @Test
    void rejectsUnknownFeedbackQuestionId() {
        LearningTask task = task("jinan-poetry", "{\"steps\":[{\"type\":\"reflection\",\"questions\":[{"
                + "\"id\":\"reflection-1\",\"prompt\":\"根据材料判断\",\"entityType\":\"poem\","
                + "\"entityIds\":[1],\"sourceIds\":[5]}]}]}");

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.resolveFeedbackContext(task, "missing"));

        assertTrue(error.getMessage().contains("题目不存在"));
    }

    @Test
    void canonicalEvidenceOnlyListsSourcesDeclaredByTheQuestion() {
        LearningTask task = task("jinan-poetry", "{\"resources\":[{"
                + "\"entityType\":\"poem\",\"entityId\":1,\"title\":\"材料\","
                + "\"snippet\":\"摘要\",\"sourceIds\":[5,6]}],\"steps\":[{"
                + "\"type\":\"reflection\",\"questions\":[{\"id\":\"reflection-1\","
                + "\"prompt\":\"问题\",\"entityType\":\"poem\",\"entityIds\":[1],"
                + "\"sourceIds\":[5]}]}]}");

        LearningFeedbackContext context = service.resolveFeedbackContext(task, "reflection-1");

        assertTrue(context.evidence().contains("来源：5"));
        assertFalse(context.evidence().contains("6"));
    }

    private LearningTask task(String code, String content) {
        LearningTask task = new LearningTask();
        task.setTaskCode(code);
        task.setTitle("济南诗词文学景观");
        task.setContentJson(content);
        task.setStatus(LearningTask.PUBLISHED);
        return task;
    }

    private String step(String type) {
        return step(type, "poem");
    }

    private String step(String type, String entityType) {
        return step(type, entityType, 1L, 2L);
    }

    private String step(String type, String entityType, long entityId, long sourceId) {
        return "{\"type\":\"" + type + "\",\"title\":\"步骤\",\"questions\":[{\"id\":\""
                + type + "-1\",\"prompt\":\"请回答\",\"entityType\":\"" + entityType
                + "\",\"entityIds\":[" + entityId + "],\"sourceIds\":[" + sourceId + "]}]}";
    }

    private String resource(String entityType, long entityId, long... sourceIds) {
        String sources = java.util.Arrays.stream(sourceIds)
                .mapToObj(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));
        return "{\"entityType\":\"" + entityType + "\",\"entityId\":" + entityId
                + ",\"title\":\"材料\",\"snippet\":\"来源摘要\",\"sourceIds\":[" + sources + "]}";
    }

    private String mixedStep(String type) {
        return "{\"type\":\"" + type + "\",\"title\":\"步骤\",\"questions\":[{\"id\":\""
                + type + "-mixed\",\"prompt\":\"请比较材料\",\"entityRefs\":["
                + "{\"type\":\"poem\",\"id\":1},{\"type\":\"scenic_spot\",\"id\":2}],"
                + "\"sourceIds\":[3,4]}]}";
    }

    private String mixedCompareStepWithSources(long firstSourceId, long secondSourceId) {
        return "{\"type\":\"compare\",\"title\":\"步骤\",\"questions\":[{\"id\":\"compare-mixed\",\"prompt\":\"请比较材料\",\"entityRefs\":["
                + "{\"type\":\"poem\",\"id\":1},{\"type\":\"scenic_spot\",\"id\":2}],"
                + "\"sourceIds\":[" + firstSourceId + "," + secondSourceId + "]}]}";
    }

    private String mixedStepWithSource(String type, long sourceId) {
        return "{\"type\":\"" + type + "\",\"title\":\"步骤\",\"questions\":[{\"id\":\""
                + type + "-mixed\",\"prompt\":\"请比较材料\",\"entityRefs\":["
                + "{\"type\":\"poem\",\"id\":1},{\"type\":\"scenic_spot\",\"id\":2}],"
                + "\"sourceIds\":[" + sourceId + "]}]}";
    }

    private ContentReview review(String status) {
        ContentReview review = new ContentReview();
        review.setStatus(status);
        return review;
    }

    private ContentSourceLink link(long entityId, long sourceId) {
        ContentSourceLink link = new ContentSourceLink();
        link.setEntityId(entityId);
        link.setSourceDocumentId(sourceId);
        return link;
    }

    private void stubReviewedMixedEntities() {
        when(poemMapper.selectById(1L)).thenReturn(new Poem());
        when(scenicSpotMapper.selectById(2L)).thenReturn(new com.sjg.entity.ScenicSpot());
        when(contentReviewMapper.selectOne(any())).thenReturn(review(ContentReview.PUBLISHED));
    }
}
