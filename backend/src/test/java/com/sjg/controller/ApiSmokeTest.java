package com.sjg.controller;

import com.sjg.controller.admin.ContentReviewController;
import com.sjg.controller.admin.CulturalController;
import com.sjg.controller.admin.AiMetricsController;
import com.sjg.controller.pub.PublicChatController;
import com.sjg.controller.pub.PublicCulturalController;
import com.sjg.controller.pub.PublicLearningTaskController;
import com.sjg.controller.pub.PublicPoemController;
import com.sjg.dto.PageResult;
import com.sjg.dto.SourceSummary;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.ContentReview;
import com.sjg.entity.Poem;
import com.sjg.entity.User;
import com.sjg.mapper.AiPoemMapper;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.CraftDetailMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.FestivalDetailMapper;
import com.sjg.mapper.FoodOperaDetailMapper;
import com.sjg.mapper.LiteratureDetailMapper;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.mapper.PoemEventMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import com.sjg.mapper.ScenicSpotMapper;
import com.sjg.mapper.SourceDocumentMapper;
import com.sjg.mapper.AiAuditLogMapper;
import com.sjg.mapper.LearningSubmissionMapper;
import com.sjg.mapper.LearningTaskMapper;
import com.sjg.mapper.UserMapper;
import com.sjg.service.CulturalItemService;
import com.sjg.service.ContentReviewService;
import com.sjg.service.AiAuditService;
import com.sjg.service.AiMetricsService;
import com.sjg.service.ChatService;
import com.sjg.service.LearningTaskService;
import com.sjg.service.PoemService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        PublicPoemController.class,
        PublicCulturalController.class,
        PublicChatController.class,
        PublicLearningTaskController.class,
        AiMetricsController.class,
        CulturalController.class,
        ContentReviewController.class
})
@org.springframework.test.context.ContextConfiguration(classes = ApiSmokeTest.WebTestConfig.class)
@Import(com.sjg.config.SecurityConfig.class)
class ApiSmokeTest {

    @TestConfiguration(proxyBeanMethods = false)
    static class WebTestConfig {
        @Bean
        PublicPoemController publicPoemController(PoemService poemService, PoetMapper poetMapper,
                                                   DynastyMapper dynastyMapper, ScenicSpotMapper spotMapper,
                                                   ContentReviewService contentReviewService) {
            return new PublicPoemController(poemService, poetMapper, dynastyMapper, spotMapper,
                    contentReviewService);
        }

        @Bean
        PublicCulturalController publicCulturalController(CulturalItemService culturalItemService,
                                                           ContentReviewService contentReviewService) {
            return new PublicCulturalController(culturalItemService, contentReviewService);
        }

        @Bean
        PublicChatController publicChatController(ChatService chatService, AiAuditService auditService) {
            return new PublicChatController(chatService, auditService);
        }

        @Bean
        PublicLearningTaskController publicLearningTaskController(LearningTaskService taskService,
                                                                    ChatService chatService) {
            return new PublicLearningTaskController(taskService, chatService);
        }

        @Bean
        AiMetricsController aiMetricsController(AiMetricsService metricsService) {
            return new AiMetricsController(metricsService);
        }

        @Bean
        CulturalController culturalController(CulturalItemService culturalItemService) {
            return new CulturalController(culturalItemService);
        }
    }

    @Autowired
    MockMvc mockMvc;

    @MockBean
    PoemService poemService;

    @MockBean
    CulturalItemService culturalItemService;

    @MockBean
    ContentReviewService contentReviewService;

    @MockBean
    ChatService chatService;

    @MockBean
    AiAuditService aiAuditService;

    @MockBean
    LearningTaskService learningTaskService;

    @MockBean
    AiMetricsService aiMetricsService;

    @MockBean
    PoetMapper poetMapper;

    @MockBean
    DynastyMapper dynastyMapper;

    @MockBean
    ScenicSpotMapper spotMapper;

