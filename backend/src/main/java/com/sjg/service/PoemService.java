package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poem;
import com.sjg.entity.PoemEvent;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoemEventMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.ScenicSpotMapper;
import com.sjg.entity.Poet;
import com.sjg.entity.ScenicSpot;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PoemService {

    private final PoemMapper poemMapper;
    private final PoemEventMapper poemEventMapper;
    private final PoetMapper poetMapper;
    private final ScenicSpotMapper spotMapper;

    public PoemService(PoemMapper poemMapper, PoemEventMapper poemEventMapper,
                       PoetMapper poetMapper, ScenicSpotMapper spotMapper) {
        this.poemMapper = poemMapper;
        this.poemEventMapper = poemEventMapper;
        this.poetMapper = poetMapper;
        this.spotMapper = spotMapper;
    }

    public PageResult<Poem> list(int page, int size, String keyword) {
        return list(page, size, keyword, null);
    }

    /**
     * 分页查询（可选按区域）。
     * 归属规则: spot_id 指向该城景点; 无 spot 的诗按作者籍贯匹配该城(兜底);
     * 两条链路都无匹配时返回空(该城暂无诗词归属)。
     * 用于「每城文化页」的本城诗词聚合。
     */
    public PageResult<Poem> list(int page, int size, String keyword, String region) {
        LambdaQueryWrapper<Poem> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Poem::getTitle, keyword)
                   .or().like(Poem::getContent, keyword));
        }
        if (StringUtils.hasText(region)) {
            List<Long> spotIds = spotMapper.selectList(
                    new LambdaQueryWrapper<ScenicSpot>()
                            .eq(ScenicSpot::getRegion, region))
                    .stream().map(ScenicSpot::getId).toList();
            List<Long> poetIds = poetMapper.selectList(
                    new LambdaQueryWrapper<Poet>()
                            .like(Poet::getBirthplace, region))
                    .stream().map(Poet::getId).toList();
            wrapper.and(w -> {
                if (!spotIds.isEmpty()) {
                    w.in(Poem::getSpotId, spotIds);
                }
                if (!poetIds.isEmpty()) {
                    if (!spotIds.isEmpty()) w.or();
                    w.nested(n -> n.isNull(Poem::getSpotId).in(Poem::getPoetId, poetIds));
                }
                if (spotIds.isEmpty() && poetIds.isEmpty()) {
                    w.eq(Poem::getId, -1L); // 无任何归属 → 空结果
                }
            });
        }
        wrapper.orderByDesc(Poem::getId);
        Page<Poem> result = poemMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Poem getById(Long id) { return poemMapper.selectById(id); }
    public void create(Poem poem) { poemMapper.insert(poem); }
    public void update(Long id, Poem poem) { poem.setId(id); poemMapper.updateById(poem); }
    @Transactional
    public void delete(Long id) {
        // 1. 先删除诗词-事件关联表中的记录，以避免外键约束错误
        poemEventMapper.delete(new LambdaQueryWrapper<PoemEvent>().eq(PoemEvent::getPoemId, id));
        // 2. 再删除诗词本身
        poemMapper.deleteById(id);
    }

    @Transactional
    public int importFromExcel(MultipartFile file) throws IOException {
        List<Poem> poems = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String title = formatter.formatCellValue(row.getCell(0)).trim();
                if (!StringUtils.hasText(title)) continue;
                Poem poem = new Poem();
                poem.setTitle(title);
                poem.setContent(formatter.formatCellValue(row.getCell(1)).trim());
                poem.setPoetId(getCellLong(row.getCell(2)));
                poem.setDynastyId(getCellLong(row.getCell(3)));
                poem.setSpotId(getCellLong(row.getCell(4)));
                poem.setAnnotation(formatter.formatCellValue(row.getCell(5)).trim());
                poem.setBackground(formatter.formatCellValue(row.getCell(6)).trim());
                poem.setAudioUrl(formatter.formatCellValue(row.getCell(7)).trim());
                poem.setVideoUrl(formatter.formatCellValue(row.getCell(8)).trim());
                poem.setSentimentTags(parseSentimentTags(formatter.formatCellValue(row.getCell(9)).trim()));
                poems.add(poem);
            }
        }
        for (Poem poem : poems) { poemMapper.insert(poem); }
        return poems.size();
    }

    private String parseSentimentTags(String val) {
        if (!StringUtils.hasText(val)) return null;
        val = val.trim();
        if (val.startsWith("[")) return val;
        StringBuilder sb = new StringBuilder("[");
        String[] tags = val.split("[,，、]");
        for (int i = 0; i < tags.length; i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(tags[i].trim()).append("\"");
        }
        sb.append("]");
        return sb.toString();
    }

    private Long getCellLong(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return (long) cell.getNumericCellValue();
            String val = new DataFormatter().formatCellValue(cell).trim();
            return StringUtils.hasText(val) ? Long.parseLong(val) : null;
        } catch (Exception e) { return null; }
    }
}
