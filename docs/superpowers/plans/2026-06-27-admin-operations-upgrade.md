# Admin Operations Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-first operations upgrade with a dashboard, data-quality summaries, stronger filters, form validation, and structured import feedback.

**Architecture:** Backend changes are additive and centered on a read-only dashboard endpoint plus compatible import/filter enhancements. Admin frontend changes keep the current Vue 3 + Element Plus structure, adding a dashboard route and extending shared table/dialog components so existing resource pages benefit without a broad rewrite.

**Tech Stack:** Spring Boot 3.2.5, Java 17, MyBatis-Plus, JUnit 5/Mockito, Vue 3 Composition API, Vite, Element Plus, built-in Node test runner for pure frontend utilities.

---

## File Structure

### Backend Files

- Create `backend/src/main/java/com/sjg/dto/DashboardSummary.java` for the dashboard response shape.
- Create `backend/src/main/java/com/sjg/dto/ImportResult.java` for structured import feedback.
- Create `backend/src/main/java/com/sjg/service/DashboardService.java` for read-only aggregate and quality calculations.
- Create `backend/src/main/java/com/sjg/controller/admin/DashboardController.java` for `GET /api/admin/dashboard`.
- Modify `backend/src/main/java/com/sjg/service/SpotService.java` to support data-quality filters and structured import results.
- Modify `backend/src/main/java/com/sjg/service/PoemService.java` to support author/dynasty/spot/linkage filters and structured import results.
- Modify `backend/src/main/java/com/sjg/service/PoetService.java` to return structured import results.
- Modify `backend/src/main/java/com/sjg/service/EventService.java` to return structured import results.
- Modify `backend/src/main/java/com/sjg/controller/admin/SpotController.java` for new filter params and import response type.
- Modify `backend/src/main/java/com/sjg/controller/admin/PoemController.java` for new filter params and import response type.
- Modify `backend/src/main/java/com/sjg/controller/admin/PoetController.java` and `backend/src/main/java/com/sjg/controller/admin/EventController.java` for import response type.
- Create backend tests under `backend/src/test/java/com/sjg/`.

### Admin Frontend Files

- Create `admin-frontend/src/views/Dashboard.vue` for the operations dashboard.
- Create `admin-frontend/src/utils/dashboard.js` and `admin-frontend/src/utils/dashboard.test.js` for dashboard formatting helpers.
- Create `admin-frontend/src/utils/formRules.js` and `admin-frontend/src/utils/formRules.test.js` for reusable Element Plus validation rules.
- Create `admin-frontend/src/utils/resourceFilters.js` and `admin-frontend/src/utils/resourceFilters.test.js` for filter param serialization.
- Modify `admin-frontend/src/router/index.js` to add `/dashboard` and redirect `/` to it.
- Modify `admin-frontend/src/views/Layout.vue` to add the dashboard navigation entry.
- Modify `admin-frontend/src/components/DataTable.vue` for advanced filters, empty state, error state, and optional action buttons.
- Modify `admin-frontend/src/components/FormDialog.vue` for validation.
- Modify `admin-frontend/src/components/ImportDialog.vue` for import counts and row warnings.
- Modify `admin-frontend/src/views/SpotList.vue`, `admin-frontend/src/views/PoemList.vue`, `admin-frontend/src/views/PoetList.vue`, `admin-frontend/src/views/EventList.vue`, and `admin-frontend/src/views/UserList.vue` to consume shared enhancements.

---

## Task 1: Backend Dashboard API

**Files:**
- Create: `backend/src/test/java/com/sjg/service/DashboardServiceTest.java`
- Create: `backend/src/main/java/com/sjg/dto/DashboardSummary.java`
- Create: `backend/src/main/java/com/sjg/service/DashboardService.java`
- Create: `backend/src/main/java/com/sjg/controller/admin/DashboardController.java`

- [ ] **Step 1: Write the failing dashboard service test**

