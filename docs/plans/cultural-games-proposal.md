# 文化长廊互动小游戏方案

## 📋 项目现状分析

### 现有文化模块结构
基于对 `display-v2` 项目的深入分析，当前文化长廊包含**五大板块**：

| 板块 | 路由 | 特色 | 互动潜力 |
|------|------|------|----------|
| 🎭 民俗节庆 | `/festivals` | 春节、元宵、牡丹盛会 | 节日习俗体验、民俗游戏 |
| 📜 古诗词 | `/poets` | 唐诗宋词、咏物抒怀 | 诗词创作、飞花令 |
| 🎨 非遗工艺 | `/crafts` | 东昌葫芦、剪纸、年画 | **3D制作体验**、工艺流程互动 |
| 📖 民间文学 | `/literature` | 传说、故事、民间 | 故事续写、角色扮演 |
| 🍜 饮食戏曲 | `/food-opera` | 鲁菜、吕剧、快书 | 虚拟烹饪、戏曲模仿 |

### 技术基础优势
项目已具备强大的互动技术基础：

1. **3D渲染能力**
   - Three.js + GLB/GLTF 模型加载（`useGlbScene.js`）
   - 3D场景管理与交互（`useThreeSandbox.js`）
   - 相机动画与部件控制

2. **动画系统**
   - GSAP 动画库（复杂时间线动画）
   - 工艺流程状态机（`useCraftProcess.js`）
   - 步骤式3D动画展示（已有东昌葫芦雕刻案例）

3. **视觉风格**
   - 统一的水墨风格（inkwash主题）
   - 印章元素（朱红+水墨）
   - 程序化视觉生成（`InkPlaceholder.vue`）

---

## 🎮 互动小游戏方案

### 方案一：非遗3D制作工坊（重点推荐）

#### 1. 东昌葫芦雕刻体验
**基于现有 `useCraftProcess.js` 扩展**

```
功能设计：
- 3D葫芦模型展示（可360°旋转观察）
- 分步骤雕刻体验（5-8个步骤）
- 交互式工具选择（刻刀、烙铁、彩绘）
- 实时雕刻效果预览
- 作品保存与分享

技术实现：
- 复用 useGlbScene 加载葫芦GLB模型
- 扩展 useCraftProcess 支持用户交互
- Three.js Raycaster 实现点击雕刻
- 纹理动态生成（Canvas纹理）
- GSAP动画展示雕刻过程
```

**用户体验流程：**
1. 📖 介绍葫芦雕刻历史（30秒）
2. 🎨 选择葫芦形态（亚腰、瓢圆、长柄）
3. 🔧 选择雕刻工具（3种工具，不同效果）
4. ✏️ 分步雕刻体验（每步1-2分钟）
5. 🎨 上色与装饰（颜色选择器）
6. 📸 保存3D作品截图
7. 🏆 获得"非遗传承人"徽章

#### 2. 剪纸艺术创作
```
功能设计：
- 2D/3D剪纸预览（对称折叠效果）
- 多种传统纹样库（花鸟、人物、吉祥图案）
- 自由绘制与纹样组合
- 红色/金色/多色模式
- 剪纸动画展开效果

技术实现：
- Canvas 2D绘图（用户自由创作）
- Three.js 折叠动画（纸张物理模拟）
- SVG纹样库（预制传统图案）
- 对称轴系统（多次折叠）
- GSAP展开动画
```

#### 3. 年画填色与创作
```
功能设计：
- 传统年画线稿展示
- 分区域填色（门神、财神、福禄寿）
- 传统配色方案推荐
- 动态年画生成（表情、姿态微调）
- 打印与分享功能

技术实现：
- Canvas 2D分区填色
- 预设色板系统
- WebGL着色器（特殊效果）
- SVG线稿矢量化
```

---

### 方案二：诗词互动体验

#### 1. 飞花令对战
```
功能设计：
- 单人/双人模式
- AI对战（基于诗词数据库）
- 多种令字（花、月、春、秋等）
- 语音识别输入（可选）
- 积分排行榜

技术实现：
- 诗词数据库查询（已有poem表）
- 关键词匹配算法
- WebSocket实时对战
- Web Speech API（语音）
```

