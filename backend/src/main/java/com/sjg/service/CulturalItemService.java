package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.CulturalItemRequest;
import com.sjg.dto.PageResult;
import com.sjg.entity.CraftDetail;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.FestivalDetail;
import com.sjg.entity.FoodOperaDetail;
import com.sjg.entity.LiteratureDetail;
import com.sjg.mapper.CraftDetailMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.FestivalDetailMapper;
import com.sjg.mapper.FoodOperaDetailMapper;
import com.sjg.mapper.LiteratureDetailMapper;
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
    private final CraftDetailMapper craftDetailMapper;
    private final LiteratureDetailMapper literatureDetailMapper;
    private final FoodOperaDetailMapper foodOperaDetailMapper;

    public CulturalItemService(CulturalItemMapper itemMapper,
                               FestivalDetailMapper festivalDetailMapper,
                               CraftDetailMapper craftDetailMapper,
                               LiteratureDetailMapper literatureDetailMapper,
                               FoodOperaDetailMapper foodOperaDetailMapper) {
        this.itemMapper = itemMapper;
        this.festivalDetailMapper = festivalDetailMapper;
        this.craftDetailMapper = craftDetailMapper;
        this.literatureDetailMapper = literatureDetailMapper;
        this.foodOperaDetailMapper = foodOperaDetailMapper;
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
        } else if ("craft".equals(item.getCategory())) {
            view.put("detail", craftDetailMapper.selectById(id));
        } else if ("literature".equals(item.getCategory())) {
            view.put("detail", literatureDetailMapper.selectById(id));
        } else if ("food_opera".equals(item.getCategory())) {
            view.put("detail", foodOperaDetailMapper.selectById(id));
        }
        return view;
    }

    @Transactional
    public void create(CulturalItemRequest request) {
        CulturalItem item = request.getItem();
        // 未显式指定状态时默认草稿, 避免误公开发布(与 V12 的 DB 默认值解耦)
        if (!StringUtils.hasText(item.getStatus())) {
            item.setStatus(STATUS_DRAFT);
        }
        itemMapper.insert(item);
        saveDetails(item, request);
    }

    @Transactional
    public void update(Long id, CulturalItemRequest request) {
        CulturalItem item = request.getItem();
        item.setId(id);
        itemMapper.updateById(item);
        // 扩展表一律先删后插, 保证与请求体一致
        festivalDetailMapper.deleteById(id);
        craftDetailMapper.deleteById(id);
        literatureDetailMapper.deleteById(id);
        foodOperaDetailMapper.deleteById(id);
        saveDetails(item, request);
    }

    /** 按 category 落对应扩展表 */
    private void saveDetails(CulturalItem item, CulturalItemRequest request) {
        String category = item.getCategory();
        if ("festival".equals(category) && request.getFestivalDetail() != null) {
            FestivalDetail d = request.getFestivalDetail();
            d.setItemId(item.getId());
            festivalDetailMapper.insert(d);
        } else if ("craft".equals(category) && request.getCraftDetail() != null) {
            CraftDetail d = request.getCraftDetail();
            d.setItemId(item.getId());
            craftDetailMapper.insert(d);
        } else if ("literature".equals(category) && request.getLiteratureDetail() != null) {
            LiteratureDetail d = request.getLiteratureDetail();
            d.setItemId(item.getId());
            literatureDetailMapper.insert(d);
        } else if ("food_opera".equals(category) && request.getFoodOperaDetail() != null) {
            FoodOperaDetail d = request.getFoodOperaDetail();
            d.setItemId(item.getId());
            foodOperaDetailMapper.insert(d);
        }
    }

    @Transactional
    public void delete(Long id) {
        festivalDetailMapper.deleteById(id);
        craftDetailMapper.deleteById(id);
        literatureDetailMapper.deleteById(id);
        foodOperaDetailMapper.deleteById(id);
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
}
