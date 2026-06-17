package com.sjg.config;

import com.sjg.dto.Result;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Result<Void>> handleDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException e) {
        String message = "操作失败，存在关联数据限制";
        String rootMsg = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
        if (rootMsg != null) {
            if (rootMsg.contains("Cannot delete or update a parent row") && rootMsg.contains("foreign key constraint fails")) {
                if (rootMsg.contains("`poem`") && rootMsg.contains("`poet_id`")) {
                    message = "删除失败：该诗人名下还有关联的诗词，请先删除或解绑关联的诗词后重试。";
                } else if (rootMsg.contains("`poem_event`") && rootMsg.contains("`poem_id`")) {
                    message = "删除失败：该诗词已被关联至历史事件中，请先从对应事件中移除关联后重试。";
                } else if (rootMsg.contains("`poem_event`") && rootMsg.contains("`event_id`")) {
                    message = "删除失败：该事件已被关联至诗词中，请先从对应诗词中移除此事件后重试。";
                } else if (rootMsg.contains("`poem`") && rootMsg.contains("`spot_id`")) {
                    message = "删除失败：该景点名下还有关联的诗词，请先删除或解绑关联的诗词后重试。";
                } else {
                    message = "无法删除：该记录已被其他数据（外键约束）关联引用，请先解除关联。";
                }
            } else if (rootMsg.contains("Duplicate entry")) {
                message = "操作失败：数据已重复（违反唯一性约束）。";
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Result.error(400, message));
    }

    @ExceptionHandler(java.sql.SQLIntegrityConstraintViolationException.class)
    public ResponseEntity<Result<Void>> handleSQLIntegrityConstraintViolationException(java.sql.SQLIntegrityConstraintViolationException e) {
        String message = "操作失败，违反数据库完整性约束";
        String rootMsg = e.getMessage();
        if (rootMsg != null) {
            if (rootMsg.contains("Cannot delete or update a parent row") && rootMsg.contains("foreign key constraint fails")) {
                if (rootMsg.contains("`poem`") && rootMsg.contains("`poet_id`")) {
                    message = "删除失败：该诗人名下还有关联的诗词，请先删除或解绑关联的诗词后重试。";
                } else if (rootMsg.contains("`poem_event`") && rootMsg.contains("`poem_id`")) {
                    message = "删除失败：该诗词已被关联至历史事件中，请先从对应事件中移除关联后重试。";
                } else if (rootMsg.contains("`poem_event`") && rootMsg.contains("`event_id`")) {
                    message = "删除失败：该事件已被关联至诗词中，请先从对应诗词中移除此事件后重试。";
                } else if (rootMsg.contains("`poem`") && rootMsg.contains("`spot_id`")) {
                    message = "删除失败：该景点名下还有关联的诗词，请先删除或解绑关联的诗词后重试。";
                } else {
                    message = "无法删除：该记录已被其他数据（外键约束）关联引用，请先解除关联。";
                }
            } else if (rootMsg.contains("Duplicate entry")) {
                message = "操作失败：数据已重复（违反唯一性约束）。";
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Result.error(400, message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Result<Void>> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Result.error(400, e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.error(500, "服务器内部错误: " + e.getMessage()));
    }
}
