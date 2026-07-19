# 诗人分层展示 + 数据清洗 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给诗人加后端计算的「完整度分」并随公开 API 返回, 前端 PoetList 按完整度分层(精品大卡 / 常规卡墙 / 折叠"更多"), 隐藏空朝代 tab, 并清洗 OSS 资产坏文件名。

**Architecture:** 后端在 `Poet` 实体上加 `@TableField(exist=false)` 瞬态字段 `completeness`(不落库, 避免陈旧), 由纯静态工具 `PoetCompletenessCalculator.compute(poet, poemCount)` 按公式计算; `PoetService.list()` 批量查诗数后回填, `PublicPoetController.getById()` 用已查的 poems 回填。前端 PoetList 把诗人按 completeness 分三层: ≥70 进「本期名士」大卡, 40-69 进卡墙, <40 折叠到"更多"。数据清洗用 Flyway V3 迁移 + mysql MCP 即时执行, `REPLACE` 修双后缀。

**Tech Stack:** Java 17 + Spring Boot + MyBatis-Plus + Flyway(MySQL); Vue 3 + Vite(display-v2); 阿里云 OSS。

**测试现状(重要):** 项目无测试基建(后端无 `src/test`, 前端无 vitest)。本计划采用**验证驱动**: 每步给具体 `curl` / SQL / 构建命令与期望输出, 代替自动测试。引入测试基建不在本计划范围。

**Git 策略(用户要求"与git互通"):**
- 当前分支 `feat/map-frame-layout`, 有未提交的 `display-v2/src/views/PoetList.vue`(书卷长廊/关系图谱视图切换重构)。#1 前端在其上叠加分层。
- **先提交在途重构**(Task 0), 再做 #1, 使 #1 改动干净可读。
- #1 按逻辑分 3 个提交: 后端完整度 / 数据清洗 / 前端分层。
- 停留在当前分支(PoetList 分层依赖在途重构, 切分支会痛苦 rebase)。若要更干净 PR 可事后拆分, 但默认不切。

---

## File Structure

| 文件 | 动作 | 职责 |
|---|---|---|
| `backend/src/main/java/com/sjg/entity/Poet.java` | 修改 | 加瞬态 `completeness` 字段 |
| `backend/src/main/java/com/sjg/util/PoetCompletenessCalculator.java` | 新建 | 纯静态完整度公式 |
| `backend/src/main/java/com/sjg/service/PoetService.java` | 修改 | `list()` 批量回填 completeness |
| `backend/src/main/java/com/sjg/controller/pub/PublicPoetController.java` | 修改 | `getById()` 回填 completeness |
| `backend/src/main/resources/db/migration/V3__fix_malformed_asset_filenames.sql` | 新建 | 坏文件名清洗迁移 |
| `display-v2/src/views/PoetList.vue` | 修改 | 隐藏空朝代 + 修 typo + 完整度分层 |

---

## Task 0: 提交在途 PoetList 重构(隔离 #1 改动)

**Files:** `display-v2/src/views/PoetList.vue`

- [ ] **Step 1: 确认在途改动范围**

Run: `git -C /Users/a1/develop/vibecoding/sjg status --short`
Expected: ` M display-v2/src/views/PoetList.vue`(仅此一个未提交)

- [ ] **Step 2: 提交在途重构**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/views/PoetList.vue
git commit -m "feat(display-v2): 名士页书卷长廊/关系图谱视图切换重构"
```
Expected: 1 commit, working tree clean.

---

## Task 1: Poet 实体加 completeness 瞬态字段

**Files:**
- Modify: `backend/src/main/java/com/sjg/entity/Poet.java`

- [ ] **Step 1: 加 TableField import**

在 `Poet.java` 顶部 import 区(import `io.swagger...` 之后)加:

```java
import com.baomidou.mybatisplus.annotation.TableField;
```

- [ ] **Step 2: 加 completeness 字段**

在 `private String style;` 字段之后、`private LocalDateTime createdAt;` 之前插入:

```java
    @TableField(exist = false)
    @Schema(description = "完整度分(0-100, 后端计算)", example = "85")
    private Integer completeness;
