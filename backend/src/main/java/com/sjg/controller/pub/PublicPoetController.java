package com.sjg.controller.pub;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.Dynasty;
import com.sjg.entity.Poet;
import com.sjg.entity.Poem;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.service.PoetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 诗人公开接口（无需认证）
 * 提供面向前端展示的诗人查询接口
 */
@Tag(name = "公开诗人", description = "面向前端展示的诗人查询接口（无需认证）")
@RestController
@RequestMapping("/api/public/poets")
public class PublicPoetController {

    private final PoetService poetService;
    private final PoemMapper poemMapper;
    private final DynastyMapper dynastyMapper;

    public PublicPoetController(PoetService poetService, PoemMapper poemMapper, DynastyMapper dynastyMapper) {
        this.poetService = poetService;
        this.poemMapper = poemMapper;
        this.dynastyMapper = dynastyMapper;
    }

    /**
     * 分页查询诗人列表
     */
    @Operation(summary = "分页查询诗人列表", description = "支持按诗人名称关键字模糊搜索，公开接口无需认证")
    @GetMapping
    public ResponseEntity<?> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "搜索关键字（按诗人名称模糊匹配）") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poetService.list(page, size, keyword));
    }

    /**
     * 查询诗人详情（含关联诗词和朝代信息）
     */
    @Operation(summary = "查询诗人详情", description = "根据诗人ID查询详情，同时返回该诗人的诗词列表和所属朝代信息")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id) {
        Poet poet = poetService.getById(id);
        if (poet == null) return ResponseEntity.notFound().build();

        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().eq(Poem::getPoetId, id));

        Dynasty dynasty = dynastyMapper.selectById(poet.getDynastyId());

        Map<String, Object> result = new HashMap<>();
        result.put("poet", poet);
        result.put("poems", poems);
        result.put("dynasty", dynasty);
        return ResponseEntity.ok(result);
    }
}
