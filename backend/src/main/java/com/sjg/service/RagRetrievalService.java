package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.Poem;
import com.sjg.entity.Poet;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.ScenicSpotMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 轻量 RAG 检索：按关键字在 poet/poem/scenic_spot 三表做 LIKE 检索，
 * 组装成结构化上下文片段注入 LLM 系统提示。
 * v1 用 SQL 关键字检索（库内无向量索引）；中文无分词，用 2-gram + 整串提升召回。
 *
 * 检索用 CONCAT(IFNULL(...)) LIKE {0} 单占位符，每个关键字一个值，避免参数绑定歧义。
 */
@Service
public class RagRetrievalService {

    private final PoetMapper poetMapper;
    private final PoemMapper poemMapper;
    private final ScenicSpotMapper spotMapper;

    @Value("${llm.rag.max-results:3}") private int perCategory;

    /** 各表搜索字段拼接为单列，便于一次 LIKE 匹配 */
    private static final String POET_CLAUSE =
            "(CONCAT(IFNULL(name,''),IFNULL(birthplace,''),IFNULL(biography,''),IFNULL(style,'')) LIKE {0})";
    private static final String POEM_CLAUSE =
            "(CONCAT(IFNULL(title,''),IFNULL(content,''),IFNULL(background,'')) LIKE {0})";
    private static final String SPOT_CLAUSE =
            "(CONCAT(IFNULL(name,''),IFNULL(description,''),IFNULL(region,''),IFNULL(address,'')) LIKE {0})";

    public RagRetrievalService(PoetMapper poetMapper, PoemMapper poemMapper, ScenicSpotMapper spotMapper) {
        this.poetMapper = poetMapper;
        this.poemMapper = poemMapper;
        this.spotMapper = spotMapper;
    }

    /**
     * 按用户提问检索相关资料，返回结构化上下文文本（可能为空）。
     */
    public String retrieve(String query) {
        List<String> keywords = extractKeywords(query);
        if (keywords.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        appendPoets(sb, keywords);
        appendPoems(sb, keywords);
        appendSpots(sb, keywords);
        return sb.toString().trim();
    }

    private void appendPoets(StringBuilder sb, List<String> keywords) {
        try {
            LambdaQueryWrapper<Poet> w = new LambdaQueryWrapper<>();
            w.and(q -> orApply(q, keywords, POET_CLAUSE));
            w.last("LIMIT " + perCategory);
            List<Poet> poets = poetMapper.selectList(w);
            if (poets.isEmpty()) return;
            sb.append("【诗人】\n");
            for (Poet p : poets) {
                sb.append("- ").append(p.getName());
                if (p.getBirthYear() != null || p.getDeathYear() != null) {
                    sb.append("(").append(p.getBirthYear()).append("-").append(p.getDeathYear()).append(")");
                }
                if (StringUtils.hasText(p.getBirthplace())) sb.append("，籍贯").append(p.getBirthplace());
                if (StringUtils.hasText(p.getBiography())) sb.append("：").append(truncate(p.getBiography(), 80));
                sb.append("\n");
            }
        } catch (Exception ignore) {
            // 单类失败不影响其它
        }
    }

    private void appendPoems(StringBuilder sb, List<String> keywords) {
        try {
            LambdaQueryWrapper<Poem> w = new LambdaQueryWrapper<>();
            w.and(q -> orApply(q, keywords, POEM_CLAUSE));
            w.last("LIMIT " + perCategory);
            List<Poem> poems = poemMapper.selectList(w);
            if (poems.isEmpty()) return;
            sb.append("【诗词】\n");
            for (Poem pm : poems) {
                sb.append("- 《").append(pm.getTitle()).append("》");
                if (pm.getPoetId() != null) {
                    Poet poet = poetMapper.selectById(pm.getPoetId());
                    if (poet != null) sb.append("（").append(poet.getName()).append("）");
                }
                if (StringUtils.hasText(pm.getContent())) sb.append("：").append(truncate(pm.getContent(), 60));
                sb.append("\n");
            }
        } catch (Exception ignore) {
            // 单类失败不影响其它
        }
    }

    private void appendSpots(StringBuilder sb, List<String> keywords) {
        try {
            LambdaQueryWrapper<ScenicSpot> w = new LambdaQueryWrapper<>();
            w.and(q -> orApply(q, keywords, SPOT_CLAUSE));
            w.last("LIMIT " + perCategory);
            List<ScenicSpot> spots = spotMapper.selectList(w);
            if (spots.isEmpty()) return;
            sb.append("【景点】\n");
            for (ScenicSpot s : spots) {
                sb.append("- ").append(s.getName());
                if (StringUtils.hasText(s.getRegion())) sb.append("（").append(s.getRegion()).append("）");
                if (StringUtils.hasText(s.getDescription())) sb.append("：").append(truncate(s.getDescription(), 80));
                sb.append("\n");
            }
        } catch (Exception ignore) {
            // 单类失败不影响其它
        }
    }

    /**
     * 在 wrapper 上对每个关键字追加一个 OR 的 apply 子句。
     * 第一个用 apply，其余用 or().apply()，整体被外层 .and(consumer) 包成 (c1 OR c2 OR ...)。
     */
    private <T> void orApply(com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<T> q,
                              List<String> keywords, String clause) {
        boolean first = true;
        for (String kw : keywords) {
            if (first) {
                q.apply(clause, "%" + kw + "%");
                first = false;
            } else {
                q.or().apply(clause, "%" + kw + "%");
            }
        }
    }

    /** 去标点 → 取整串 + 2-gram，去重截断，作为 LIKE 关键字 */
    private List<String> extractKeywords(String query) {
        String clean = query == null ? "" : query.replaceAll(
                "[\\s，。、；：！？,.?!;:（）()【】\\[\\]\"'“”‘’]", "");
        if (clean.isEmpty()) return List.of();
        Set<String> set = new LinkedHashSet<>();
        set.add(clean);
        for (int i = 0; i + 2 <= clean.length(); i++) {
            set.add(clean.substring(i, i + 2));
        }
        List<String> out = new ArrayList<>(set);
        if (out.size() > 8) out = out.subList(0, 8);
        return out;
    }

    private String truncate(String s, int n) {
        return s == null ? "" : (s.length() > n ? s.substring(0, n) + "…" : s);
    }
}