```

- [ ] **Step 3: 编译验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/backend && mvn -q -DskipTests compile`
Expected: BUILD SUCCESS(无报错)。

---

## Task 2: PoetCompletenessCalculator 纯静态工具

**Files:**
- Create: `backend/src/main/java/com/sjg/util/PoetCompletenessCalculator.java`

- [ ] **Step 1: 创建工具类**

完整文件内容:

```java
package com.sjg.util;

import com.sjg.entity.Poet;
import org.springframework.util.StringUtils;

/**
 * 诗人完整度分计算(0-100)。
 * 权重: bio(20) + 真人头像(15) + 水墨头像(15) + 风格(15)
 *       + 籍贯(10) + 生年(10) + 诗篇数(15, ≥3 满)
 * 头像字段在库中为 JSON 数组字符串(如 ["https://..."]), 非空且非 [] 视为有。
 */
public final class PoetCompletenessCalculator {

    private PoetCompletenessCalculator() {}

    public static int compute(Poet p, int poemCount) {
        if (p == null) return 0;
        int score = 0;
        if (StringUtils.hasText(p.getBiography())) score += 20;
        if (hasMedia(p.getAvatarUrl())) score += 15;
        if (hasMedia(p.getAvatarAnimeUrl())) score += 15;
        if (StringUtils.hasText(p.getStyle())) score += 15;
        if (StringUtils.hasText(p.getBirthplace())) score += 10;
        if (p.getBirthYear() != null) score += 10;
        int pc = poemCount < 0 ? 0 : Math.min(poemCount, 3);
        score += pc * 5; // 0->0, 1->5, 2->10, >=3->15
        return Math.min(score, 100);
    }

    private static boolean hasMedia(String s) {
        if (s == null) return false;
        String t = s.trim();
        return !t.isEmpty() && !t.equals("[]");
    }
}
```

- [ ] **Step 2: 编译验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/backend && mvn -q -DskipTests compile`
Expected: BUILD SUCCESS。

---

## Task 3: 在 list / getById 回填 completeness

**Files:**
- Modify: `backend/src/main/java/com/sjg/service/PoetService.java`
- Modify: `backend/src/main/java/com/sjg/controller/pub/PublicPoetController.java`

- [ ] **Step 1: PoetService 加 import**

在 `PoetService.java` import 区加(`java.util.*` 已有 Map/HashMap, 补 Collectors 与工具类):

```java
import java.util.stream.Collectors;
import com.sjg.util.PoetCompletenessCalculator;
```

- [ ] **Step 2: 改写 list() 回填完整度**

把现有 `list` 方法:

```java
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
```

替换为:

```java
    public PageResult<Poet> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Poet> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Poet::getName, keyword)
                   .or().like(Poet::getBirthplace, keyword));
        }
        wrapper.orderByDesc(Poet::getId);
        Page<Poet> result = poetMapper.selectPage(new Page<>(page, size), wrapper);
        List<Poet> poets = result.getRecords();
        enrichCompleteness(poets);
        return new PageResult<>(poets, result.getTotal(), page, size);
    }

    /** 批量回填完整度分: 一次查出本页诗人关联诗数, 逐人计算。 */
    private void enrichCompleteness(List<Poet> poets) {
        if (poets == null || poets.isEmpty()) return;
        List<Long> ids = poets.stream().map(Poet::getId).collect(Collectors.toList());
        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().in(Poem::getPoetId, ids));
        Map<Long, Long> countById = poems.stream()
            .collect(Collectors.groupingBy(Poem::getPoetId, Collectors.counting()));
        for (Poet p : poets) {
            int pc = countById.getOrDefault(p.getId(), 0L).intValue();
            p.setCompleteness(PoetCompletenessCalculator.compute(p, pc));
        }
    }
```

- [ ] **Step 3: PublicPoetController.getById 回填完整度**

在 `PublicPoetController.java` 的 `getById` 方法里, 已有:

```java
        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().eq(Poem::getPoetId, id));

        Dynasty dynasty = dynastyMapper.selectById(poet.getDynastyId());
