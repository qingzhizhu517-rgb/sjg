package com.sjg.controller.admin;

import com.sjg.dto.Result;
import com.sjg.entity.CulturalItem;
import com.sjg.service.CulturalItemService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CulturalControllerTest {

    @Test
    void legacyPublishReturnsConflictWhenGovernanceReviewIsNotPublished() {
        CulturalItemService service = mock(CulturalItemService.class);
        CulturalItem item = new CulturalItem();
        item.setId(7L);
        when(service.getById(7L)).thenReturn(item);
        doThrow(new IllegalStateException("请先在内容治理工作台完成发布审核"))
                .when(service).updateStatus(7L, CulturalItemService.STATUS_PUBLISHED);

        CulturalController controller = new CulturalController(service);
        ResponseEntity<Result<Map<String, String>>> response = controller.updateStatus(
                7L, Map.of("status", CulturalItemService.STATUS_PUBLISHED));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getCode());
        assertEquals("请先在内容治理工作台完成发布审核", response.getBody().getMessage());
    }

    @Test
    void legacyStatusRejectsEmptyRequestBody() {
        CulturalItemService service = mock(CulturalItemService.class);
        CulturalController controller = new CulturalController(service);

        ResponseEntity<Result<Map<String, String>>> response = controller.updateStatus(7L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getCode());
        assertEquals("status 仅支持 draft/published", response.getBody().getMessage());
    }

    @Test
    void createRejectsEmptyRequestBody() {
        CulturalController controller = new CulturalController(mock(CulturalItemService.class));

        ResponseEntity<Result<Map<String, String>>> response = controller.create(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getCode());
        assertEquals("item 不能为空", response.getBody().getMessage());
    }

    @Test
    void updateRejectsEmptyRequestBody() {
        CulturalController controller = new CulturalController(mock(CulturalItemService.class));

        ResponseEntity<Result<Map<String, String>>> response = controller.update(7L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getCode());
        assertEquals("item 不能为空", response.getBody().getMessage());
    }
}