Create `backend/src/test/java/com/sjg/service/DashboardServiceTest.java`:

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.DashboardSummary;
import com.sjg.entity.*;
import com.sjg.mapper.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private PoetMapper poetMapper;
    @Mock private ScenicSpotMapper scenicSpotMapper;
    @Mock private PoemMapper poemMapper;
    @Mock private EventMapper eventMapper;
    @Mock private UserMapper userMapper;
    @Mock private DynastyMapper dynastyMapper;

    @Test
    void summaryCountsTotalsPendingUsersQualityAndDistributions() {
        Poet poetWithBiography = new Poet();
        poetWithBiography.setId(1L);
        poetWithBiography.setName("李白");
        poetWithBiography.setDynastyId(4L);
        poetWithBiography.setBiography("唐代诗人");

        Poet poetMissingBiography = new Poet();
        poetMissingBiography.setId(2L);
        poetMissingBiography.setName("待补诗人");
        poetMissingBiography.setDynastyId(5L);
        poetMissingBiography.setBiography("");

        ScenicSpot spotGood = new ScenicSpot();
        spotGood.setId(1L);
        spotGood.setName("泰山");
        spotGood.setRegion("泰安");
        spotGood.setLongitude(new BigDecimal("117.0800000"));
        spotGood.setLatitude(new BigDecimal("36.2000000"));
        spotGood.setImageUrl("[\"https://example.com/taishan.jpg\"]");

        ScenicSpot spotMissingData = new ScenicSpot();
        spotMissingData.setId(2L);
        spotMissingData.setName("待补景点");
        spotMissingData.setRegion("济南");
        spotMissingData.setImageUrl("[]");

        Poem completePoem = new Poem();
        completePoem.setId(1L);
        completePoem.setTitle("望岳");
        completePoem.setPoetId(1L);
        completePoem.setDynastyId(4L);
        completePoem.setSpotId(1L);
        completePoem.setAnnotation("注解");
        completePoem.setBackground("背景");

        Poem poemMissingLinks = new Poem();
        poemMissingLinks.setId(2L);
        poemMissingLinks.setTitle("待补诗词");

        Event event = new Event();
        event.setId(1L);
        event.setTitle("安史之乱");
        event.setDynastyId(4L);

        User pendingUser = new User();
        pendingUser.setId(1L);
        pendingUser.setUsername("pending");
        pendingUser.setStatus("pending");

        User approvedUser = new User();
        approvedUser.setId(2L);
        approvedUser.setUsername("approved");
        approvedUser.setStatus("approved");

        Dynasty tang = new Dynasty();
        tang.setId(4L);
        tang.setName("隋唐");
        tang.setStartYear(581);

        Dynasty song = new Dynasty();
        song.setId(5L);
        song.setName("宋");
        song.setStartYear(960);

        when(poetMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(poetWithBiography, poetMissingBiography));
        when(scenicSpotMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(spotGood, spotMissingData));
        when(poemMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(completePoem, poemMissingLinks));
        when(eventMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(event));
        when(userMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(pendingUser, approvedUser));
        when(dynastyMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(tang, song));

        DashboardSummary summary = new DashboardService(
                poetMapper, scenicSpotMapper, poemMapper, eventMapper, userMapper, dynastyMapper
        ).getSummary();

        assertThat(summary.getTotals().getPoets()).isEqualTo(2);
        assertThat(summary.getTotals().getSpots()).isEqualTo(2);
        assertThat(summary.getTotals().getPoems()).isEqualTo(2);
        assertThat(summary.getTotals().getEvents()).isEqualTo(1);
        assertThat(summary.getTotals().getUsers()).isEqualTo(2);
        assertThat(summary.getPending().getUsers()).isEqualTo(1);

        assertThat(summary.getQuality()).extracting(DashboardSummary.QualityMetric::getKey)
                .contains("spotMissingCoordinates", "spotMissingImages", "poemMissingPoet", "poemMissingSpot", "poemMissingAnnotation", "poetMissingBiography");
        assertThat(summary.getQuality().stream()
                .filter(item -> item.getKey().equals("spotMissingCoordinates"))
                .findFirst().orElseThrow().getCount()).isEqualTo(1);

        assertThat(summary.getRegions()).anySatisfy(region -> {
            assertThat(region.getName()).isEqualTo("泰安");
            assertThat(region.getSpotCount()).isEqualTo(1);
        });

        assertThat(summary.getDynasties()).anySatisfy(dynasty -> {
            assertThat(dynasty.getDynastyId()).isEqualTo(4L);
            assertThat(dynasty.getPoetCount()).isEqualTo(1);
            assertThat(dynasty.getPoemCount()).isEqualTo(1);
            assertThat(dynasty.getEventCount()).isEqualTo(1);
        });
    }
}
```

- [ ] **Step 2: Run the dashboard service test and verify it fails**

Run:

```bash
cd backend
mvn -Dtest=DashboardServiceTest test
```

Expected: FAIL during test compilation because `DashboardSummary` and `DashboardService` do not exist.

- [ ] **Step 3: Implement `DashboardSummary`**

Create `backend/src/main/java/com/sjg/dto/DashboardSummary.java` with nested DTO classes for totals, pending counts, quality metrics, region distribution, dynasty distribution, and short issue samples. Use Lombok `@Data`, `@NoArgsConstructor`, and `@AllArgsConstructor`.

- [ ] **Step 4: Implement `DashboardService`**

Create `backend/src/main/java/com/sjg/service/DashboardService.java`.

Implementation requirements:

- Inject `PoetMapper`, `ScenicSpotMapper`, `PoemMapper`, `EventMapper`, `UserMapper`, and `DynastyMapper`.
- Fetch lists with `selectList(new LambdaQueryWrapper<>())`.
- Count totals from list sizes.
- Count pending users with status `pending`.
- Build nine fixed region entries in this order: 菏泽, 济宁, 泰安, 聊城, 济南, 德州, 滨州, 淄博, 东营.
- Build dynasty rows from actual dynasty records sorted by `startYear`.
- Build quality metrics with these keys and routes:
  - `spotMissingCoordinates`, label `景点缺少坐标`, route `/spots`, filter `missingCoordinates`
  - `spotMissingImages`, label `景点缺少图片`, route `/spots`, filter `missingImages`
  - `poemMissingPoet`, label `诗词缺少作者关联`, route `/poems`, filter `missingPoet`
  - `poemMissingSpot`, label `诗词缺少景点关联`, route `/poems`, filter `missingSpot`
  - `poemMissingAnnotation`, label `诗词缺少注解或背景`, route `/poems`, filter `missingAnnotation`
  - `poetMissingBiography`, label `诗人缺少生平简介`, route `/poets`, filter `missingBiography`
- Include up to five samples per metric.
- Treat `null`, blank string, and `"[]"` as empty media.

- [ ] **Step 5: Implement `DashboardController`**

Create `backend/src/main/java/com/sjg/controller/admin/DashboardController.java`:

```java
package com.sjg.controller.admin;