```

在其后、构建 result 之前插入一行回填:

```java
        poet.setCompleteness(
            com.sjg.util.PoetCompletenessCalculator.compute(poet, poems.size()));
```

- [ ] **Step 4: 编译验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/backend && mvn -q -DskipTests compile`
Expected: BUILD SUCCESS。

- [ ] **Step 5: 提交后端完整度**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add backend/src/main/java/com/sjg/entity/Poet.java \
        backend/src/main/java/com/sjg/util/PoetCompletenessCalculator.java \
        backend/src/main/java/com/sjg/service/PoetService.java \
        backend/src/main/java/com/sjg/controller/pub/PublicPoetController.java
git commit -m "feat(backend): poet 完整度分 completeness 计算与返回"
```

---

## Task 4: API 验证 completeness

**前置:** 后端需在运行(默认端口见 `application.yml`, 本计划假设 `8080`)。若未运行, 让用户用 `! cd /Users/a1/develop/vibecoding/sjg/backend && mvn spring-boot:run` 启动, 或由执行者后台启动。

- [ ] **Step 1: 查一个已知诗人的字段(手算期望值)**

用 mysql MCP 执行:

```sql
SELECT id, name, biography, avatar_url, avatar_anime_url, style, birthplace, birth_year
FROM poet WHERE name='李白';
```
记下各字段是否非空, 按公式手算李白期望 completeness(bio+头像+风格+籍贯+生年+诗数)。

- [ ] **Step 2: 列表接口含 completeness**

Run: `curl -s 'http://localhost:8080/api/public/poets?size=5' | head -c 800`
Expected: JSON 中每条 record 含 `"completeness":<整数 0-100>`。

- [ ] **Step 3: 详情接口含 correctness**

用 Step 1 拿到的李白 id(假设 N)执行:
Run: `curl -s 'http://localhost:8080/api/public/poets/N' | head -c 400`
Expected: `poet.completeness` 等于 Step 1 手算值(误差 ±0)。

- [ ] **Step 4: 边界——无诗数诗人也为 0-15 区间**

Run: `curl -s 'http://localhost:8080/api/public/poets?size=200' | grep -o '"completeness":[0-9]*' | sort -t: -k2 -n | head -3`
Expected: 最低若干诗人 completeness 反映"信息薄"(多为 0-40), 不为 null。

---

## Task 5: 数据清洗——坏文件名迁移

**Files:**
- Create: `backend/src/main/resources/db/migration/V3__fix_malformed_asset_filenames.sql`

- [ ] **Step 1: 先盘点坏文件名(确认范围)**

用 mysql MCP 执行(预期: 命中 `.jpg.jpg` / `.jpg.jpeg` / `.jpg.mp4` 若干行):

```sql
SELECT 'spot.img' k, COUNT(*) c FROM scenic_spot WHERE image_url LIKE '%.jpg.jpg%' OR image_url LIKE '%.jpg.jpeg%'
UNION ALL SELECT 'spot.ink', COUNT(*) FROM scenic_spot WHERE image_anime_url LIKE '%.jpg.jpg%' OR image_anime_url LIKE '%.jpg.jpeg%'
UNION ALL SELECT 'poet.avatar', COUNT(*) FROM poet WHERE avatar_url LIKE '%.jpg.jpg%' OR avatar_url LIKE '%.jpg.jpeg%'
UNION ALL SELECT 'poem.video', COUNT(*) FROM poem WHERE video_url LIKE '%.jpg.mp4%';
```

- [ ] **Step 2: 创建 Flyway V3 迁移文件**

完整文件内容:

```sql
-- V3: 修复 OSS 资产坏文件名(双后缀 / 错误后缀)
-- .jpg.jpg -> .jpg ; .jpg.jpeg -> .jpeg ; .jpg.mp4 -> .mp4
-- REPLACE 幂等, 二次执行无匹配行, 安全。