    @MockBean AiPoemMapper aiPoemMapper;
    @MockBean CraftDetailMapper craftDetailMapper;
    @MockBean CulturalItemMapper culturalItemMapper;
    @MockBean EventMapper eventMapper;
    @MockBean FestivalDetailMapper festivalDetailMapper;
    @MockBean FoodOperaDetailMapper foodOperaDetailMapper;
    @MockBean LiteratureDetailMapper literatureDetailMapper;
    @MockBean PoemAnalysisMapper poemAnalysisMapper;
    @MockBean PoemEventMapper poemEventMapper;
    @MockBean PoemMapper poemMapper;
    @MockBean PoetRelationMapper poetRelationMapper;
    @MockBean UserMapper userMapper;
    @MockBean ContentReviewMapper contentReviewMapper;
    @MockBean ContentSourceLinkMapper contentSourceLinkMapper;
    @MockBean SourceDocumentMapper sourceDocumentMapper;
    @MockBean AiAuditLogMapper aiAuditLogMapper;
    @MockBean LearningSubmissionMapper learningSubmissionMapper;
    @MockBean LearningTaskMapper learningTaskMapper;

    @MockBean
    com.sjg.util.JwtUtil jwtUtil;

    @Test
    @DisplayName("公开诗词列表返回统一分页结构")
    void publicPoemListReturnsPageEnvelope() throws Exception {
        Poem poem = new Poem();
        poem.setId(1L);
        poem.setTitle("静夜思");
        when(poemService.listPublished(1, 20, "月", null))
                .thenReturn(new PageResult<>(List.of(poem), 1, 1, 20));

        mockMvc.perform(get("/api/public/poems")
                        .param("keyword", "月")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records[0].title").value("静夜思"));
    }

    @Test
    @DisplayName("公开诗词详情不存在时返回 404")
    void publicPoemDetailReturnsNotFound() throws Exception {
        when(poemService.getById(404L)).thenReturn(null);

        mockMvc.perform(get("/api/public/poems/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    @DisplayName("公开诗词详情包含来源数组")
    void publicPoemDetailIncludesSources() throws Exception {
        Poem poem = new Poem();
        poem.setId(1L);
        poem.setTitle("静夜思");
        when(poemService.getById(1L)).thenReturn(poem);
        ContentReview review = new ContentReview();
        review.setEntityType("poem");
        review.setEntityId(1L);
        review.setStatus(ContentReview.PUBLISHED);
        when(contentReviewService.getReview("poem", 1L)).thenReturn(review);
        SourceSummary source = new SourceSummary();
        source.setTitle("唐诗选注");
        when(contentReviewService.listSourceSummaries("poem", 1L)).thenReturn(List.of(source));

        mockMvc.perform(get("/api/public/poems/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sources[0].title").value("唐诗选注"));
    }

    @Test
    @DisplayName("公开诗词详情未发布时返回 404")
    void publicPoemDetailReturnsNotFoundWhenUnpublished() throws Exception {
        Poem poem = new Poem();
        poem.setId(2L);
        poem.setTitle("草稿诗");
        when(poemService.getById(2L)).thenReturn(poem);
        ContentReview review = new ContentReview();
        review.setEntityType("poem");
        review.setEntityId(2L);
        review.setStatus(ContentReview.DRAFT);
        when(contentReviewService.getReview("poem", 2L)).thenReturn(review);

        mockMvc.perform(get("/api/public/poems/2"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    @DisplayName("公开文化条目过滤参数传递到服务层")
    void publicCulturalListForwardsFilters() throws Exception {
        CulturalItem item = new CulturalItem();
        item.setId(2L);
        item.setTitle("泉水文化");
        when(culturalItemService.list(1, 20, "literature", "济南", "泉", null, true))
                .thenReturn(new PageResult<>(List.of(item), 1, 1, 20));

        mockMvc.perform(get("/api/public/cultural")
                        .param("category", "literature")
                        .param("region", "济南")
                        .param("keyword", "泉"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records[0].title").value("泉水文化"));
    }

    @Test
    @DisplayName("公开 AI 反馈接受支持的反馈类型")
    void publicChatFeedbackAcceptsSupportedValue() throws Exception {
        mockMvc.perform(post("/api/public/chat/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"auditId\":9,\"feedback\":\"helpful\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("公开学习任务仅返回已发布任务")
    void publicLearningTaskNotFoundWhenUnpublished() throws Exception {
        when(learningTaskService.getPublishedByCode("missing-task")).thenReturn(null);

        mockMvc.perform(get("/api/public/learning-tasks/missing-task"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    @DisplayName("管理端 AI 指标接口保持统一返回结构")
    void aiMetricsSummaryUsesResultEnvelope() throws Exception {
        when(aiMetricsService.summary(24)).thenReturn(java.util.Map.of("totalRequests", 0));

        mockMvc.perform(get("/api/admin/ai-metrics/summary").param("hours", "24"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("未登录或登录已过期"))
                .andExpect(jsonPath("$.data").value(org.hamcrest.Matchers.nullValue()));
    }

    @Test
    @DisplayName("管理端 GET 普通用户也必须被拒绝")
    void adminGetRequiresAdminAuthorityForRegularUser() throws Exception {
        User user = new User();
        user.setUsername("reader");
        user.setRole("user");
        user.setStatus("approved");
        when(jwtUtil.validateToken("user-token")).thenReturn(true);
        when(jwtUtil.getUsernameFromToken("user-token")).thenReturn("reader");
        when(userMapper.selectOne(any())).thenReturn(user);

        mockMvc.perform(get("/api/admin/ai-metrics/summary")
                        .header("Authorization", "Bearer user-token")
                        .param("hours", "24"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.message").value("无权访问"));
    }

    @Test
    @DisplayName("管理端 GET 管理员可以访问")
    void adminGetAllowsAdminAuthority() throws Exception {
        User admin = new User();
        admin.setUsername("admin");
        admin.setRole("admin");
        admin.setStatus("approved");
        when(jwtUtil.validateToken("admin-token")).thenReturn(true);
        when(jwtUtil.getUsernameFromToken("admin-token")).thenReturn("admin");
        when(userMapper.selectOne(any())).thenReturn(admin);
        when(aiMetricsService.summary(24)).thenReturn(java.util.Map.of("totalRequests", 0));

        mockMvc.perform(get("/api/admin/ai-metrics/summary")
                        .header("Authorization", "Bearer admin-token")
                        .param("hours", "24"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalRequests").value(0));
    }

    @Test
    @DisplayName("已禁用账号的旧 JWT 不能建立认证")
    void disabledAccountTokenCannotAuthenticate() throws Exception {
        User disabled = new User();
        disabled.setUsername("disabled-admin");
        disabled.setRole("admin");
        disabled.setStatus("disabled");
        when(jwtUtil.validateToken("disabled-token")).thenReturn(true);
        when(jwtUtil.getUsernameFromToken("disabled-token")).thenReturn("disabled-admin");
        when(userMapper.selectOne(any())).thenReturn(disabled);

        mockMvc.perform(get("/api/admin/ai-metrics/summary")
                        .header("Authorization", "Bearer disabled-token")
                        .param("hours", "24"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("已拒绝账号的旧 JWT 不能建立认证")
    void rejectedAccountTokenCannotAuthenticate() throws Exception {
        User rejected = new User();
        rejected.setUsername("rejected-admin");
        rejected.setRole("admin");
        rejected.setStatus("rejected");
        when(jwtUtil.validateToken("rejected-token")).thenReturn(true);
        when(jwtUtil.getUsernameFromToken("rejected-token")).thenReturn("rejected-admin");
        when(userMapper.selectOne(any())).thenReturn(rejected);

        mockMvc.perform(get("/api/admin/ai-metrics/summary")
                        .header("Authorization", "Bearer rejected-token")
                        .param("hours", "24"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("公开文化条目详情包含来源数组")
    void publicCulturalDetailIncludesSources() throws Exception {
        CulturalItem item = new CulturalItem();
        item.setId(2L);
        item.setTitle("泉水文化");
        item.setStatus(CulturalItemService.STATUS_PUBLISHED);
        java.util.Map<String, Object> view = new java.util.HashMap<>();
        view.put("item", item);
        when(culturalItemService.getDetailView(2L)).thenReturn(view);
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.PUBLISHED);
        when(contentReviewService.getReview("cultural_item", 2L)).thenReturn(review);
        when(contentReviewService.listSourceSummaries("cultural_item", 2L)).thenReturn(List.of());

        mockMvc.perform(get("/api/public/cultural/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sources").isArray())
                .andExpect(jsonPath("$.data.sources").isEmpty());
    }

    @Test
    @DisplayName("管理端未认证写操作被拒绝")
    void adminWriteRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/admin/cultural")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"item\":{\"title\":\"未授权\"}}"))
                .andExpect(status().isUnauthorized());
    }
}
