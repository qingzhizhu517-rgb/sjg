package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.FestivalDetail;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.FestivalDetailMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CulturalItemService {

    public static final String STATUS_DRAFT = "draft";
    public static final String STATUS_PUBLISHED = "published";

    private final CulturalItemMapper itemMapper;
    private final FestivalDetailMapper festivalDetailMapper;

    public CulturalItemService(CulturalItemMapper itemMapper, FestivalDetailMapper festivalDetailMapper) {
        this.itemMapper = itemMapper;
        this.festivalDetailMapper = festivalDetailMapper;
    }

    /**
     * 分页查询。publishedOnly=true 时强制只查已发布（公开端用）。
     */
    public PageResult<CulturalItem> list(int page, int size, String category, String region,
                                         String keyword, String status, boolean publishedOnly) {
        LambdaQueryWrapper<CulturalItem> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(category)) {
            wrapper.eq(CulturalItem::getCategory, category);
        }
        if (StringUtils.hasText(region)) {
            wrapper.eq(CulturalItem::getRegion, region);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(CulturalItem::getTitle, keyword)
                   .or().like(CulturalItem::getSummary, keyword));
        }
        if (publishedOnly) {
            wrapper.eq(CulturalItem::getStatus, STATUS_PUBLISHED);
        } else if (StringUtils.hasText(status)) {
            wrapper.eq(CulturalItem::getStatus, status);
        }
        wrapper.orderByDesc(CulturalItem::getSortOrder).orderByDesc(CulturalItem::getId);
        Page<CulturalItem> result = itemMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public CulturalItem getById(Long id) {
        return itemMapper.selectById(id);
    }

    /**
     * 详情合并视图：公共字段 + 按 category JOIN 的扩展字段。
     */
    public Map<String, Object> getDetailView(Long id) {
        CulturalItem item = itemMapper.selectById(id);
        if (item == null) return null;
        Map<String, Object> view = new HashMap<>();
        view.put("item", item);
        if ("festival".equals(item.getCategory())) {
            view.put("detail", festivalDetailMapper.selectById(id));
        }
        return view;
    }

    @Transactional
    public void create(CulturalItem item, FestivalDetail festivalDetail) {
        itemMapper.insert(item);
        saveFestivalDetail(item, festivalDetail);
    }

    @Transactional
    public void update(Long id, CulturalItem item, FestivalDetail festivalDetail) {
        item.setId(id);
        itemMapper.updateById(item);
        if (festivalDetail != null) {
            festivalDetailMapper.deleteById(id);
        }
        saveFestivalDetail(item, festivalDetail);
    }

    @Transactional
    public void delete(Long id) {
        festivalDetailMapper.deleteById(id);
        itemMapper.deleteById(id);
    }

    public void updateStatus(Long id, String status) {
        CulturalItem item = new CulturalItem();
        item.setId(id);
        item.setStatus(status);
        itemMapper.updateById(item);
    }

    /**
     * 各类别已发布条目数（首页聚合入口用）。
     */
    public List<Map<String, Object>> categoryStats() {
        String[] categories = {"festival", "craft", "literature", "food_opera"};
        List<Map<String, Object>> stats = new ArrayList<>();
        for (String category : categories) {
            Long count = itemMapper.selectCount(new LambdaQueryWrapper<CulturalItem>()
                    .eq(CulturalItem::getCategory, category)
                    .eq(CulturalItem::getStatus, STATUS_PUBLISHED));
            stats.add(Map.of("category", category, "count", count));
        }
        return stats;
    }

    private void saveFestivalDetail(CulturalItem item, FestivalDetail festivalDetail) {
        if (festivalDetail == null || !"festival".equals(item.getCategory())) return;
        festivalDetail.setItemId(item.getId());
        festivalDetailMapper.insert(festivalDetail);
    }
}