#### 2. 诗词创作助手
```
功能设计：
- 格律指导（平仄、押韵）
- 词汇推荐（意象词库）
- 智能续写（AI辅助）
- 书法效果预览
- 作品生成海报

技术实现：
- 格律规则引擎
- NLP词汇推荐
- LLM API调用（现有ChatService）
- Canvas书法渲染
```

#### 3. 诗词意境探索
```
功能设计：
- 3D场景还原诗词意境
- 互动式场景探索
- 诗句与场景对应
- AR增强体验（可选）

技术实现：
- Three.js场景构建
- 粒子系统（雪、雨、花瓣）
- 空间音频（配乐朗诵）
- WebXR（AR功能）
```

---

### 方案三：民俗游戏集

#### 1. 节庆习俗模拟
```
功能设计：
- 春节：写春联、包饺子、放鞭炮
- 元宵：猜灯谜、做花灯
- 端午：包龙舟、佩香囊
- 中秋：做月饼、赏月
- 每个节日独立小游戏

技术实现：
- 物理引擎（包饺子、做月饼）
- Canvas绘图（写春联）
- 谜语数据库
- 动画系统
```

#### 2. 民间故事互动剧
```
功能设计：
- 分支剧情选择
- 角色对话系统
- 多结局设计
- 剧情解锁收集
- 声优配音（可选）

技术实现：
- 对话树引擎
- 状态机剧情管理
- Web Audio配音
- 存档系统
```

#### 3. 鲁菜大师养成
```
功能设计：
- 食材识别与选择
- 烹饪步骤模拟
- 火候控制（时间管理）
- 摆盘艺术
- 菜谱生成与分享

技术实现：
- Canvas烹饪动画
- 物理模拟（食材处理）
- 时间管理系统
- 成就系统
```

---

### 方案四：戏曲文化体验

#### 1. 脸谱绘制
```
功能设计：
- 传统脸谱模板
- 自由绘制工具
- 脸谱含义讲解
- AR试妆效果
- 脸谱收集册

技术实现：
- Canvas 2D绘制
- 面部识别（MediaPipe）
- AR叠加渲染
- 数据库存储
```

#### 2. 戏曲身段模仿
```
功能设计：
- 视频示范（生旦净末丑）
- 动作捕捉对比
- 评分系统
- 解锁经典唱段
- 社交分享

技术实现：
- WebRTC视频
- 姿态估计（TensorFlow.js）
- 动作相似度算法
- 音频分析
```

#### 3. 戏曲知识问答
```
功能设计：
- 多种题型（选择、填空、连线）
- 难度分级
- 限时挑战
- 知识图谱可视化
- 成就系统

技术实现：
- 题库管理系统
- 计时器系统
- D3.js知识图谱
- 本地存储进度
```

---

## 🏗️ 技术架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────┐
│                    前端展示层                         │
│  display-v2 (Vue 3 + Three.js + GSAP + Canvas)      │
├─────────────────────────────────────────────────────┤
│                    互动组件层                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ 3D制作工坊 │  │ 诗词互动  │  │ 民俗游戏  │       │
│  └───────────┘  └───────────┘  └───────────┘       │
├─────────────────────────────────────────────────────┤
│                    业务逻辑层                         │
│  useGlbScene | useCraftProcess | useGameState        │
├─────────────────────────────────────────────────────┤
│                    数据服务层                         │
│  API Gateway → Spring Boot Backend                   │
│  ├─ /api/games/* (游戏进度、成就)                    │
│  ├─ /api/cultural/* (文化数据)                       │
│  └─ /api/llm/* (AI辅助功能)                         │
└─────────────────────────────────────────────────────┘
```

### 新增模块规划

#### 1. 游戏状态管理（新增Composable）
```javascript
// display-v2/src/composables/useGameState.js
export function useGameState(gameId) {
  const state = ref({
    progress: 0,        // 进度
    achievements: [],   // 成就
    score: 0,          // 分数
    unlocked: [],      // 解锁内容
    history: []        // 历史记录
  })
  
  const save = () => { /* 本地存储 + 云端同步 */ }
  const load = () => { /* 加载存档 */ }
  const unlock = (achievementId) => { /* 解锁成就 */ }
  
  return { state, save, load, unlock }
}
```

#### 2. 3D互动引擎（扩展现有）
```javascript
// display-v2/src/composables/useInteractiveCraft.js
export function useInteractiveCraft(config) {
  const { scene, camera, controls } = useGlbScene(config.modelUrl)
  const { enter, next, prev } = useCraftProcess(config.process, scene)
  
  // 用户交互层
  const raycaster = new THREE.Raycaster()
  const selectedTool = ref(null)
  const userCreations = ref([])
  
  const onUserClick = (event) => { /* 处理用户点击雕刻 */ }
  const applyToolEffect = (tool, position) => { /* 应用工具效果 */ }
  const exportCreation = () => { /* 导出3D作品 */ }
  
  return { 
    scene, camera, controls,
    enter, next, prev,
    onUserClick, applyToolEffect, exportCreation,
    selectedTool, userCreations
  }
}
```

#### 3. 成就系统（新增服务端）
```java
// backend entity
@Data
@TableName("game_achievement")
public class GameAchievement {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String gameId;           // 游戏ID
    private String achievementKey;   // 成就标识
    private String name;             // 成就名称
    private String description;      // 描述
    private String iconUrl;          // 图标
    private Integer points;          // 积分
    private String unlockCondition;  // 解锁条件（JSON）
}