import com.sjg.dto.DashboardSummary;
import com.sjg.dto.Result;
import com.sjg.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "管理端总览", description = "管理端运营总览与数据质量接口")
@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "获取管理端总览", description = "返回内容总量、待办、数据质量、地区分布和朝代分布")
    @GetMapping
    public ResponseEntity<Result<DashboardSummary>> summary() {
        return ResponseEntity.ok(Result.success(dashboardService.getSummary()));
    }
}
```

- [ ] **Step 6: Run the dashboard service test and verify it passes**

Run:

```bash
cd backend
mvn -Dtest=DashboardServiceTest test
```

Expected: PASS with 1 test.

---

## Task 2: Backend Import Result Feedback

**Files:**
- Create: `backend/src/test/java/com/sjg/dto/ImportResultTest.java`
- Create: `backend/src/main/java/com/sjg/dto/ImportResult.java`
- Modify: `backend/src/main/java/com/sjg/service/PoetService.java`
- Modify: `backend/src/main/java/com/sjg/service/SpotService.java`
- Modify: `backend/src/main/java/com/sjg/service/PoemService.java`
- Modify: `backend/src/main/java/com/sjg/service/EventService.java`
- Modify: `backend/src/main/java/com/sjg/controller/admin/PoetController.java`
- Modify: `backend/src/main/java/com/sjg/controller/admin/SpotController.java`
- Modify: `backend/src/main/java/com/sjg/controller/admin/PoemController.java`
- Modify: `backend/src/main/java/com/sjg/controller/admin/EventController.java`

- [ ] **Step 1: Write the failing import result test**

Create `backend/src/test/java/com/sjg/dto/ImportResultTest.java`:

```java
package com.sjg.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ImportResultTest {

    @Test
    void recordsImportedRowsSkippedRowsAndWarnings() {
        ImportResult result = ImportResult.empty();

        result.imported();
        result.skipped(3, "名称为空");

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getImportedCount()).isEqualTo(1);
        assertThat(result.getSkippedCount()).isEqualTo(1);
        assertThat(result.getErrors()).contains("第 3 行：名称为空");
        assertThat(result.getMessage()).isEqualTo("成功导入 1 条，跳过 1 条");
    }
}
```

- [ ] **Step 2: Run the import result test and verify it fails**

Run:

```bash
cd backend
mvn -Dtest=ImportResultTest test
```

Expected: FAIL during test compilation because `ImportResult` does not exist.

- [ ] **Step 3: Implement `ImportResult`**

Create `backend/src/main/java/com/sjg/dto/ImportResult.java`.

Implementation requirements:

- Fields: `success`, `message`, `importedCount`, `skippedCount`, `errors`.
- Static factory `empty()` returns success `true`, zero counts, empty errors.
- Method `imported()` increments imported count and refreshes message.
- Method `skipped(int rowNumber, String reason)` increments skipped count, appends `第 {rowNumber} 行：{reason}`, and refreshes message.
- Message format: `成功导入 X 条，跳过 Y 条`.

- [ ] **Step 4: Update import services**

Change `importFromExcel(MultipartFile file)` in all four services to return `ImportResult`.

Behavior requirements:

- Existing successful inserts still occur.
- Blank required name/title rows are skipped and reported with row number.
- Each inserted row calls `result.imported()`.
- Each skipped row calls `result.skipped(rowIndex + 1, "...")`.
- The services still throw `IOException` for unreadable workbooks.

Required skip messages:

- Poet: `姓名为空`
- Spot: `景点名称为空`
- Poem: `诗词标题为空`
- Event: `事件标题为空`

- [ ] **Step 5: Update import controllers**

Change admin import endpoints to return `ResponseEntity<Result<ImportResult>>`.

Controller success path:

```java
ImportResult result = service.importFromExcel(file);
return ResponseEntity.ok(Result.success(result));
```

Controller failure path:

```java
return ResponseEntity.badRequest().body(Result.error(400, "导入失败: " + e.getMessage()));
```

- [ ] **Step 6: Run import result test and compile backend**

Run:

```bash
cd backend
mvn -Dtest=ImportResultTest test
mvn test
```

Expected: `ImportResultTest` passes and the backend test phase completes.

---

## Task 3: Backend List Filters for Spots and Poems

**Files:**
- Create: `backend/src/test/java/com/sjg/service/SpotServiceFilterTest.java`
- Create: `backend/src/test/java/com/sjg/service/PoemServiceFilterTest.java`
- Modify: `backend/src/main/java/com/sjg/service/SpotService.java`
- Modify: `backend/src/main/java/com/sjg/service/PoemService.java`
- Modify: `backend/src/main/java/com/sjg/controller/admin/SpotController.java`
- Modify: `backend/src/main/java/com/sjg/controller/admin/PoemController.java`

- [ ] **Step 1: Write failing spot filter test**

Create `backend/src/test/java/com/sjg/service/SpotServiceFilterTest.java`:

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.ScenicSpotMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SpotServiceFilterTest {

    @Mock private ScenicSpotMapper spotMapper;

    @Test
    void missingCoordinatesFilterAddsCoordinateConditions() {
        when(spotMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenReturn(new Page<ScenicSpot>().setRecords(List.of()));

        new SpotService(spotMapper).list(1, 10, "", "", "missingCoordinates");

        ArgumentCaptor<LambdaQueryWrapper<ScenicSpot>> wrapperCaptor = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(spotMapper).selectPage(any(Page.class), wrapperCaptor.capture());

        String sql = wrapperCaptor.getValue().getCustomSqlSegment();
        assertThat(sql).contains("longitude").contains("latitude");
    }
}
```

