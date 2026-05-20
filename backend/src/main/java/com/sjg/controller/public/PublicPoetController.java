package com.sjg.controller.public;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.Dynasty;
import com.sjg.entity.Poet;
import com.sjg.entity.Poem;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.service.PoetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poetService.list(page, size, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
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
