package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.AbstractWrapper;
import java.util.Map;

/** Column names are a server-side allowlist; user queries are always parameters. */
public final class FullTextSearch {
    private static final Map<String,String> COLUMNS = Map.of(
            "poem","title,content,background", "poet","name,birthplace,biography,style",
            "scenic_spot","name,description,region,address", "cultural_item","title,summary,content",
            "event","title,description,significance");
    private FullTextSearch() { }
    public static void apply(AbstractWrapper<?,?,?> wrapper, String entity, String keyword) {
        String columns = COLUMNS.get(entity);
        if (columns == null) throw new IllegalArgumentException("Unsupported search entity");
        wrapper.apply("MATCH("+columns+") AGAINST ({0} IN NATURAL LANGUAGE MODE)",keyword);
    }
}
