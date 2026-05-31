package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.ScenicSpotMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class SpotService {

    private final ScenicSpotMapper spotMapper;

    public SpotService(ScenicSpotMapper spotMapper) {
        this.spotMapper = spotMapper;
    }

    public PageResult<ScenicSpot> list(int page, int size, String keyword, String region) {
        LambdaQueryWrapper<ScenicSpot> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(ScenicSpot::getName, keyword)
                   .or().like(ScenicSpot::getAddress, keyword));
        }
        if (StringUtils.hasText(region)) {
            wrapper.eq(ScenicSpot::getRegion, region);
        }
        wrapper.orderByDesc(ScenicSpot::getId);
        Page<ScenicSpot> result = spotMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public ScenicSpot getById(Long id) { return spotMapper.selectById(id); }
    public void create(ScenicSpot spot) { spotMapper.insert(spot); }
    public void update(Long id, ScenicSpot spot) { spot.setId(id); spotMapper.updateById(spot); }
    public void delete(Long id) { spotMapper.deleteById(id); }

    @Transactional
    public int importFromExcel(MultipartFile file) throws IOException {
        List<ScenicSpot> spots = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String name = formatter.formatCellValue(row.getCell(0)).trim();
                if (!StringUtils.hasText(name)) continue;
                ScenicSpot spot = new ScenicSpot();
                spot.setName(name);
                spot.setRegion(formatter.formatCellValue(row.getCell(1)).trim());
                spot.setAddress(formatter.formatCellValue(row.getCell(2)).trim());
                spot.setLongitude(getCellBigDecimal(row.getCell(3)));
                spot.setLatitude(getCellBigDecimal(row.getCell(4)));
                spot.setDescription(formatter.formatCellValue(row.getCell(5)).trim());
                spots.add(spot);
            }
        }
        for (ScenicSpot spot : spots) { spotMapper.insert(spot); }
        return spots.size();
    }

    private BigDecimal getCellBigDecimal(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(cell.getNumericCellValue());
            String val = new DataFormatter().formatCellValue(cell).trim();
            return StringUtils.hasText(val) ? new BigDecimal(val) : null;
        } catch (Exception e) { return null; }
    }
}
