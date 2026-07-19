package com.sjg.util;

import com.sjg.entity.Poet;
import org.springframework.util.StringUtils;

/**
 * 诗人完整度分计算(0-100)。
 * 权重: bio(20) + 真人头像(15) + 水墨头像(15) + 风格(15)
 *       + 籍贯(10) + 生年(10) + 诗篇数(15, ≥3 满)
 * 头像字段在库中为 JSON 数组字符串(如 ["https://..."]), 非空且非 [] 视为有。
 */
public final class PoetCompletenessCalculator {

    private PoetCompletenessCalculator() {}

    public static int compute(Poet p, int poemCount) {
        if (p == null) return 0;
        int score = 0;
        if (StringUtils.hasText(p.getBiography())) score += 20;
        if (hasMedia(p.getAvatarUrl())) score += 15;
        if (hasMedia(p.getAvatarAnimeUrl())) score += 15;
        if (StringUtils.hasText(p.getStyle())) score += 15;
        if (StringUtils.hasText(p.getBirthplace())) score += 10;
        if (p.getBirthYear() != null) score += 10;
        int pc = poemCount < 0 ? 0 : Math.min(poemCount, 3);
        score += pc * 5; // 0->0, 1->5, 2->10, >=3->15
        return Math.min(score, 100);
    }

    private static boolean hasMedia(String s) {
        if (s == null) return false;
        String t = s.trim();
        return !t.isEmpty() && !t.equals("[]");
    }
}
