package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Event;
import com.sjg.entity.PoemEvent;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.PoemEventMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class EventService {

    private final EventMapper eventMapper;
    private final PoemEventMapper poemEventMapper;
    private final ContentGovernanceCleanupService governanceCleanup;

    public EventService(EventMapper eventMapper, PoemEventMapper poemEventMapper) {
        this(eventMapper, poemEventMapper, null);
    }

    @Autowired
    public EventService(EventMapper eventMapper, PoemEventMapper poemEventMapper,
                        ContentGovernanceCleanupService governanceCleanup) {
        this.eventMapper = eventMapper;
        this.poemEventMapper = poemEventMapper;
        this.governanceCleanup = governanceCleanup;
    }

    public PageResult<Event> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Event> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Event::getTitle, keyword)
                   .or().like(Event::getDescription, keyword));
        }
        wrapper.orderByDesc(Event::getId);
        Page<Event> result = eventMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Event getById(Long id) { return eventMapper.selectById(id); }
    public void create(Event event) {
        eventMapper.insert(event);
        if (governanceCleanup != null) governanceCleanup.ensureNeedsReview("event", event.getId());
    }
    public void update(Long id, Event event) {
        if (id == null || id <= 0 || eventMapper.selectById(id) == null) {
            throw new IllegalArgumentException("事件不存在");
        }
        if (event == null) throw new IllegalArgumentException("事件不能为空");
        event.setId(id);
        eventMapper.updateById(event);
        if (governanceCleanup != null) governanceCleanup.resetReviewForEdit("event", id);
    }
    @Transactional
    public void delete(Long id) {
        // 1. 先删除诗词-事件关联表中的记录，以避免外键约束错误
        poemEventMapper.delete(new LambdaQueryWrapper<PoemEvent>().eq(PoemEvent::getEventId, id));
        if (governanceCleanup != null) governanceCleanup.deleteEntityReferences("event", id);
        // 3. 再删除事件本身
        eventMapper.deleteById(id);
    }

    @Transactional
    public int importFromExcel(MultipartFile file) throws IOException {
        List<Event> events = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String title = formatter.formatCellValue(row.getCell(0)).trim();
                if (!StringUtils.hasText(title)) continue;
                Event event = new Event();
                event.setTitle(title);
                event.setDynastyId(getCellLong(row.getCell(1)));
                event.setYear(getCellInt(row.getCell(2)));
                event.setDescription(formatter.formatCellValue(row.getCell(3)).trim());
                event.setSignificance(formatter.formatCellValue(row.getCell(4)).trim());
                events.add(event);
            }
        }
        for (Event event : events) {
            eventMapper.insert(event);
            if (governanceCleanup != null) governanceCleanup.ensureNeedsReview("event", event.getId());
        }
        return events.size();
    }

    private Long getCellLong(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return (long) cell.getNumericCellValue();
            String val = new DataFormatter().formatCellValue(cell).trim();
            return StringUtils.hasText(val) ? Long.parseLong(val) : null;
        } catch (Exception e) { return null; }
    }

    private Integer getCellInt(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
            String val = new DataFormatter().formatCellValue(cell).trim();
            return StringUtils.hasText(val) ? Integer.parseInt(val) : null;
        } catch (Exception e) { return null; }
    }
}
