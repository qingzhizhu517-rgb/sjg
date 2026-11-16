package com.sjg.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ImportResultTest {

    @Test
    void recordsImportedRowsSkippedRowsAndWarnings() {
        ImportResult result = ImportResult.empty();

        result.imported();
        result.skipped(3, "名称为空");

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getImportedCount()).isEqualTo(1);
        assertThat(result.getSkippedCount()).isEqualTo(1);
        assertThat(result.getErrors()).contains("第 3 行：名称为空");
        assertThat(result.getMessage()).isEqualTo("成功导入 1 条，跳过 1 条");
    }
}