- [ ] **Step 2: Write failing poem filter test**

Create `backend/src/test/java/com/sjg/service/PoemServiceFilterTest.java`:

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.entity.Poem;
import com.sjg.mapper.PoemEventMapper;
import com.sjg.mapper.PoemMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PoemServiceFilterTest {

    @Mock private PoemMapper poemMapper;
    @Mock private PoemEventMapper poemEventMapper;

    @Test
    void filtersByPoetDynastySpotAndMissingAnnotation() {
        when(poemMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenReturn(new Page<Poem>().setRecords(List.of()));

        new PoemService(poemMapper, poemEventMapper)
                .list(1, 10, "", 1L, 4L, 2L, "missingAnnotation");

        ArgumentCaptor<LambdaQueryWrapper<Poem>> wrapperCaptor = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(poemMapper).selectPage(any(Page.class), wrapperCaptor.capture());

        String sql = wrapperCaptor.getValue().getCustomSqlSegment();
        assertThat(sql).contains("poet_id").contains("dynasty_id").contains("spot_id");
        assertThat(sql).contains("annotation").contains("background");
    }
}
```

- [ ] **Step 3: Run filter tests and verify they fail**

Run:

```bash
cd backend
mvn -Dtest=SpotServiceFilterTest,PoemServiceFilterTest test
```

Expected: FAIL during compilation because the new service method signatures do not exist.

- [ ] **Step 4: Implement spot quality filter**

Update `SpotService.list` signature to:

```java
public PageResult<ScenicSpot> list(int page, int size, String keyword, String region, String quality)
```

Keep an overload:

```java
public PageResult<ScenicSpot> list(int page, int size, String keyword, String region) {
    return list(page, size, keyword, region, null);
}
```

Filter behavior:

- `missingCoordinates`: longitude is null OR latitude is null.
- `missingImages`: imageUrl is null OR blank OR equals `"[]"`.
- Unknown quality value applies no extra filter.

- [ ] **Step 5: Implement poem filters**

Update `PoemService.list` signature to:

```java
public PageResult<Poem> list(int page, int size, String keyword, Long poetId, Long dynastyId, Long spotId, String quality)
```

Keep an overload:

```java
public PageResult<Poem> list(int page, int size, String keyword) {
    return list(page, size, keyword, null, null, null, null);
}
```

Filter behavior:

- `poetId`: exact match.
- `dynastyId`: exact match.
- `spotId`: exact match.
- `missingPoet`: poetId is null.
- `missingSpot`: spotId is null.
- `missingAnnotation`: annotation is null or blank OR background is null or blank.
- Unknown quality value applies no extra quality filter.

- [ ] **Step 6: Update controllers**

Update `SpotController.list` to accept `quality` and pass it to the new service method.

Update `PoemController.list` to accept `poetId`, `dynastyId`, `spotId`, and `quality`, then pass them to the new service method.

- [ ] **Step 7: Run filter tests**

Run:

```bash
cd backend
mvn -Dtest=SpotServiceFilterTest,PoemServiceFilterTest test
```

Expected: PASS with 2 tests.

---

## Task 4: Admin Frontend Pure Utility Tests

**Files:**
- Create: `admin-frontend/src/utils/dashboard.js`
- Create: `admin-frontend/src/utils/dashboard.test.js`
- Create: `admin-frontend/src/utils/formRules.js`
- Create: `admin-frontend/src/utils/formRules.test.js`
- Create: `admin-frontend/src/utils/resourceFilters.js`
- Create: `admin-frontend/src/utils/resourceFilters.test.js`

- [ ] **Step 1: Write failing dashboard utility test**

Create `admin-frontend/src/utils/dashboard.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildKpis, maxDistributionValue, qualityRoute } from './dashboard.js'

