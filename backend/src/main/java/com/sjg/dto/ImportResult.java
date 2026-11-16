package com.sjg.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ImportResult {
    private boolean success = true;
    private String message = "成功导入 0 条，跳过 0 条";
    private int importedCount;
    private int skippedCount;
    private List<String> errors = new ArrayList<>();

    public static ImportResult empty() {
        return new ImportResult();
    }

    public void imported() {
        importedCount++;
        refreshMessage();
    }

    public void skipped(int rowNumber, String reason) {
        skippedCount++;
        errors.add("第 " + rowNumber + " 行：" + reason);
        refreshMessage();
    }

    private void refreshMessage() {
        message = "成功导入 " + importedCount + " 条，跳过 " + skippedCount + " 条";
    }
}
