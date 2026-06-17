package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poet;
import com.sjg.entity.Poem;
import com.sjg.mapper.PoetMapper;
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
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
public class PoetService {

    private final PoetMapper poetMapper;
    private final OssService ossService;
    private final PoemMapper poemMapper;

    public PoetService(PoetMapper poetMapper, OssService ossService, PoemMapper poemMapper) {
        this.poetMapper = poetMapper;
        this.ossService = ossService;
        this.poemMapper = poemMapper;
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

    @Transactional
    public void delete(Long id) {
        // 1. 先删除该诗人关联的所有诗词，以避免外键约束错误
        poemMapper.delete(new LambdaQueryWrapper<Poem>().eq(Poem::getPoetId, id));
        // 2. 再删除诗人本身
        poetMapper.deleteById(id);
    }

    /**
     * 上传诗人图片并更新诗人信息
     * @param id 诗人ID
     * @param file 图片文件
     * @param type 图片类型 (avatar 或 avatarAnime)
     * @param mode 更新模式 (replace 或 append)
     * @return 包含新图片URL和更新后诗人实体的Map
     */
    @Transactional
    public Map<String, Object> updateAvatar(Long id, MultipartFile file, String type, String mode) throws IOException {
        Poet poet = poetMapper.selectById(id);
        if (poet == null) {
            throw new IllegalArgumentException("诗人不存在");
        }

        // 确定上传目录
        String directory = "poets";
        boolean isAnime = "avatarAnime".equalsIgnoreCase(type) || "anime".equalsIgnoreCase(type);
        if (isAnime) {
            directory = "poets/anime";
        }

        // 上传到 OSS
        String url = ossService.upload(file, directory);

        // 更新图片的 JSON 数组
        String currentJson = isAnime ? poet.getAvatarAnimeUrl() : poet.getAvatarUrl();
        List<String> urls = new ArrayList<>();

        if ("append".equalsIgnoreCase(mode)) {
            // 解析已有的 JSON 数组
            if (StringUtils.hasText(currentJson)) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    List<String> existing = mapper.readValue(currentJson, new TypeReference<List<String>>() {});
                    if (existing != null) {
                        urls.addAll(existing);
                    }
                } catch (Exception e) {
                    // 如果解析失败，说明可能不是合法的 JSON 数组，尝试当成单字符串处理
                    urls.add(currentJson);
                }
            }
        }

        // 添加新上传的 URL
        urls.add(url);

        // 序列化回 JSON 数组
        ObjectMapper mapper = new ObjectMapper();
        String newJson = mapper.writeValueAsString(urls);

        // 更新数据库
        if (isAnime) {
            poet.setAvatarAnimeUrl(newJson);
        } else {
            poet.setAvatarUrl(newJson);
        }
        poetMapper.updateById(poet);

        // 返回结果，包含新增的 URL，最新的完整 URL 数组，以及更新后的诗人实体
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("urls", urls);
        result.put("poet", poet);
        return result;
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
