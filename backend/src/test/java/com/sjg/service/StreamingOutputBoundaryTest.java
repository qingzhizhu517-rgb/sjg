package com.sjg.service;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.*;

class StreamingOutputBoundaryTest {
    @Test void splitCredentialIsRejectedBeforeAnyPartIsReleased() {
        var output = new ArrayList<String>();
        var guard = new StreamingOutputBoundary(output::add);
        guard.accept("这是凭据：sk-");
        assertThrows(IllegalStateException.class, () -> guard.accept("1234567890abcdefghij1234567890"));
        assertTrue(output.isEmpty());
    }
    @Test void harmlessPoetryIsPreservedExactly() {
        var output = new ArrayList<String>(); var guard = new StreamingOutputBoundary(output::add);
        guard.accept("黄河之水"); guard.accept("天上来。"); guard.finish();
        assertEquals("黄河之水天上来。", String.join("",output));
    }
}