test('buildKpis maps dashboard summary into stable admin KPI cards', () => {
  const cards = buildKpis({
    totals: { poets: 2, spots: 3, poems: 5, events: 7, users: 11 },
    pending: { users: 13 }
  })

  assert.deepEqual(cards.map(card => card.key), ['poets', 'spots', 'poems', 'events', 'users', 'pendingUsers'])
  assert.equal(cards.find(card => card.key === 'pendingUsers').value, 13)
  assert.equal(cards.find(card => card.key === 'spots').label, '景点')
})

test('maxDistributionValue returns at least one to avoid divide by zero', () => {
  assert.equal(maxDistributionValue([]), 1)
  assert.equal(maxDistributionValue([{ spotCount: 0 }, { spotCount: 4 }], 'spotCount'), 4)
})

test('qualityRoute includes filter query when provided', () => {
  assert.equal(qualityRoute({ route: '/spots', filter: 'missingImages' }), '/spots?quality=missingImages')
  assert.equal(qualityRoute({ route: '/poets' }), '/poets')
})
```

- [ ] **Step 2: Write failing form rules test**

Create `admin-frontend/src/utils/formRules.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequiredRule, longitudeValidator, latitudeValidator, minLengthValidator } from './formRules.js'

function runValidator(validator, value) {
  return new Promise(resolve => {
    validator({}, value, error => resolve(error ? error.message : null))
  })
}

