package com.sjg.service;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FullTextSearchTest {
    @Test void indexedSearchBindsTheQueryInsteadOfInterpolatingSql() {
        QueryWrapper<Object> query = new QueryWrapper<>();
        FullTextSearch.apply(query, "poem", "黄河' OR 1=1 --");
        assertTrue(query.getSqlSegment().contains("MATCH(title,content,background)"));
        assertFalse(query.getSqlSegment().contains("OR 1=1"));
        assertTrue(query.getParamNameValuePairs().containsValue("黄河' OR 1=1 --"));
        assertThrows(IllegalArgumentException.class, () -> FullTextSearch.apply(new QueryWrapper<>(), "unsafe-table", "query"));
    }
}
