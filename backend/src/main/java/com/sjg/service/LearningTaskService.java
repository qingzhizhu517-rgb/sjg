package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sjg.dto.LearningSubmissionRequest;
import com.sjg.dto.LearningFeedbackContext;
import com.sjg.dto.PageResult;
import com.sjg.entity.ContentReview;
import com.sjg.entity.ContentSourceLink;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.LearningSubmission;
import com.sjg.entity.LearningTask;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.LearningSubmissionMapper;
import com.sjg.mapper.LearningTaskMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.ScenicSpotMapper;
import com.sjg.mapper.SourceDocumentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class LearningTaskService {
    private static final Set<String> STEP_TYPES = Set.of("evidence", "compare", "reflection");
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile(
            "(替换为|待填写|TODO|placeholder)", Pattern.CASE_INSENSITIVE);
    private final LearningTaskMapper taskMapper;
    private final LearningSubmissionMapper submissionMapper;
    private final ObjectMapper objectMapper;
    private final PoetMapper poetMapper;
    private final PoemMapper poemMapper;
    private final ScenicSpotMapper scenicSpotMapper;
    private final CulturalItemMapper culturalItemMapper;
    private final EventMapper eventMapper;
    private final SourceDocumentMapper sourceDocumentMapper;
    private final ContentReviewMapper contentReviewMapper;
    private final ContentSourceLinkMapper sourceLinkMapper;

    public LearningTaskService(LearningTaskMapper taskMapper,
                               LearningSubmissionMapper submissionMapper,
                               ObjectMapper objectMapper,
                               PoetMapper poetMapper,
                               PoemMapper poemMapper,
                               ScenicSpotMapper scenicSpotMapper,
                               CulturalItemMapper culturalItemMapper,
                               EventMapper eventMapper,
                               SourceDocumentMapper sourceDocumentMapper,
                               ContentReviewMapper contentReviewMapper) {
        this(taskMapper, submissionMapper, objectMapper, poetMapper, poemMapper, scenicSpotMapper,
                culturalItemMapper, eventMapper, sourceDocumentMapper, contentReviewMapper, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public LearningTaskService(LearningTaskMapper taskMapper,
                               LearningSubmissionMapper submissionMapper,
                               ObjectMapper objectMapper,
                               PoetMapper poetMapper,
                               PoemMapper poemMapper,
                               ScenicSpotMapper scenicSpotMapper,
                               CulturalItemMapper culturalItemMapper,
                               EventMapper eventMapper,
                               SourceDocumentMapper sourceDocumentMapper,
                               ContentReviewMapper contentReviewMapper,
                               ContentSourceLinkMapper sourceLinkMapper) {
        this.taskMapper = taskMapper;
        this.submissionMapper = submissionMapper;
        this.objectMapper = objectMapper;
        this.poetMapper = poetMapper;
        this.poemMapper = poemMapper;
        this.scenicSpotMapper = scenicSpotMapper;
        this.culturalItemMapper = culturalItemMapper;
        this.eventMapper = eventMapper;
        this.sourceDocumentMapper = sourceDocumentMapper;
        this.contentReviewMapper = contentReviewMapper;
        this.sourceLinkMapper = sourceLinkMapper;
    }

    public PageResult<LearningTask> list(int page, int size, String status, String keyword) {
        LambdaQueryWrapper<LearningTask> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) wrapper.eq(LearningTask::getStatus, status.trim());
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(LearningTask::getTitle, keyword)
                    .or().like(LearningTask::getCity, keyword)
                    .or().like(LearningTask::getTaskCode, keyword));
        }
        wrapper.orderByDesc(LearningTask::getUpdatedAt).orderByDesc(LearningTask::getId);
        Page<LearningTask> result = taskMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public LearningTask getById(Long id) {
        return id == null ? null : taskMapper.selectById(id);
    }

    public LearningTask getPublishedByCode(String taskCode) {
        if (!StringUtils.hasText(taskCode)) return null;
        return taskMapper.selectOne(new LambdaQueryWrapper<LearningTask>()
                .eq(LearningTask::getTaskCode, taskCode.trim())
                .eq(LearningTask::getStatus, LearningTask.PUBLISHED));
    }

    /**
     * 从已发布任务正文重建反思题的可信上下文，不接受客户端提交的题目或证据文本。
     */
    public LearningFeedbackContext resolveFeedbackContext(LearningTask task, String questionId) {
        if (task == null) throw new IllegalArgumentException("学习任务不能为空");
        if (!StringUtils.hasText(questionId)) throw new IllegalArgumentException("questionId 不能为空");

        JsonNode root;
        try {
            root = objectMapper.readTree(task.getContentJson());
        } catch (Exception e) {
            throw new IllegalArgumentException("学习任务内容不是合法 JSON");
        }
        JsonNode question = findQuestion(root, questionId.trim());
        if (question == null) throw new IllegalArgumentException("题目不存在：" + questionId);

        Set<String> entityKeys = questionEntityKeys(question);
        Set<Long> sourceIds = positiveIds(question.get("sourceIds"));
        List<String> evidenceItems = new java.util.ArrayList<>();
        JsonNode resources = root == null ? null : root.get("resources");
        if (resources != null && resources.isArray()) {
            for (JsonNode resource : resources) {
                if (!entityKeys.contains(resourceEntityKey(resource))) continue;
                Set<Long> resourceSources = positiveIds(resource.get("sourceIds"));
                Set<Long> canonicalSourceIds = resourceSources.stream()
                        .filter(sourceIds::contains)
                        .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
                if (canonicalSourceIds.isEmpty()) continue;
                String title = text(resource, "title");
                String snippet = text(resource, "snippet");
                String sourceLabel = "（来源："
                        + canonicalSourceIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining("、")) + "）";
                evidenceItems.add((StringUtils.hasText(title) ? title : "未命名材料") + "："
                        + (StringUtils.hasText(snippet) ? snippet : "暂无摘要") + sourceLabel);
            }
        }
        String evidence = evidenceItems.isEmpty()
                ? "未匹配到专属材料；请不要补写未在任务材料中出现的事实。"
                : String.join("\n", evidenceItems);
        return new LearningFeedbackContext(text(question, "prompt"), evidence);
    }

    private JsonNode findQuestion(JsonNode root, String questionId) {
        JsonNode steps = root == null ? null : root.get("steps");
        if (steps == null || !steps.isArray()) return null;
        for (JsonNode step : steps) {
            JsonNode questions = step == null ? null : step.get("questions");
            if (questions == null || !questions.isArray()) continue;
            for (JsonNode question : questions) {
                String storedId = text(question, "id");
                if (StringUtils.hasText(storedId) && questionId.equals(storedId.trim())) return question;
            }
        }
        return null;
    }

    private Set<String> questionEntityKeys(JsonNode question) {
        Set<String> keys = new LinkedHashSet<>();
        JsonNode refs = question == null ? null : question.get("entityRefs");
        if (refs != null && refs.isArray() && !refs.isEmpty()) {
            for (JsonNode ref : refs) {
                String key = entityKey(text(ref, "type"), ref == null ? null : ref.get("id"));
                if (key != null) keys.add(key);
            }
            return keys;
        }
        JsonNode ids = question == null ? null : question.get("entityIds");
        String type = text(question, "entityType");
        if (ids != null && ids.isArray()) {
            for (JsonNode id : ids) {
                String key = entityKey(type, id);
                if (key != null) keys.add(key);
            }
        }
        return keys;
    }

    private String resourceEntityKey(JsonNode resource) {
        return entityKey(text(resource, "entityType"), resource == null ? null : resource.get("entityId"));
    }

    private String entityKey(String type, JsonNode idNode) {
        if (!StringUtils.hasText(type) || idNode == null || !idNode.isIntegralNumber() || idNode.asLong() <= 0) {
            return null;
        }
        String normalized = "spot".equals(type.trim().toLowerCase()) ? "scenic_spot" : type.trim().toLowerCase();
        return normalized + ":" + idNode.asLong();
    }

    private Set<Long> positiveIds(JsonNode values) {
        Set<Long> ids = new java.util.LinkedHashSet<>();
        if (values == null || !values.isArray()) return ids;
        for (JsonNode value : values) {
            if (value != null && value.isIntegralNumber() && value.asLong() > 0) ids.add(value.asLong());
        }
        return ids;
    }

    @Transactional
    public LearningTask create(LearningTask task) {
        normalizeForWrite(task);
        // Creation never publishes a task; publication must go through updateStatus validation.
        task.setStatus(LearningTask.DRAFT);
        task.setId(null);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        taskMapper.insert(task);
        return task;
    }

    @Transactional
    public LearningTask update(Long id, LearningTask incoming) {
        LearningTask current = getById(id);
        if (current == null) throw new IllegalArgumentException("学习任务不存在");
        normalizeForWrite(incoming);
        incoming.setId(id);
        // Ordinary edits cannot retain publication. A published task must be revalidated and
        // explicitly published through updateStatus after its content changes.
        incoming.setStatus(LearningTask.PUBLISHED.equals(current.getStatus())
                ? LearningTask.DRAFT
                : current.getStatus());
        incoming.setCreatedAt(current.getCreatedAt());
        incoming.setUpdatedAt(LocalDateTime.now());
        taskMapper.updateById(incoming);
        return incoming;
    }

    @Transactional
    public LearningTask copy(Long id) {
        LearningTask original = getById(id);
        if (original == null) throw new IllegalArgumentException("学习任务不存在");

        String taskCode;
        int attempts = 0;
        do {
            taskCode = copyTaskCode(original.getTaskCode());
            if (++attempts > 20) throw new IllegalStateException("无法生成唯一的任务分享 ID");
        } while (taskMapper.selectOne(new LambdaQueryWrapper<LearningTask>()
                .eq(LearningTask::getTaskCode, taskCode)) != null);

        LearningTask copied = new LearningTask();
        copied.setTaskCode(taskCode);
        copied.setTitle(original.getTitle());
        copied.setCity(original.getCity());
        copied.setGoal(original.getGoal());
        copied.setBackground(original.getBackground());
        copied.setContentJson(original.getContentJson());
        copied.setExportTemplate(original.getExportTemplate());
        copied.setStatus(LearningTask.DRAFT);
        copied.setCreatedBy(original.getCreatedBy());
        copied.setCreatedAt(LocalDateTime.now());
        copied.setUpdatedAt(LocalDateTime.now());
        taskMapper.insert(copied);
        return copied;
    }

    @Transactional
    public LearningTask updateStatus(Long id, String status) {
        LearningTask task = getById(id);
        if (task == null) throw new IllegalArgumentException("学习任务不存在");
        if (!StringUtils.hasText(status)
                || !Set.of(LearningTask.DRAFT, LearningTask.PUBLISHED, LearningTask.ARCHIVED).contains(status.trim())) {
            throw new IllegalArgumentException("status 仅支持 draft/published/archived");
        }
        status = status.trim();
        if (LearningTask.PUBLISHED.equals(status)) validateForPublish(task);
        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        taskMapper.updateById(task);
        return task;
    }

    @Transactional
    public void delete(Long id) {
        if (getById(id) == null) throw new IllegalArgumentException("学习任务不存在");
        submissionMapper.delete(new LambdaQueryWrapper<LearningSubmission>().eq(LearningSubmission::getTaskId, id));
        taskMapper.deleteById(id);
    }

    @Transactional
    public LearningSubmission saveSubmission(String taskCode, LearningSubmissionRequest request) {
        LearningTask task = getPublishedByCode(taskCode);
        if (task == null) throw new IllegalArgumentException("学习任务不存在或尚未发布");
        if (request == null || !StringUtils.hasText(request.sessionKey())) {
            throw new IllegalArgumentException("sessionKey 不能为空");
        }
        String answers = request.answersJson();
        if (!StringUtils.hasText(answers) || answers.length() > 100_000) {
            throw new IllegalArgumentException("answersJson 不能为空且不能超过 100000 字符");
        }
        try {
            JsonNode node = objectMapper.readTree(answers);
            if (node == null || !node.isObject()) throw new IllegalArgumentException("answersJson 必须为 JSON 对象");
        } catch (Exception e) {
            if (e instanceof IllegalArgumentException iae) throw iae;
            throw new IllegalArgumentException("answersJson 不是合法 JSON");
        }
        String hash = hash(request.sessionKey());
        LearningSubmission submission = submissionMapper.selectOne(new LambdaQueryWrapper<LearningSubmission>()
                .eq(LearningSubmission::getTaskId, task.getId())
                .eq(LearningSubmission::getSessionKeyHash, hash));
        if (submission == null) {
            submission = new LearningSubmission();
            submission.setTaskId(task.getId());
            submission.setSessionKeyHash(hash);
            submission.setCreatedAt(LocalDateTime.now());
        }
        submission.setAnswersJson(answers);
        submission.setCurrentStep(request.currentStep() == null ? 0 : Math.max(0, request.currentStep()));
        submission.setStatus("submitted".equals(request.status()) ? "submitted" : "draft");
        submission.setUpdatedAt(LocalDateTime.now());
        if (submission.getId() == null) submissionMapper.insert(submission);
        else submissionMapper.updateById(submission);
        return submission;
    }

    public void validateForPublish(LearningTask task) {
        if (task == null) throw new IllegalArgumentException("学习任务不能为空");
        if (!StringUtils.hasText(task.getTaskCode()) || !task.getTaskCode().matches("[a-z0-9][a-z0-9-]{2,31}")) {
            throw new IllegalArgumentException("taskCode 必须为 3-32 位小写字母、数字或短横线");
        }
        if (!StringUtils.hasText(task.getTitle())) throw new IllegalArgumentException("title 不能为空");
        JsonNode root;
        try {
            root = objectMapper.readTree(task.getContentJson());
        } catch (Exception e) {
            throw new IllegalArgumentException("contentJson 不是合法 JSON");
        }
        if (containsPlaceholder(root)) {
            throw new IllegalArgumentException("任务内容包含未替换的占位文本");
        }
        validateResources(root);
        JsonNode steps = root == null ? null : root.get("steps");
        if (steps == null || !steps.isArray() || steps.size() != 3) {
            throw new IllegalArgumentException("任务必须包含 evidence、compare、reflection 三个步骤");
        }
        Set<String> seenTypes = new HashSet<>();
        Set<String> seenQuestionIds = new HashSet<>();
        for (JsonNode step : steps) {
            String type = normalizeStepType(text(step, "type"));
            if (!STEP_TYPES.contains(type) || !seenTypes.add(type)) {
                throw new IllegalArgumentException("步骤类型必须各出现一次：evidence/compare/reflection");
            }
            JsonNode questions = step.get("questions");
            if (questions == null || !questions.isArray() || questions.isEmpty()) {
                throw new IllegalArgumentException("每个步骤至少需要一个问题");
            }
            for (JsonNode question : questions) {
                String questionId = text(question, "id");
                if (!StringUtils.hasText(questionId)) {
                    throw new IllegalArgumentException("每个问题的题目 ID 不能为空");
                }
                if (!seenQuestionIds.add(questionId.trim())) {
                    throw new IllegalArgumentException("题目 ID 必须在任务内唯一：" + questionId.trim());
                }
                if (!StringUtils.hasText(text(question, "prompt"))) {
                    throw new IllegalArgumentException("每个问题都必须填写 prompt");
                }
                List<EntityRef> entityRefs = validateQuestionEntities(question);
                if ("compare".equals(type) && entityRefs.stream().distinct().count() < 2) {
                    throw new IllegalArgumentException("compare 问题至少需要引用两个实体");
                }
                if (!hasValues(question.get("sourceIds"))) {
                    throw new IllegalArgumentException("每个问题必须绑定至少一个实体和一个来源");
                }
                if ("compare".equals(type)) {
                    Set<Long> distinctSourceIds = new HashSet<>();
                    for (JsonNode sourceId : question.get("sourceIds")) {
                        if (sourceId != null && sourceId.isIntegralNumber()) {
                            distinctSourceIds.add(sourceId.asLong());
                        }
                    }
                    if (distinctSourceIds.size() < 2) {
                        throw new IllegalArgumentException("compare 问题至少需要绑定两个不同来源");
                    }
                }
                validateQuestionResourceCoverage(question, root.get("resources"));
                for (JsonNode sourceId : question.get("sourceIds")) {
                    long id = sourceId.asLong();
                    if (sourceDocumentMapper.selectById(id) == null) {
                        throw new IllegalArgumentException("来源文献不存在：" + id);
                    }
                    if (sourceLinkMapper != null && !isLinkedToAnyEntity(entityRefs, id)) {
                        throw new IllegalArgumentException("来源未关联到题目实体：" + id);
                    }
                }
            }
        }
    }

    private List<EntityRef> validateQuestionEntities(JsonNode question) {
        JsonNode refs = question.get("entityRefs");
        if (refs != null && refs.isArray() && !refs.isEmpty()) {
            List<EntityRef> entities = new java.util.ArrayList<>();
            for (JsonNode ref : refs) {
                String type = normalizeEntityType(text(ref, "type"));
                JsonNode idNode = ref == null ? null : ref.get("id");
                if (!StringUtils.hasText(type) || idNode == null || !idNode.isIntegralNumber() || idNode.asLong() <= 0) {
                    throw new IllegalArgumentException("entityRefs 中每项都必须包含支持的 type 和正数 id");
                }
                validateEntityReference(type, idNode.asLong());
                entities.add(new EntityRef(canonicalEntityType(type), idNode.asLong()));
            }
            return entities;
        }

        if (!hasValues(question.get("entityIds"))) {
            throw new IllegalArgumentException("每个问题必须绑定至少一个实体和一个来源");
        }
        String entityType = normalizeEntityType(text(question, "entityType"));
        if (!isSupportedEntityType(entityType)) {
            throw new IllegalArgumentException("每个问题必须填写支持的 entityType：poet/poem/spot/scenic_spot/cultural_item/event，或使用 entityRefs");
        }
        for (JsonNode entityId : question.get("entityIds")) {
            validateEntityReference(entityType, entityId.asLong());
        }
        List<EntityRef> entities = new java.util.ArrayList<>();
        for (JsonNode entityId : question.get("entityIds")) {
            entities.add(new EntityRef(canonicalEntityType(entityType), entityId.asLong()));
        }
        return entities;
    }

    private void validateResources(JsonNode root) {
        JsonNode resources = root == null ? null : root.get("resources");
        if (resources == null || !resources.isArray() || resources.isEmpty()) {
            throw new IllegalArgumentException("resources 必须是非空数组");
        }
        for (JsonNode resource : resources) {
            String type = normalizeEntityType(text(resource, "entityType"));
            JsonNode entityId = resource == null ? null : resource.get("entityId");
            if (!StringUtils.hasText(type) || entityId == null || !entityId.isIntegralNumber() || entityId.asLong() <= 0) {
                throw new IllegalArgumentException("每个资源都必须填写支持的 entityType 和正数 entityId");
            }
            validateEntityReference(type, entityId.asLong());
            if (!StringUtils.hasText(text(resource, "title")) || !StringUtils.hasText(text(resource, "snippet"))) {
                throw new IllegalArgumentException("每个资源都必须填写 title 和 snippet");
            }
            List<EntityRef> entities = List.of(new EntityRef(canonicalEntityType(type), entityId.asLong()));
            JsonNode sourceIds = resource.get("sourceIds");
            if (!hasValues(sourceIds)) {
                throw new IllegalArgumentException("每个资源必须绑定至少一个来源");
            }
            for (JsonNode sourceId : sourceIds) {
                long id = sourceId.asLong();
                if (sourceDocumentMapper.selectById(id) == null) {
                    throw new IllegalArgumentException("资源来源文献不存在：" + id);
                }
                if (sourceLinkMapper != null && !isLinkedToAnyEntity(entities, id)) {
                    throw new IllegalArgumentException("资源来源未关联到资源实体：" + id);
                }
            }
        }
    }

    /**
     * 保证题目声明的每个实体和来源，都能由同一份任务资源中的实体-来源交集解释。
     * 规则与 scripts/learning-task-check.mjs 保持一致，避免离线检查通过而发布接口放行不完整证据链。
     */
    private void validateQuestionResourceCoverage(JsonNode question, JsonNode resources) {
        Set<String> questionEntities = questionEntityKeys(question);
        Set<Long> questionSources = positiveIds(question == null ? null : question.get("sourceIds"));
        if (questionEntities.isEmpty() || questionSources.isEmpty()) return;

        Set<String> coveredEntities = new LinkedHashSet<>();
        Set<Long> coveredSources = new LinkedHashSet<>();
        if (resources != null && resources.isArray()) {
            for (JsonNode resource : resources) {
                String entityKey = resourceEntityKey(resource);
                if (entityKey == null || !questionEntities.contains(entityKey)) continue;
                for (Long sourceId : positiveIds(resource == null ? null : resource.get("sourceIds"))) {
                    if (questionSources.contains(sourceId)) {
                        coveredEntities.add(entityKey);
                        coveredSources.add(sourceId);
                    }
                }
            }
        }

        Set<String> missingEntities = new LinkedHashSet<>(questionEntities);
        missingEntities.removeAll(coveredEntities);
        if (!missingEntities.isEmpty()) {
            throw new IllegalArgumentException("题目实体缺少匹配资源：" + String.join("、", missingEntities));
        }
        Set<Long> missingSources = new LinkedHashSet<>(questionSources);
        missingSources.removeAll(coveredSources);
        if (!missingSources.isEmpty()) {
            throw new IllegalArgumentException("题目来源缺少匹配资源："
                    + missingSources.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining("、")));
        }
    }

    private boolean isLinkedToAnyEntity(List<EntityRef> entities, long sourceId) {
        for (EntityRef entity : entities) {
            String storedType = canonicalEntityType(entity.type());
            ContentSourceLink link = sourceLinkMapper.selectOne(new LambdaQueryWrapper<ContentSourceLink>()
                    .eq(ContentSourceLink::getEntityType, storedType)
                    .eq(ContentSourceLink::getEntityId, entity.id())
                    .eq(ContentSourceLink::getSourceDocumentId, sourceId)
                    .last("LIMIT 1"));
            if (link != null) return true;
        }
        return false;
    }

    private record EntityRef(String type, long id) { }

    private boolean isSupportedEntityType(String entityType) {
        return Set.of("poet", "poem", "spot", "scenic_spot", "cultural_item", "event")
                .contains(normalizeEntityType(entityType));
    }

    private void validateEntityReference(String entityType, long entityId) {
        String normalizedType = normalizeEntityType(entityType);
        if (!isSupportedEntityType(normalizedType)) {
            throw new IllegalArgumentException("不支持的实体类型：" + entityType);
        }
        String reviewType = canonicalEntityType(normalizedType);
        boolean exists = switch (normalizedType) {
            case "poet" -> poetMapper.selectById(entityId) != null;
            case "poem" -> poemMapper.selectById(entityId) != null;
            case "spot", "scenic_spot" -> scenicSpotMapper.selectById(entityId) != null;
            case "cultural_item" -> {
                CulturalItem item = culturalItemMapper.selectById(entityId);
                if (item == null) {
                    yield false;
                }
                if (!CulturalItemService.STATUS_PUBLISHED.equals(item.getStatus())) {
                    throw new IllegalArgumentException("实体 cultural_item " + entityId + " 尚未发布");
                }
                yield true;
            }
            case "event" -> eventMapper.selectById(entityId) != null;
            default -> throw new IllegalArgumentException("不支持的实体类型：" + entityType);
        };
        if (!exists) {
            throw new IllegalArgumentException("实体不存在：" + normalizedType + " " + entityId);
        }
        ContentReview review = contentReviewMapper.selectOne(new LambdaQueryWrapper<ContentReview>()
                .eq(ContentReview::getEntityType, reviewType)
                .eq(ContentReview::getEntityId, entityId));
        if (review == null || !ContentReview.PUBLISHED.equals(review.getStatus())) {
            String status = review == null ? "missing" : review.getStatus();
            throw new IllegalArgumentException("实体未通过审核：" + normalizedType + " " + entityId + "（" + status + "）");
        }
    }

    private String normalizeEntityType(String entityType) {
        return StringUtils.hasText(entityType) ? entityType.trim().toLowerCase() : "";
    }

    private String normalizeStepType(String stepType) {
        return StringUtils.hasText(stepType) ? stepType.trim().toLowerCase() : "";
    }

    private boolean containsPlaceholder(JsonNode node) {
        if (node == null) return false;
        if (node.isTextual()) return PLACEHOLDER_PATTERN.matcher(node.asText()).find();
        if (!node.isContainerNode()) return false;
        for (JsonNode child : node) {
            if (containsPlaceholder(child)) return true;
        }
        return false;
    }

    private String canonicalEntityType(String entityType) {
        String normalized = normalizeEntityType(entityType);
        return "spot".equals(normalized) ? "scenic_spot" : normalized;
    }

    private void normalizeForWrite(LearningTask task) {
        if (task == null) throw new IllegalArgumentException("学习任务不能为空");
        if (!StringUtils.hasText(task.getTaskCode())) task.setTaskCode("task-" + UUID.randomUUID().toString().substring(0, 8));
        task.setTaskCode(task.getTaskCode().trim().toLowerCase());
        if (!StringUtils.hasText(task.getTitle())) throw new IllegalArgumentException("title 不能为空");
        if (!StringUtils.hasText(task.getContentJson())) throw new IllegalArgumentException("contentJson 不能为空");
        if (!StringUtils.hasText(task.getStatus())) task.setStatus(LearningTask.DRAFT);
        if (!StringUtils.hasText(task.getExportTemplate())) task.setExportTemplate("markdown");
    }

    private String copyTaskCode(String originalCode) {
        String base = StringUtils.hasText(originalCode) ? originalCode.trim().toLowerCase() : "task";
        base = base.replaceAll("[^a-z0-9-]", "-");
        String suffix = "-copy-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        int maxBaseLength = Math.max(1, 32 - suffix.length());
        if (base.length() > maxBaseLength) base = base.substring(0, maxBaseLength);
        return base + suffix;
    }

    private boolean hasValues(JsonNode node) {
        if (node == null || !node.isArray() || node.isEmpty()) return false;
        for (JsonNode value : node) {
            if (!value.isIntegralNumber() || value.asLong() <= 0) return false;
        }
        return true;
    }
    private String text(JsonNode node, String field) {
        JsonNode value = node == null ? null : node.get(field);
        return value == null ? null : value.asText(null);
    }

    private String hash(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.trim().getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 不可用", e);
        }
    }
}