test('createRequiredRule returns a required Element Plus rule', () => {
  assert.deepEqual(createRequiredRule('请输入名称'), { required: true, message: '请输入名称', trigger: 'blur' })
})

test('coordinate validators accept empty values and reject out-of-range values', async () => {
  assert.equal(await runValidator(longitudeValidator, ''), null)
  assert.equal(await runValidator(longitudeValidator, 181), '经度需在 -180 到 180 之间')
  assert.equal(await runValidator(latitudeValidator, -91), '纬度需在 -90 到 90 之间')
})

test('minLengthValidator enforces trimmed string length', async () => {
  const validator = minLengthValidator(6, '密码至少 6 位')
  assert.equal(await runValidator(validator, '12345'), '密码至少 6 位')
  assert.equal(await runValidator(validator, '123456'), null)
})
```

- [ ] **Step 3: Write failing resource filter test**

Create `admin-frontend/src/utils/resourceFilters.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanParams, parseQualityFromRoute } from './resourceFilters.js'

test('cleanParams removes empty values but keeps zero and ids', () => {
  assert.deepEqual(cleanParams({
    page: 1,
    size: 10,
    keyword: '',
    region: '泰安',
    poetId: null,
    dynastyId: 0,
    quality: undefined
  }), {
    page: 1,
    size: 10,
    region: '泰安',
    dynastyId: 0
  })
})

