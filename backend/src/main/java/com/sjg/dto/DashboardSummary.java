package com.sjg.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private Totals totals;
    private Pending pending;
    private List<QualityMetric> quality = new ArrayList<>();
    private List<RegionDistribution> regions = new ArrayList<>();
    private List<DynastyDistribution> dynasties = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Totals {
        private long poets;
        private long spots;
        private long poems;
        private long events;
        private long users;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pending {
        private long users;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QualityMetric {
        private String key;
        private String label;
        private long count;
        private String route;
        private String filter;
        private List<IssueSample> samples = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IssueSample {
        private Long id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionDistribution {
        private String name;
        private long spotCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DynastyDistribution {
        private Long dynastyId;
        private String name;
        private long poetCount;
        private long poemCount;
        private long eventCount;
    }
}
