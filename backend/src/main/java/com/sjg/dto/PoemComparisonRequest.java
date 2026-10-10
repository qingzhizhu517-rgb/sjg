package com.sjg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.io.IOException;

/** 客户端只能选择材料与阅读方向，原文、来源和模型指令始终由服务端构造。 */
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "两篇已发布诗词的对照阅读请求")
public record PoemComparisonRequest(
        @Schema(description = "恰好两个不同的正整数诗词 ID")
        @JsonDeserialize(contentUsing = NumericIdDeserializer.class) List<Long> poemIds,
        @Schema(description = "imagery / perspective / emotion / language") String focus,
        @Schema(description = "compare / feedback") String mode,
        @Schema(description = "feedback 模式的个人思考，最多3000字符") String answer
) {
    /** 只收JSON整数数字，避免默认Jackson把1.9静默转换成1并比较了另一篇材料。 */
    public static final class NumericIdDeserializer extends StdDeserializer<Long> {
        public NumericIdDeserializer() { super(Long.class); }

        @Override
        public Long deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            if (!parser.hasToken(JsonToken.VALUE_NUMBER_INT)) {
                throw JsonMappingException.from(parser, "诗词ID必须为整数数字");
            }
            return parser.getLongValue();
        }
    }
}