// backend entity
@Data
@TableName("user_game_progress")
public class UserGameProgress {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String gameId;
    private Integer progress;        // 进度百分比
    private Integer highScore;       // 最高分
    private String unlockedAchievements; // 已解锁成就（JSON）
    private String saveData;         // 存档数据（JSON）
    private LocalDateTime lastPlayed;
}
```

---

## 🎨 UI/UX 设计规范

### 视觉风格（与项目保持一致）

#### 色彩系统
```css
/* 继承项目现有的水墨风格token */
:root {
  --game-accent: var(--accent);          /* 朱红 */
  --game-accent-soft: var(--accent-soft);
  --game-bg: var(--card-bg);
  --game-text: var(--text-primary);
  --game-line: var(--line);
  
  /* 游戏专用色彩 */
  --game-success: #4a7c59;    /* 成功绿（传统绿） */
  --game-warning: #c9a227;    /* 警告金 */
  --game-info: #7f9aa0;       /* 信息青 */
}
```

#### 字体系统
```css
/* 继承项目字体 */
.game-heading {
  font-family: var(--font-heading);  /* 标题：思源宋体 */
  letter-spacing: 4px;
}

.game-body {
  font-family: var(--font-body);     /* 正文：思源黑体 */
  line-height: 1.8;
}

.game-seal {
  font-family: var(--font-display);  /* 印章字 */
}
```

#### 交互反馈
```css
/* 按钮悬停效果（复用项目样式） */
.game-btn {
  background: var(--game-accent);
  color: var(--text-on-accent);
  border: 1px solid var(--game-accent);
  transition: all 0.3s ease;
}

.game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
}

