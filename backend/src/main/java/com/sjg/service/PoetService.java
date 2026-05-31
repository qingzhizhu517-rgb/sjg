package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poet;
import com.sjg.mapper.PoetMapper;
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
public class PoetService {

    private final PoetMapper poetMapper;

    public PoetService(PoetMapper poetMapper) {
        this.poetMapper = poetMapper;
    }

    public PageResult<Poet> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Poet> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Poet::getName, keyword)
                   .or().like(Poet::getBirthplace, keyword));
        }
        wrapper.orderByDesc(Poet::getId);
        Page<Poet> result = poetMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Poet getById(Long id) {
        return poetMapper.selectById(id);
    }

    public void create(Poet poet) {
        poetMapper.insert(poet);
    }

    public void update(Long id, Poet poet) {
        poet.setId(id);
        poetMapper.updateById(poet);
    }

    public void delete(Long id) {
        poetMapper.deleteById(id);
    }

    @Transactional
    public int importFromExcel(MultipartFile file) throws IOException {
        List<Poet> poets = parseExcel(file);
        for (Poet poet : poets) {
            poetMapper.insert(poet);
        }
        return poets.size();
    }

    private List<Poet> parseExcel(MultipartFile file) throws IOException {
        List<Poet> poets = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String name = getCellStringValue(row.getCell(0));
                if (!StringUtils.hasText(name)) continue;

                Poet poet = new Poet();
                poet.setName(name);
                poet.setDynastyId(getCellLongValue(row.getCell(1)));
                poet.setBirthYear(getCellIntValue(row.getCell(2)));
                poet.setDeathYear(getCellIntValue(row.getCell(3)));
                poet.setBirthplace(getCellStringValue(row.getCell(4)));
                poet.setBiography(getCellStringValue(row.getCell(5)));
                poet.setStyle(getCellStringValue(row.getCell(6)));
                poets.add(poet);
            }
        }
        return poets;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }

    private Long getCellLongValue(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (long) cell.getNumericCellValue();
            }
            DataFormatter formatter = new DataFormatter();
            String val = formatter.formatCellValue(cell).trim();
            return val.isEmpty() ? null : Long.parseLong(val);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getCellIntValue(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            }
            DataFormatter formatter = new DataFormatter();
            String val = formatter.formatCellValue(cell).trim();
            return val.isEmpty() ? null : Integer.parseInt(val);
        } catch (Exception e) {
            return null;
        }
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

    private Long getLongCellValue(Cell cell) {
        if (cell == null) return null;
        try {
            return (long) cell.getNumericCellValue();
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getIntCellValue(Cell cell) {
        if (cell == null) return null;
        try {
            return (int) cell.getNumericCellValue();
        } catch (Exception e) {
            return null;
        }
    }
}