test('parseQualityFromRoute reads string quality query', () => {
  assert.equal(parseQualityFromRoute({ query: { quality: 'missingImages' } }), 'missingImages')
  assert.equal(parseQualityFromRoute({ query: { quality: ['a', 'b'] } }), 'a')
  assert.equal(parseQualityFromRoute({ query: {} }), '')
})
```

- [ ] **Step 4: Run frontend utility tests and verify they fail**

Run:

```bash
cd admin-frontend
node --test src/utils/dashboard.test.js src/utils/formRules.test.js src/utils/resourceFilters.test.js
```

Expected: FAIL during module resolution because utility files do not exist.

- [ ] **Step 5: Implement frontend utility modules**

Create `dashboard.js` with:

- `buildKpis(summary)`
- `maxDistributionValue(items, key = 'count')`
- `qualityRoute(metric)`

Create `formRules.js` with:

- `createRequiredRule(message)`
- `longitudeValidator(rule, value, callback)`
- `latitudeValidator(rule, value, callback)`
- `minLengthValidator(length, message)`

Create `resourceFilters.js` with:

- `cleanParams(params)`
- `parseQualityFromRoute(route)`

- [ ] **Step 6: Run frontend utility tests and verify they pass**

Run:

```bash
cd admin-frontend
node --test src/utils/dashboard.test.js src/utils/formRules.test.js src/utils/resourceFilters.test.js
```

Expected: PASS with 7 tests.

---

## Task 5: Admin Dashboard Route and Layout

**Files:**
- Create: `admin-frontend/src/views/Dashboard.vue`
- Modify: `admin-frontend/src/router/index.js`
- Modify: `admin-frontend/src/views/Layout.vue`

- [ ] **Step 1: Use existing utility tests as the red safety check**

Run:

```bash
cd admin-frontend
node --test src/utils/dashboard.test.js
```

Expected before Task 4 implementation: FAIL. Expected after Task 4 implementation: PASS.

- [ ] **Step 2: Add dashboard route**

Modify `admin-frontend/src/router/index.js`:

- Root layout redirect becomes `/dashboard`.
- Add child route `{ path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') }`.
- Existing `/users` admin guard remains unchanged.

- [ ] **Step 3: Add dashboard sidebar item**

Modify `admin-frontend/src/views/Layout.vue`:

- Import `DataBoard` or `TrendCharts` from Element Plus icons.
- Add a menu item before poets:

```vue
<el-menu-item index="/dashboard">
  <el-icon><DataBoard /></el-icon>
  <span>运营总览</span>
</el-menu-item>
```

- Add `'/dashboard': '运营总览'` to `pageTitles`.

- [ ] **Step 4: Create dashboard view**

Create `admin-frontend/src/views/Dashboard.vue`.

Dashboard behavior:

- Fetch `api.get('/admin/dashboard')` on mount.
- Show loading skeleton while fetching.
- Show retryable error state if request fails.
- Render KPI cards using `buildKpis`.
- Render quality metrics with clickable rows using `qualityRoute`.
- Render quick actions linking to `/poets`, `/spots`, `/poems`, and `/users?status=pending`.
- Render compact bars for `regions` and `dynasties`.
- Use restrained admin styling: no oversized hero, no nested cards, no decorative orbs.

- [ ] **Step 5: Build admin frontend**

Run:

```bash
cd admin-frontend
npm run build
```

Expected: Vite build succeeds.

---

## Task 6: Shared Admin Components

**Files:**
- Modify: `admin-frontend/src/components/DataTable.vue`
- Modify: `admin-frontend/src/components/FormDialog.vue`
- Modify: `admin-frontend/src/components/ImportDialog.vue`

- [ ] **Step 1: Run frontend utility tests as a baseline**

Run:

```bash
cd admin-frontend
node --test src/utils/dashboard.test.js src/utils/formRules.test.js src/utils/resourceFilters.test.js
```

Expected: PASS after Task 4.

- [ ] **Step 2: Enhance `DataTable.vue`**

Modify `DataTable.vue`:

- Props:
  - `fetchFn: Function`
  - `showImport: { type: Boolean, default: true }`
  - `showAdd: { type: Boolean, default: true }`
  - `emptyText: { type: String, default: '暂无数据' }`
- Add `<slot name="filters" />` between search controls and action controls.
- Track `errorMsg`.
- In `fetch`, set `errorMsg = ''` before request.
- If request fails, set `errorMsg = err.message || '加载失败'` and keep `data = []`.
- Add a retry button in the error state that calls `fetch`.
- Add an empty state under the table when `!loading && !errorMsg && data.length === 0`.
- Keep `defineExpose({ fetch })`.

- [ ] **Step 3: Enhance `FormDialog.vue`**

Modify `FormDialog.vue`:

- Add prop `rules: { type: Object, default: () => ({}) }`.
- Add `const formRef = ref(null)`.
- Bind `ref="formRef"` and `:rules="rules"` on `el-form`.
- In `submit`, call `await formRef.value.validate()` before `submitFn`.
- If validation fails, stop before calling `submitFn`.

- [ ] **Step 4: Enhance `ImportDialog.vue`**

Modify `ImportDialog.vue`:

- Keep existing alert.
- If `result.importedCount` is a number, show imported and skipped counts.
- If `result.errors` is a non-empty array, render up to 8 warnings in a compact list.
- If no file is selected and the user clicks upload, show `ElMessage.warning('请选择 Excel 文件')`.
- Reset `file` and `result` whenever the dialog opens.

- [ ] **Step 5: Build admin frontend**

Run:

```bash
cd admin-frontend
npm run build
```

Expected: Vite build succeeds.

---

## Task 7: Resource Page Filters and Validation

**Files:**
- Modify: `admin-frontend/src/views/SpotList.vue`
- Modify: `admin-frontend/src/views/PoemList.vue`
- Modify: `admin-frontend/src/views/PoetList.vue`
- Modify: `admin-frontend/src/views/EventList.vue`
- Modify: `admin-frontend/src/views/UserList.vue`

- [ ] **Step 1: Run frontend utility tests as a baseline**

Run:

```bash
cd admin-frontend
node --test src/utils/formRules.test.js src/utils/resourceFilters.test.js
```

Expected: PASS after Task 4.

- [ ] **Step 2: Update spot list filters and rules**

Modify `SpotList.vue`:

- Import `useRoute`, `cleanParams`, `parseQualityFromRoute`, `createRequiredRule`, `longitudeValidator`, and `latitudeValidator`.
- Add `regionFilter` and `qualityFilter`.
- Initialize `qualityFilter` from route query.
- Add DataTable `#filters` slot with region and quality `el-select`.
- `fetchSpots` sends `region` and `quality` through `cleanParams`.
- Pass rules to `FormDialog`:
  - `name`: required `请输入景点名称`
  - `region`: required `请选择地区`
  - `longitude`: custom longitude validator
  - `latitude`: custom latitude validator

- [ ] **Step 3: Update poem list filters and rules**

Modify `PoemList.vue`:

- Import `useRoute`, `cleanParams`, `parseQualityFromRoute`, and `createRequiredRule`.
- Add filter refs: `poetFilter`, `dynastyFilter`, `spotFilter`, `qualityFilter`.
- Initialize `qualityFilter` from route query.
- Add DataTable `#filters` slot with poet, dynasty, spot, and quality selects.
- `fetchPoems` sends `poetId`, `dynastyId`, `spotId`, and `quality` through `cleanParams`.
- Pass rules to `FormDialog`:
  - `title`: required `请输入诗词标题`
  - `content`: required `请输入诗词内容`

- [ ] **Step 4: Add rules to poet and event forms**

Modify `PoetList.vue`:

- Import `createRequiredRule`.
- Pass rules to `FormDialog` with `name` required `请输入诗人姓名`.

Modify `EventList.vue`:

- Import `createRequiredRule`.
- Pass rules to `FormDialog` with `title` required `请输入事件标题`.

- [ ] **Step 5: Update user password reset validation**

Modify `UserList.vue`:

- Import `minLengthValidator`.
- Add `resetFormRef`.
- Add rules for `newPassword`:
  - required message `请输入新密码`
  - validator `minLengthValidator(6, '密码至少 6 位')`
- Validate before calling reset password API.

- [ ] **Step 6: Build admin frontend**

Run:

```bash
cd admin-frontend
npm run build
```

Expected: Vite build succeeds.

---

## Task 8: Full Verification and Documentation Updates

**Files:**
- Modify: `progress.md`
- Modify: `task_plan.md`
- Optional modify: `admin-frontend/README.md`

- [ ] **Step 1: Run backend tests**

Run:

```bash
cd backend
mvn test
```

Expected: PASS. If Maven attempts to connect to the remote configured MySQL during unit tests, stop and adjust tests to avoid Spring context/database startup; do not write to remote data.

- [ ] **Step 2: Run frontend utility tests**

Run:

```bash
cd admin-frontend
node --test src/utils/dashboard.test.js src/utils/formRules.test.js src/utils/resourceFilters.test.js
```

Expected: PASS.

- [ ] **Step 3: Build admin frontend**

Run:

```bash
cd admin-frontend
npm run build
```

Expected: Vite build succeeds.

- [ ] **Step 4: Build display-v2**

Run:

```bash
cd display-v2
npm run build
```

Expected: Vite build succeeds because backend changes are additive and display code was not modified.

- [ ] **Step 5: Manual browser smoke test**

Run the admin frontend dev server:

```bash
cd admin-frontend
npm run dev
```

Open the local Vite URL printed by the command. Verify:

- Login page still renders.
- Authenticated root route lands on `/dashboard`.
- Sidebar includes `运营总览`, `诗人管理`, `景点管理`, `诗词管理`, `事件管理`, and admin-only `用户管理`.
- Dashboard shows loading, then KPI/quality/distribution sections when backend is available.
- Spot filters and poem filters are visible and do not resize the table layout.
- Empty required form fields show validation messages.
- Import dialog shows selected-file warning when upload is clicked without a file.

- [ ] **Step 6: Update planning files**

Update `progress.md` with commands run and outcomes. Update `task_plan.md` Phase 4/5 statuses only after implementation and verification evidence exists.

---

## Self-Review

### Spec Coverage

- Admin dashboard: Task 1 and Task 5.
- Backend read API: Task 1.
- Data-quality counts and distributions: Task 1 and Task 5.
- Shared table filters, empty state, and error state: Task 6.
- Form validation: Task 4, Task 6, and Task 7.
- Import feedback: Task 2 and Task 6.
- Spot and poem filtering: Task 3 and Task 7.
- Testing and verification: Task 1 through Task 8.

### Placeholder Scan

The plan avoids open-ended implementation placeholders. Each task names exact files, commands, expected results, and behavior.

### Type Consistency

- Backend dashboard response type is consistently `DashboardSummary`.
- Backend import response type is consistently `ImportResult`.
- Spot quality query param is consistently `quality`.
- Poem filters are consistently `poetId`, `dynastyId`, `spotId`, and `quality`.
- Frontend helpers are consistently `buildKpis`, `maxDistributionValue`, `qualityRoute`, `cleanParams`, `parseQualityFromRoute`, `createRequiredRule`, `longitudeValidator`, `latitudeValidator`, and `minLengthValidator`.