/* 成就解锁动画 */
@keyframes achievementUnlock {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.achievement-popup {
  animation: achievementUnlock 0.6s ease-out;
}
```

### 组件设计示例

#### 游戏卡片组件
```vue
<!-- display-v2/src/components/games/GameCard.vue -->
<template>
  <div class="game-card" :class="{ locked: !unlocked }">
    <div class="gc-image">
      <InkPlaceholder :seed="gameId" :kind="category" />
      <div class="gc-badge" v-if="isNew">新</div>
      <div class="gc-progress" v-if="progress > 0">
        <div class="gc-progress-bar" :style="{ width: `${progress}%` }" />
      </div>
    </div>
    <div class="gc-content">
      <h3 class="gc-title">{{ title }}</h3>
      <p class="gc-desc">{{ description }}</p>
      <div class="gc-meta">
        <span class="gc-difficulty">
          <span v-for="i in difficulty" :key="i">★</span>
        </span>
        <span class="gc-players">{{ playerCount }}人在玩</span>
      </div>
    </div>
    <div class="gc-footer">
      <button class="gc-play-btn" :disabled="locked">
        {{ locked ? '🔒 未解锁' : '🎮 开始游戏' }}
      </button>
    </div>
  </div>
</template>
```

#### 3D工坊界面布局
```vue
<!-- display-v2/src/components/games/CraftWorkshop.vue -->
<template>
  <div class="craft-workshop">
    <!-- 左侧：工具栏 -->
    <aside class="cw-tools">
      <div class="cw-tool-group">
        <h4>雕刻工具</h4>
        <button 
          v-for="tool in tools" 
          :key="tool.id"
          :class="{ active: selectedTool === tool.id }"
          @click="selectTool(tool.id)"
        >
          <img :src="tool.icon" :alt="tool.name" />
          <span>{{ tool.name }}</span>
        </button>
      </div>
      <div class="cw-tool-group">
        <h4>颜色</h4>
        <div class="cw-colors">
          <div 
            v-for="color in colors" 
            :key="color"
            class="cw-color-swatch"
            :style="{ background: color }"
            @click="selectedColor = color"
          />
        </div>
      </div>
    </aside>
    
    <!-- 中央：3D视图 -->
    <main class="cw-viewport">
      <div ref="canvasContainer" class="cw-canvas" />
      <div class="cw-controls">
        <button @click="resetCamera">重置视角</button>
        <button @click="toggleWireframe">线框模式</button>
      </div>
    </main>
    
    <!-- 右侧：步骤引导 -->
    <aside class="cw-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="cw-step"
        :class="{ 
          active: currentStep === index,
          completed: currentStep > index 
        }"
      >
        <div class="cw-step-number">{{ index + 1 }}</div>
        <div class="cw-step-info">
          <h5>{{ step.title }}</h5>
          <p>{{ step.description }}</p>
        </div>
      </div>
      <div class="cw-step-nav">
        <button @click="prevStep" :disabled="currentStep === 0">上一步</button>
        <button @click="nextStep" :disabled="currentStep === steps.length - 1">
          {{ currentStep === steps.length - 1 ? '完成' : '下一步' }}
        </button>
      </div>
    </aside>
  </div>
