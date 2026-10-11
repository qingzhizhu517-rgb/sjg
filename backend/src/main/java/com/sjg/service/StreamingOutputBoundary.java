package com.sjg.service;

import java.util.function.Consumer;
import java.util.regex.Pattern;

/** Independent credential-leak guard; it does not replace semantic content moderation. */
public final class StreamingOutputBoundary {
    private static final Pattern CREDENTIAL = Pattern.compile("(?i)(sk-[a-z0-9_-]{20,}|bearer\\s+[a-z0-9._-]{20,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----)");
    private final Consumer<String> output;
    private final StringBuilder pending = new StringBuilder();
    private int total;
    public StreamingOutputBoundary(Consumer<String> output) { this.output = output; }
    public void accept(String delta) {
        if (delta == null) return;
        total += delta.length();
        if (total > 50000) throw new IllegalStateException("模型输出过长");
        pending.append(delta);
        if (CREDENTIAL.matcher(pending).find()) throw new IllegalStateException("模型输出未通过安全检查");
        if (pending.length() > 128) {
            int end = pending.length() - 128;
            output.accept(pending.substring(0,end)); pending.delete(0,end);
        }
    }
    public void finish() {
        if (CREDENTIAL.matcher(pending).find()) throw new IllegalStateException("模型输出未通过安全检查");
        if (!pending.isEmpty()) output.accept(pending.toString());
        pending.setLength(0);
    }
}
