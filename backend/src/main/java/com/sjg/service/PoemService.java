package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poem;
import com.sjg.mapper.PoemMapper;
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

    public PoemService(PoemMapper poemMapper) {
        this.poemMapper = poemMapper;
    }

    public PageResult<Poem> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Poem> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Poem::getTitle, keyword)
                   .or().like(Poem::getContent, keyword));
        }
        wrapper.orderByDesc(Poem::getId);
        Page<Poem> result = poemMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Poem getById(Long id) { return poemMapper.selectById(id); }
    public void create(Poem poem) { poemMapper.insert(poem); }
    public void update(Long id, Poem poem) { poem.setId(id); poemMapper.updateById(poem); }
    public void delete(Long id) { poemMapper.deleteById(id); }

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