</template>
```

---

## 📅 实施路线图

### 第一阶段：基础框架（2周）

#### Week 1-2：基础设施
- [ ] 创建 `display-v2/src/views/Games/` 目录结构
- [ ] 实现 `useGameState` composable（游戏状态管理）
- [ ] 扩展 `useInteractiveCraft`（基于现有 `useCraftProcess`）
- [ ] 设计游戏路由配置（`/games`, `/games/:id`）
- [ ] 创建游戏卡片组件（GameCard）
- [ ] 实现成就系统基础（前端）

#### 交付物：
- 游戏中心页面框架
- 基础游戏状态管理
- 通用UI组件库

---

### 第二阶段：3D非遗工坊（3周）

#### Week 3-4：葫芦雕刻体验
- [ ] 制作葫芦3D模型（GLB格式，2000-3000面）
- [ ] 实现雕刻纹理动态生成
- [ ] 开发工具交互系统（刻刀、烙铁、彩绘）
- [ ] 实现分步引导流程
- [ ] 添加音效与背景音乐

#### Week 5：剪纸与年画
- [ ] 开发2D剪纸绘图工具
- [ ] 实现对称折叠系统
- [ ] 开发年画填色功能
- [ ] 添加纹样素材库

#### 交付物：
- 葫芦雕刻3D体验（完整流程）
- 剪纸创作工具
- 年画填色游戏

---

### 第三阶段：诗词互动（2周）

#### Week 6-7
- [ ] 实现飞花令对战系统
- [ ] 开发诗词创作助手
- [ ] 集成LLM API（现有ChatService）
- [ ] 添加语音输入（Web Speech API）
- [ ] 实现诗词意境3D场景

#### 交付物：
- 飞花令单人/双人模式
- 诗词创作工具
- 诗词场景探索

---

### 第四阶段：民俗游戏集（3周）

#### Week 8-9
- [ ] 开发节庆习俗模拟（春节、元宵）
- [ ] 实现物理交互（包饺子、做花灯）
- [ ] 开发民间故事互动剧引擎
- [ ] 实现对话树系统

#### Week 10
- [ ] 开发鲁菜大师养成游戏
- [ ] 实现时间管理系统
- [ ] 添加成就与排行榜

#### 交付物：
- 4-6个民俗小游戏
- 互动故事引擎
- 烹饪模拟游戏

---

### 第五阶段：戏曲文化（2周）

#### Week 11-12
- [ ] 开发脸谱绘制工具
- [ ] 实现AR试妆效果（可选）
- [ ] 开发戏曲知识问答系统
- [ ] 添加戏曲身段模仿（基础版）

#### 交付物：
- 脸谱创作工具
- 知识问答系统
- 戏曲模仿功能

---

## 💰 资源估算

### 开发资源

| 阶段 | 工作量 | 人力需求 | 时间 |
|------|--------|----------|------|
| 基础框架 | 前端开发 | 1人 | 2周 |
| 3D非遗工坊 | 前端+3D设计 | 1-2人 | 3周 |
| 诗词互动 | 前端+后端 | 1人 | 2周 |
| 民俗游戏 | 前端开发 | 1-2人 | 3周 |
| 戏曲文化 | 前端开发 | 1人 | 2周 |
| **总计** | | | **12周** |

### 素材资源

| 类型 | 数量 | 成本估算 |
|------|------|----------|
| 3D模型（葫芦、道具） | 5-8个 | 500-1000积分 |
| 2D素材（纹样、图标） | 50-100个 | 200-500积分 |
| 音效与音乐 | 20-30个 | 免费素材库 |
| **总计** | | **700-1500积分** |

### 技术依赖

**已有（无需新增）：**
- Three.js ✓
- GSAP ✓
- Canvas API ✓
- Web Audio API ✓

**可选新增：**
- TensorFlow.js（姿态估计，可选）
- MediaPipe（面部识别，可选）
- WebXR（AR功能，可选）

---

## 🎯 成功指标

### 用户参与度
- 日活跃用户数（DAU）
- 平均游戏时长（目标：>5分钟）
- 游戏完成率（目标：>30%）
- 回访率（次日留存 >40%）

### 教育效果
- 知识问答正确率提升
- 非遗工艺步骤记忆测试
- 诗词背诵数量增长

### 技术性能
- 页面加载时间 <3秒
- 3D渲染帧率 >30fps
- 移动端适配完成度 100%

---

## 🔍 风险与应对

### 技术风险

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 3D模型性能问题 | 低端设备卡顿 | LOD系统、模型简化、性能检测降级 |
| 移动端兼容性 | 部分功能不可用 | 响应式设计、触摸优化、功能降级 |
| LLM API调用成本 | 成本超预算 | 本地缓存、限制调用频率、备用方案 |

### 内容风险

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 文化准确性争议 | 用户投诉 | 专家审核、注明出处、用户反馈机制 |
| 素材版权问题 | 法律风险 | 原创素材、正版授权、AI生成 |
| 内容更新滞后 | 用户流失 | 定期更新、用户贡献机制 |

---

## 📚 相关资源

### 项目内参考
- `display-v2/src/composables/useGlbScene.js` - 3D场景管理
- `display-v2/src/composables/useCraftProcess.js` - 工艺流程控制
- `display-v2/src/components/InkPlaceholder.vue` - 水墨占位图
- `display-v2/src/config/culturalCategories.js` - 文化分类配置

### 外部资源
- [Three.js 文档](https://threejs.org/docs/)
- [GSAP 动画库](https://gsap.com/docs/)
- [Web Speech API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Speech_API)
- [Canvas API 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)

---

## ✅ 下一步行动

### 立即执行
1. **确认优先级**：选择1-2个游戏方案作为MVP
2. **素材准备**：开始制作3D模型和2D素材
3. **技术验证**：实现一个最小可行原型（葫芦雕刻）

### 近期规划
1. 创建游戏模块基础架构
2. 实现第一个完整游戏（建议：葫芦雕刻）
3. 用户测试与反馈收集

### 长期规划
1. 完成全部5个游戏模块
2. 建立内容更新机制
3. 探索商业化可能（成就系统、虚拟商品）

---

**文档版本**：v1.0  
**创建日期**：2026年8月24日  
**作者**：Claude Code  
**审核状态**：待审核