package com.sjg.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ExceptionBoundaryTest {
    @Test
    void unexpectedRuntimeFailureNeverExposesInternalMessage() {
        var result = new GlobalExceptionHandler().handleRuntimeException(new NullPointerException("secret SQL detail"));
        assertEquals(500, result.getStatusCode().value());
        assertEquals("服务器内部错误，请稍后重试", result.getBody().getMessage());
    }
}
