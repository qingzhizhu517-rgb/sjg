package com.sjg.controller.pub;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.Result;
import com.sjg.entity.Dynasty;
import com.sjg.mapper.DynastyMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 朝代公开接口（无需认证）
 */
@Tag(name = "公开朝代", description = "面向前端展示的朝代查询接口（无需认证）")
@RestController
@RequestMapping("/api/public/dynasties")
public class PublicDynastyController {

    private final DynastyMapper dynastyMapper;

    public PublicDynastyController(DynastyMapper dynastyMapper) {
        this.dynastyMapper = dynastyMapper;
    }

    @Operation(summary = "获取所有朝代", description = "返回按起始年份排序的朝代列表")
    @GetMapping
    public ResponseEntity<Result<List<Dynasty>>> list() {
        List<Dynasty> dynasties = dynastyMapper.selectList(
            new LambdaQueryWrapper<Dynasty>().orderByAsc(Dynasty::getStartYear));
        return ResponseEntity.ok(Result.success(dynasties));
    }
}
