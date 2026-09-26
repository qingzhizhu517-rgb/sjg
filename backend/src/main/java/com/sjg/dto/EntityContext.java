package com.sjg.dto;

import java.util.Map;

public record EntityContext(String type, Long entityId, String region, Long dynastyId) {

    public static EntityContext empty() {
        return new EntityContext("", null, null, null);
    }

    public static EntityContext from(Map<String, String> context) {
        if (context == null || context.isEmpty()) return empty();
        String type = value(context, "type");
        Long id = parseId(context.get("entityId"));
        if (id == null && !type.isBlank()) id = parseId(context.get(type + "Id"));
        return new EntityContext(type, id, value(context, "region"), parseId(context.get("dynastyId")));
    }

    private static String value(Map<String, String> context, String key) {
        String value = context.get(key);
        return value == null ? "" : value.trim();
    }

    private static Long parseId(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            long parsed = Long.parseLong(value.trim());
            return parsed > 0 ? parsed : null;
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
