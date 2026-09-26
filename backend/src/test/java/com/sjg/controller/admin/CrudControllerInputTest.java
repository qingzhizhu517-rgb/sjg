package com.sjg.controller.admin;

import com.sjg.dto.Result;
import com.sjg.entity.Event;
import com.sjg.entity.Poem;
import com.sjg.entity.Poet;
import com.sjg.entity.ScenicSpot;
import com.sjg.service.EventService;
import com.sjg.service.PoemService;
import com.sjg.service.PoetService;
import com.sjg.service.SpotService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class CrudControllerInputTest {

    @Test
    void poemCreateRejectsEmptyRequestBody() {
        PoemService service = mock(PoemService.class);
        PoemController controller = new PoemController(service);

        ResponseEntity<Result<Map<String, String>>> response = controller.create(null);

        assertBadRequest(response, "诗词不能为空");
        verifyNoInteractions(service);
    }

    @Test
    void poetUpdateRejectsEmptyRequestBody() {
        PoetService service = mock(PoetService.class);
        PoetController controller = new PoetController(service);

        ResponseEntity<Result<Map<String, String>>> response = controller.update(7L, null);

        assertBadRequest(response, "诗人不能为空");
        verifyNoInteractions(service);
    }

    @Test
    void spotCreateRejectsEmptyRequestBody() {
        SpotService service = mock(SpotService.class);
        SpotController controller = new SpotController(service);

        ResponseEntity<Result<Map<String, String>>> response = controller.create(null);

        assertBadRequest(response, "景点不能为空");
        verifyNoInteractions(service);
    }

    @Test
    void eventUpdateRejectsEmptyRequestBody() {
        EventService service = mock(EventService.class);
        EventController controller = new EventController(service);

        ResponseEntity<Result<Map<String, String>>> response = controller.update(7L, null);

        assertBadRequest(response, "事件不能为空");
        verifyNoInteractions(service);
    }

    private void assertBadRequest(ResponseEntity<Result<Map<String, String>>> response, String message) {
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getCode());
        assertEquals(message, response.getBody().getMessage());
    }
}
