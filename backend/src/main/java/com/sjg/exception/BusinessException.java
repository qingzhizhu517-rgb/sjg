package com.sjg.exception;

/** Explicitly safe, user-facing domain error. Unexpected failures use the 500 boundary. */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) { super(message); }
}
