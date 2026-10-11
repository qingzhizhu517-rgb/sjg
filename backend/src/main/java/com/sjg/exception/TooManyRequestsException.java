package com.sjg.exception;

public class TooManyRequestsException extends BusinessException {
    public TooManyRequestsException() { super("操作过于频繁，请稍后重试"); }
}
