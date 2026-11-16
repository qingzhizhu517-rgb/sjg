package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.DashboardSummary;
import com.sjg.entity.Dynasty;
import com.sjg.entity.Event;
import com.sjg.entity.Poem;
import com.sjg.entity.Poet;
import com.sjg.entity.ScenicSpot;
import com.sjg.entity.User;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.ScenicSpotMapper;
import com.sjg.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;

@Service
public class DashboardService {

    private static final List<String> REGIONS = List.of("菏泽", "济宁", "泰安", "聊城", "济南", "德州", "滨州", "淄博", "东营");
    private static final int SAMPLE_LIMIT = 5;

    private final PoetMapper poetMapper;
    private final ScenicSpotMapper scenicSpotMapper;
    private final PoemMapper poemMapper;
    private final EventMapper eventMapper;
    private final UserMapper userMapper;
    private final DynastyMapper dynastyMapper;

    public DashboardService(PoetMapper poetMapper, ScenicSpotMapper scenicSpotMapper,
                            PoemMapper poemMapper, EventMapper eventMapper,
                            UserMapper userMapper, DynastyMapper dynastyMapper) {
        this.poetMapper = poetMapper;
        this.scenicSpotMapper = scenicSpotMapper;
        this.poemMapper = poemMapper;
        this.eventMapper = eventMapper;
        this.userMapper = userMapper;
        this.dynastyMapper = dynastyMapper;
    }

    public DashboardSummary getSummary() {
        List<Poet> poets = poetMapper.selectList(new LambdaQueryWrapper<>());
        List<ScenicSpot> spots = scenicSpotMapper.selectList(new LambdaQueryWrapper<>());
        List<Poem> poems = poemMapper.selectList(new LambdaQueryWrapper<>());
        List<Event> events = eventMapper.selectList(new LambdaQueryWrapper<>());
        List<User> users = userMapper.selectList(new LambdaQueryWrapper<>());
        List<Dynasty> dynasties = dynastyMapper.selectList(new LambdaQueryWrapper<>());

        DashboardSummary summary = new DashboardSummary();
        summary.setTotals(new DashboardSummary.Totals(
                poets.size(),
                spots.size(),
                poems.size(),
                events.size(),
                users.size()
        ));
        summary.setPending(new DashboardSummary.Pending(
                users.stream().filter(user -> "pending".equals(user.getStatus())).count()
        ));
        summary.setQuality(List.of(
                spotQuality("spotMissingCoordinates", "景点缺少坐标", "missingCoordinates", spots,
                        spot -> spot.getLongitude() == null || spot.getLatitude() == null),
                spotQuality("spotMissingImages", "景点缺少图片", "missingImages", spots,
                        spot -> isBlankMedia(spot.getImageUrl())),
                poemQuality("poemMissingPoet", "诗词缺少作者关联", "missingPoet", poems,
                        poem -> poem.getPoetId() == null),
                poemQuality("poemMissingSpot", "诗词缺少景点关联", "missingSpot", poems,
                        poem -> poem.getSpotId() == null),
                poemQuality("poemMissingAnnotation", "诗词缺少注解或背景", "missingAnnotation", poems,
                        poem -> !StringUtils.hasText(poem.getAnnotation()) || !StringUtils.hasText(poem.getBackground())),
                poetQuality("poetMissingBiography", "诗人缺少生平简介", "missingBiography", poets,
                        poet -> !StringUtils.hasText(poet.getBiography()))
        ));
        summary.setRegions(buildRegionDistribution(spots));
        summary.setDynasties(buildDynastyDistribution(dynasties, poets, poems, events));
        return summary;
    }

    private DashboardSummary.QualityMetric spotQuality(String key, String label, String filter,
                                                       List<ScenicSpot> spots, Predicate<ScenicSpot> predicate) {
        List<ScenicSpot> matches = spots.stream().filter(predicate).toList();
        return new DashboardSummary.QualityMetric(
                key,
                label,
                matches.size(),
                "/spots",
                filter,
                matches.stream()
                        .limit(SAMPLE_LIMIT)
                        .map(spot -> new DashboardSummary.IssueSample(spot.getId(), spot.getName()))
                        .toList()
        );
    }

    private DashboardSummary.QualityMetric poemQuality(String key, String label, String filter,
                                                       List<Poem> poems, Predicate<Poem> predicate) {
        List<Poem> matches = poems.stream().filter(predicate).toList();
        return new DashboardSummary.QualityMetric(
                key,
                label,
                matches.size(),
                "/poems",
                filter,
                matches.stream()
                        .limit(SAMPLE_LIMIT)
                        .map(poem -> new DashboardSummary.IssueSample(poem.getId(), poem.getTitle()))
                        .toList()
        );
    }

    private DashboardSummary.QualityMetric poetQuality(String key, String label, String filter,
                                                       List<Poet> poets, Predicate<Poet> predicate) {
        List<Poet> matches = poets.stream().filter(predicate).toList();
        return new DashboardSummary.QualityMetric(
                key,
                label,
                matches.size(),
                "/poets",
                filter,
                matches.stream()
                        .limit(SAMPLE_LIMIT)
                        .map(poet -> new DashboardSummary.IssueSample(poet.getId(), poet.getName()))
                        .toList()
        );
    }

    private List<DashboardSummary.RegionDistribution> buildRegionDistribution(List<ScenicSpot> spots) {
        return REGIONS.stream()
                .map(region -> new DashboardSummary.RegionDistribution(
                        region,
                        spots.stream().filter(spot -> region.equals(spot.getRegion())).count()
                ))
                .toList();
    }

    private List<DashboardSummary.DynastyDistribution> buildDynastyDistribution(List<Dynasty> dynasties,
                                                                                List<Poet> poets,
                                                                                List<Poem> poems,
                                                                                List<Event> events) {
        return dynasties.stream()
                .sorted(Comparator.comparing(Dynasty::getStartYear, Comparator.nullsLast(Integer::compareTo)))
                .map(dynasty -> new DashboardSummary.DynastyDistribution(
                        dynasty.getId(),
                        dynasty.getName(),
                        poets.stream().filter(poet -> dynasty.getId().equals(poet.getDynastyId())).count(),
                        poems.stream().filter(poem -> dynasty.getId().equals(poem.getDynastyId())).count(),
                        events.stream().filter(event -> dynasty.getId().equals(event.getDynastyId())).count()
                ))
                .toList();
    }

    private boolean isBlankMedia(String value) {
        return !StringUtils.hasText(value) || "[]".equals(value.trim());
    }
}
