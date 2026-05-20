package com.sjg.controller.pub;

import com.sjg.entity.*;
import com.sjg.mapper.*;
import com.sjg.service.PoemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/public/poems")
public class PublicPoemController {

    private final PoemService poemService;
    private final PoetMapper poetMapper;
    private final DynastyMapper dynastyMapper;
    private final ScenicSpotMapper spotMapper;

    public PublicPoemController(PoemService poemService, PoetMapper poetMapper,
                                 DynastyMapper dynastyMapper, ScenicSpotMapper spotMapper) {
        this.poemService = poemService;
        this.poetMapper = poetMapper;
        this.dynastyMapper = dynastyMapper;
        this.spotMapper = spotMapper;
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poemService.list(page, size, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Poem poem = poemService.getById(id);
        if (poem == null) return ResponseEntity.notFound().build();

        Map<String, Object> result = new HashMap<>();
        result.put("poem", poem);
        result.put("poet", poetMapper.selectById(poem.getPoetId()));
        result.put("dynasty", dynastyMapper.selectById(poem.getDynastyId()));
        if (poem.getSpotId() != null) {
            result.put("spot", spotMapper.selectById(poem.getSpotId()));
        }
        return ResponseEntity.ok(result);
    }
}