UPDATE scenic_spot SET image_url = REPLACE(image_url, '.jpg.jpg', '.jpg') WHERE image_url LIKE '%.jpg.jpg%';
UPDATE scenic_spot SET image_url = REPLACE(image_url, '.jpg.jpeg', '.jpeg') WHERE image_url LIKE '%.jpg.jpeg%';
UPDATE scenic_spot SET image_anime_url = REPLACE(image_anime_url, '.jpg.jpg', '.jpg') WHERE image_anime_url LIKE '%.jpg.jpg%';
UPDATE scenic_spot SET image_anime_url = REPLACE(image_anime_url, '.jpg.jpeg', '.jpeg') WHERE image_anime_url LIKE '%.jpg.jpeg%';
UPDATE poet SET avatar_url = REPLACE(avatar_url, '.jpg.jpg', '.jpg') WHERE avatar_url LIKE '%.jpg.jpg%';
UPDATE poet SET avatar_url = REPLACE(avatar_url, '.jpg.jpeg', '.jpeg') WHERE avatar_url LIKE '%.jpg.jpeg%';
UPDATE poem SET video_url = REPLACE(video_url, '.jpg.mp4', '.mp4') WHERE video_url LIKE '%.jpg.mp4%';
```

- [ ] **Step 3: 即时执行清洗(经 mysql MCP, 不等重启)**

逐条用 mysql MCP 执行 Step 2 中的 7 条 UPDATE, 记录每条影响行数。

- [ ] **Step 4: 验证——坏文件名清零**

用 mysql MCP 执行 Step 1 的盘点 SQL:
Expected: 4 行 `c` 全为 `0`。

- [ ] **Step 5: 提交迁移文件**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add backend/src/main/resources/db/migration/V3__fix_malformed_asset_filenames.sql
git commit -m "fix(data): 修复 OSS 资产坏文件名(.jpg.jpg/.jpg.jpeg/.jpg.mp4)"
```

---

## Task 6: 前端——隐藏空朝代 + 修 typo

**Files:**
- Modify: `display-v2/src/views/PoetList.vue`

- [ ] **Step 1: 删除 stray typo**

把 `PoetList.vue` 第 14 行:

```
      <!-- 今日名句 -->scenic_spot
```

改为:

```
      <!-- 今日名句 -->
```

- [ ] **Step 2: dynastyItems 过滤掉空朝代**

把 `dynastyItems` computed(约 193-202 行):

```js
const dynastyItems = computed(() => [
  { id: null, name: '全部', poetCount: poets.value.length },
  ...DYNASTIES.map((d) => ({
    id: d.id,
    name: d.name,
    startYear: d.start,
    endYear: d.end,
    poetCount: countByDynasty(d.id),
  })),
])
```

改为(过滤 poetCount===0 的朝代, 保留"全部"):

```js
const dynastyItems = computed(() => [
  { id: null, name: '全部', poetCount: poets.value.length },
  ...DYNASTIES.map((d) => ({
    id: d.id,
    name: d.name,
    startYear: d.start,
    endYear: d.end,
    poetCount: countByDynasty(d.id),
  })).filter((d) => d.poetCount > 0),
])
```

- [ ] **Step 3: 顺手修 heroStats 的"跨越朝代"基数**

`heroStats` 中 `DYNASTIES.length` 现包含空朝代, 改为只数有诗人的朝代。把:

```js
    { value: DYNASTIES.length, suffix: '朝', label: '跨越朝代' },
```

改为:

```js
    { value: dynastiesWithPoets, suffix: '朝', label: '跨越朝代' },
```

(`dynastiesWithPoets` 已在上方计算, 见原文件 247 行)

