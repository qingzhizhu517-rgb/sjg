package com.sjg.dto;

import lombok.Data;

@Data
public class SourceSummary {
    private Long sourceId;
    private String title;
    private String authorOrg;
    private Integer publicationYear;
    private String url;
    private String citation;
    private String locator;
    private String quote;
    private String note;
    private String reviewStatus;
}
