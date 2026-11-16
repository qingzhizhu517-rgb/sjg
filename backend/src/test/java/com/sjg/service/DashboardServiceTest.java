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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private PoetMapper poetMapper;
    @Mock private ScenicSpotMapper scenicSpotMapper;
    @Mock private PoemMapper poemMapper;
    @Mock private EventMapper eventMapper;
    @Mock private UserMapper userMapper;
    @Mock private DynastyMapper dynastyMapper;

    @Test
    void summaryCountsTotalsPendingUsersQualityAndDistributions() {
        Poet poetWithBiography = new Poet();
        poetWithBiography.setId(1L);
        poetWithBiography.setName("李白");
        poetWithBiography.setDynastyId(4L);
        poetWithBiography.setBiography("唐代诗人");

        Poet poetMissingBiography = new Poet();
        poetMissingBiography.setId(2L);
        poetMissingBiography.setName("待补诗人");
        poetMissingBiography.setDynastyId(5L);
        poetMissingBiography.setBiography("");

        ScenicSpot spotGood = new ScenicSpot();
        spotGood.setId(1L);
        spotGood.setName("泰山");
        spotGood.setRegion("泰安");
        spotGood.setLongitude(new BigDecimal("117.0800000"));
        spotGood.setLatitude(new BigDecimal("36.2000000"));
        spotGood.setImageUrl("[\"https://example.com/taishan.jpg\"]");

        ScenicSpot spotMissingData = new ScenicSpot();
        spotMissingData.setId(2L);
        spotMissingData.setName("待补景点");
        spotMissingData.setRegion("济南");
        spotMissingData.setImageUrl("[]");

        Poem completePoem = new Poem();
        completePoem.setId(1L);
        completePoem.setTitle("望岳");
        completePoem.setPoetId(1L);
        completePoem.setDynastyId(4L);
        completePoem.setSpotId(1L);
        completePoem.setAnnotation("注解");
        completePoem.setBackground("背景");

        Poem poemMissingLinks = new Poem();
        poemMissingLinks.setId(2L);
        poemMissingLinks.setTitle("待补诗词");

        Event event = new Event();
        event.setId(1L);
        event.setTitle("安史之乱");
        event.setDynastyId(4L);

        User pendingUser = new User();
        pendingUser.setId(1L);
        pendingUser.setUsername("pending");
        pendingUser.setStatus("pending");

        User approvedUser = new User();
        approvedUser.setId(2L);
        approvedUser.setUsername("approved");
        approvedUser.setStatus("approved");

        Dynasty tang = new Dynasty();
        tang.setId(4L);
        tang.setName("隋唐");
        tang.setStartYear(581);

        Dynasty song = new Dynasty();
        song.setId(5L);
        song.setName("宋");
        song.setStartYear(960);

        when(poetMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(poetWithBiography, poetMissingBiography));
        when(scenicSpotMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(spotGood, spotMissingData));
        when(poemMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(completePoem, poemMissingLinks));
        when(eventMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(event));
        when(userMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(pendingUser, approvedUser));
        when(dynastyMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(tang, song));

        DashboardSummary summary = new DashboardService(
                poetMapper, scenicSpotMapper, poemMapper, eventMapper, userMapper, dynastyMapper
        ).getSummary();

        assertThat(summary.getTotals().getPoets()).isEqualTo(2);
        assertThat(summary.getTotals().getSpots()).isEqualTo(2);
        assertThat(summary.getTotals().getPoems()).isEqualTo(2);
        assertThat(summary.getTotals().getEvents()).isEqualTo(1);
        assertThat(summary.getTotals().getUsers()).isEqualTo(2);
        assertThat(summary.getPending().getUsers()).isEqualTo(1);

        assertThat(summary.getQuality()).extracting(DashboardSummary.QualityMetric::getKey)
                .contains(
                        "spotMissingCoordinates",
                        "spotMissingImages",
                        "poemMissingPoet",
                        "poemMissingSpot",
                        "poemMissingAnnotation",
                        "poetMissingBiography"
                );
        assertThat(summary.getQuality().stream()
                .filter(item -> item.getKey().equals("spotMissingCoordinates"))
                .findFirst().orElseThrow().getCount()).isEqualTo(1);

        assertThat(summary.getRegions()).anySatisfy(region -> {
            assertThat(region.getName()).isEqualTo("泰安");
            assertThat(region.getSpotCount()).isEqualTo(1);
        });

        assertThat(summary.getDynasties()).anySatisfy(dynasty -> {
            assertThat(dynasty.getDynastyId()).isEqualTo(4L);
            assertThat(dynasty.getPoetCount()).isEqualTo(1);
            assertThat(dynasty.getPoemCount()).isEqualTo(1);
            assertThat(dynasty.getEventCount()).isEqualTo(1);
        });
    }
}