- [ ] **Step 4: 构建验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run build`
Expected: build 成功, 无错误。

---

## Task 7: 前端——完整度分层

**Files:**
- Modify: `display-v2/src/views/PoetList.vue`

- [ ] **Step 1: 重定义 featuredPoets 为精品层(≥70)**

把 `featuredPoets` computed(约 216-220 行):

```js
const featuredPoets = computed(() =>
  [...enrichedPoets.value]
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
    .slice(0, 3),
)
```

改为(优先 completeness≥70, 诗数多者靠前; 不足则回退 top3 by poemCount):

```js
const featuredPoets = computed(() => {
  const premium = [...enrichedPoets.value]
    .filter((p) => (p.completeness ?? 0) >= 70)
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
  if (premium.length) return premium.slice(0, 6)
  return [...enrichedPoets.value]
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
    .slice(0, 3)
})
```

- [ ] **Step 2: 卡墙按完整度分常规层与折叠层**

在 `filteredEnrichedPoets` computed 之后新增两个 computed(约 214 行后):

```js
// 卡墙常规层(40-69): 默认展示
const standardPoets = computed(() =>
  filteredEnrichedPoets.value.filter((p) => {
    const c = p.completeness ?? 0
    return c >= 40 && c < 70
  }),
)
// 卡墙折叠层(<40): 信息薄, 默认收起
const marginalPoets = computed(() =>
  filteredEnrichedPoets.value.filter((p) => (p.completeness ?? 0) < 40),
)
const showMarginal = ref(false)
```

- [ ] **Step 3: 模板——卡墙用 standardPoets, 加折叠区**

把名士卡墙 section(原用 `filteredEnrichedPoets`)的列表来源与计数改为 `standardPoets`, 并在空态判断后加折叠"更多"。把:

```html
            <div class="section-bar">
              <span class="section-bar-title">{{ selectedDynastyName }}</span>
              <span class="section-bar-count">{{ filteredEnrichedPoets.length }} 位</span>
            </div>

            <div class="cards-grid-list" v-if="filteredEnrichedPoets.length">
              <article
                v-for="p in filteredEnrichedPoets"
```

改为:

```html
            <div class="section-bar">
              <span class="section-bar-title">{{ selectedDynastyName }}</span>
              <span class="section-bar-count">{{ standardPoets.length }} 位</span>
            </div>

            <div class="cards-grid-list" v-if="standardPoets.length">
              <article
                v-for="p in standardPoets"
```

并把该 section 的闭合空态 `v-else` 块之后(即 `</section>` 之前)插入折叠"更多"块:

```html
            <div class="empty-card" v-else>
              <p class="empty-icon">∅</p>
              <p>该朝代暂无收录诗人</p>
            </div>

            <!-- 折叠: 信息待考的名士(完整度<40), 默认收起 -->
            <div v-if="marginalPoets.length" class="marginal-wrap">
              <button class="marginal-toggle" @click="showMarginal = !showMarginal">
                {{ showMarginal ? '收起' : '展开' }}更多 {{ marginalPoets.length }} 位(信息待考)
                <span class="marginal-arrow" :class="{ open: showMarginal }">▾</span>
              </button>
              <Transition name="tab-fade">
                <div v-show="showMarginal" class="cards-grid-list marginal-grid">
                  <article
                    v-for="p in marginalPoets"
                    :key="p.id"
                    class="poet-card-wrap card hover-lift is-marginal"
                    @click="$router.push(`/poets/${p.id}`)"
                    :aria-label="`查看 ${p.name} 详情`"
                  >
                    <div class="poet-avatar-box">
                      <img
                        v-if="getPoetAvatar(p)"
                        :src="getPoetAvatar(p)"
                        :alt="p.name"
                        class="poet-img"
                        @error="onAvatarError"
                      />
                      <span class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
                      <span class="poet-stamp">文</span>
                    </div>
                    <div class="poet-card-body">
                      <div class="poet-title-row">
                        <h3 class="poet-name-tag">{{ p.name }}</h3>
                        <span class="poet-dynasty-badge">{{ getDynastyName(p.dynastyId) }}</span>
                      </div>
                      <p class="poet-biography poet-biography--empty">生平待考，然其诗已传。</p>
                      <div class="poet-style-box">
                        <span class="style-lbl">传世</span>
                        <span class="style-val">{{ p.poemCount || 0 }} 篇</span>
                      </div>
                    </div>
                  </article>
                </div>
              </Transition>
            </div>
```

- [ ] **Step 4: 加折叠样式**

在 `<style scoped>` 内 `.empty-card { ... }` 块之后插入:

```css
/* ---------- marginal folded ---------- */
.marginal-wrap {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px dashed var(--border-light);
}
.marginal-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  padding: 8px 22px;
  background: var(--card-bg);
  border: 1px dashed var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 1px;
  transition: all 0.25s;
}
.marginal-toggle:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
.marginal-arrow {
  transition: transform 0.25s;
  font-size: 11px;
}
.marginal-arrow.open {
  transform: rotate(180deg);
}
.marginal-grid {
  margin-top: 20px;
}
.is-marginal {
  opacity: 0.85;
}
```

- [ ] **Step 5: 构建验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run build`
Expected: build 成功。

- [ ] **Step 6: 提交前端分层**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/views/PoetList.vue
git commit -m "feat(display-v2): 名士页按完整度分层 + 隐藏空朝代 + 修 typo"
```

---

## Task 8: 前端行为验证(可视化)

**前置:** 后端运行(Task 4 已起), 前端 `npm run dev` 起在 Vite 默认端口。

- [ ] **Step 1: 起前端**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run dev`
(后台运行, 记下本地 URL, 如 `http://localhost:5173`)

- [ ] **Step 2: 朝代 rail 无先秦**

浏览器开 `/poets`, 看朝代 rail:
Expected: 无"先秦"chip; chip 数 = 有诗人的朝代数(8 中去先秦 = 7 个 + "全部")。

- [ ] **Step 3: 本期名士为精品层**

看「本期名士·传世最丰」大卡:
Expected: 展示 completeness≥70 的诗人(应是李白/杜甫/李清照/辛弃疾/赵孟頫/蒲松龄 等头像齐全者), 至多 6 个。

- [ ] **Step 4: 卡墙常规层 + 折叠层**

看名士卡墙:
Expected: 卡墙展示 completeness 40-69 的诗人; 底部有"展开更多 N 位(信息待考)"按钮; 点击展开后显示 <40 的诗人卡(默认收起)。

- [ ] **Step 5: 切朝代过滤生效**

点某朝代(如"清"):
Expected: 卡墙与折叠层只显示该朝代诗人; "全部"恢复全量。

- [ ] **Step 6: 双主题不破版**

切换 real / inkwash 主题:
Expected: 卡片样式(头像兜底章、徽章)在两主题下均不破版。

---

## Self-Review

**1. Spec 覆盖(spec §2.#1 + §3):**
- completeness 字段 + 公式 + API 返回 → Task 1/2/3/4 ✓
- 分层(≥70 精品大卡 / 40-69 卡墙 / <40 折叠) → Task 7 ✓
- 先秦空朝代 tab 隐藏 → Task 6 ✓
- 坏文件名清洗 → Task 5 ✓
- OSS 路径校验 → Task 5 修坏文件名; 全量 OSS 存在性(HTTP HEAD)核验不在本计划(需 OSS 运行时凭据), 已在 spec §5 风险列出, 此处不展开。

**2. Placeholder 扫描:** 无 TBD/TODO; 每步含完整代码或确切命令与期望。✓

**3. 类型/命名一致:** `completeness`(Integer) 在 Poet/Calculator/Service/Controller/前端 均用驼峰 `completeness`, JSON 同名, 前端 `p.completeness` 一致。`PoetCompletenessCalculator.compute(Poet, int)` 签名在 Task 2 定义、Task 3 调用一致。`standardPoets`/`marginalPoets`/`showMarginal` 定义(Task 7 Step 2)与模板引用(Step 3)一致。✓

**4. 测试基建缺失:** 已在顶部声明采用验证驱动代替 TDD; 唯一含逻辑的纯函数 `compute` 经 Task 4 Step 1-3 用真实诗人手算 + API 比对验证。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-19-poet-tiering-and-data-cleanup.md`. Two execution options:

**1. Subagent-Driven (recommended)** — 每个 Task 派一个新 subagent, 任务间评审, 迭代快。
**2. Inline Execution** — 在本会话内按 executing-plans 批量执行, 带检查点评审。

Which approach?
