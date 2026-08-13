# 东昌葫芦雕刻 GLB 模型生成指南

> 目标文件：`dongchang-hulu.glb`（DRACO 压缩，< 8MB）
> 放置路径：`display-v2/public/media/crafts/dongchang-hulu.glb`

---

## 1. 资产概览

共需 **10 个命名部件**，组成一个完整的葫芦雕刻工作台场景：

| 编号 | 节点名 | 内容 | 尺寸参考 | 运动 |
|---|---|---|---|---|
| 1 | `scene_base` | 木质工作台/底座 | 40×30×5 cm | 静止 |
| 2 | `gourd_raw` | 带青皮的生葫芦 | 高25cm, 径15cm | 旋转展示 |
| 3 | `gourd_body` | 去皮白瓤葫芦（主件） | 高25cm, 径15cm | 自转 |
| 4 | `peel_strips` | 青皮条 ×2~3 片 | 长8~12cm | 下落+淡出 |
| 5 | `pattern_draft` | 墨线画稿层（半透明纹样贴合葫芦表面） | 同葫芦 | 淡入 |
| 6 | `carved_layer` | 雕刻完成层（浮雕/镂空纹样） | 同葫芦 | 淡入替换 |
| 7 | `knife_rest` | 刻刀·静置位（平放在台面） | 刀长15cm | — |
| 8 | `knife_action` | 刻刀·雕刻位（悬于葫芦上方） | 同上 | 往复运动 |
| 9 | `painted_layer` | 上色完成层（红绿黄彩绘纹样） | 同葫芦 | 淡入 |
| 10 | `scene_prop_dish` | 颜料碟（可选） | 径8cm | 静止 |

---

## 2. 整体场景提示词（推荐：Meshy / Tripo3D / Rodin）

### 中文提示词

```
一个中国传统葫芦雕刻工作台场景，微缩模型风格。

中央是一个木质圆形底座（直径约30cm），底座上放着一个亚腰葫芦（高约25cm），葫芦表面有精美的浮雕纹样，题材为花鸟鱼虫和吉祥图案。

底座旁边放着一把中国传统雕刻刻刀（长约15cm），刀柄为木制，刀头为金属。旁边还有一个小陶瓷颜料碟，里面有红、绿、黄三色颜料。

风格：写实，PBR材质，干净的工作室光照。模型原点在底座中心，Y轴向上。所有部件独立建模，不要焊接在一起。

纹样参考：中国传统葫芦雕刻工艺，山东省聊城市东昌府区的国家级非物质文化遗产——东昌葫芦雕刻。常见题材包括牡丹、鲤鱼、仙鹤、祥云等吉祥图案。
```

### English Prompt (for international tools)

```
A traditional Chinese gourd carving workshop diorama, photorealistic PBR style.

Center: a round wooden base (30cm diameter) with a Chinese bottle gourd (25cm tall) placed on it. The gourd surface has delicate relief carvings depicting flowers, birds, fish, and auspicious patterns.

Next to the base: a traditional Chinese carving knife (15cm long) with wooden handle and metal blade. A small ceramic paint dish with red, green, and yellow pigments.

Style: Photorealistic, PBR materials, clean studio lighting. Origin at base center, Y-up. All parts must be separate mesh objects, not welded.

Pattern reference: Dongchang gourd carving, a national intangible cultural heritage from Liaocheng, Shandong Province, China. Common motifs include peonies, koi fish, cranes, and auspicious clouds.
```

---

## 3. 分部件提示词（适用：逐件生成后组合）

如需单独生成各部件再在 Blender 中组合，以下为每个部件的独立提示词：

### 3.1 scene_base — 工作台底座

```
一个圆形木质底座/展示台，中国传统工艺风格。
尺寸：直径30cm，高5cm，表面光滑有轻微木纹。
颜色：深棕色硬木（紫檀或红木色调）。
底部略微内收，有简单的倒角边缘。
PBR材质，哑光木纹纹理。
```

### 3.2 gourd_raw — 带皮生葫芦

```
一个完整的中国亚腰葫芦，带青绿色表皮，未去皮状态。
高约25cm，上小下大，中间有天然束腰。
表面有细微的纹理和自然斑点，青绿色到浅绿的渐变。
顶部有一小段干枯的藤蔓茎。
PBR材质，哑光表面。
```

### 3.3 gourd_body — 去皮葫芦本体

```
一个去皮后的中国亚腰葫芦，表面光滑呈象牙白色。
高约25cm，上小下大，中间束腰。
表面光滑细腻，有轻微的自然纹理，呈米白色到浅黄色。
顶部有一小段干枯的藤蔓茎。
PBR材质，略带光泽的光滑表面。
```

### 3.4 peel_strips — 青皮条（2-3片）

```
2-3片弯曲的葫芦青皮条，从葫芦上刮下来的表皮。
每片长约8-12cm，宽约1.5-2cm，薄而弯曲。
颜色：外侧青绿色，内侧浅黄白色。
自然卷曲状态，像削苹果皮一样的长条。
PBR材质。
```

### 3.5 pattern_draft — 墨线画稿层

```
一个半透明的纹样层，模拟在葫芦表面用墨线描绘的画稿。
形状：与葫芦表面贴合的薄壳（偏移1mm）。
纹样：中国传统花鸟图案的线稿，包含牡丹花、祥云、飞鸟的轮廓线条。
颜色：深灰色/墨色线条，背景透明度约70%。
线条粗细有变化，模拟毛笔或铅笔描绘效果。
PBR材质，需要alpha透明通道。
```

### 3.6 carved_layer — 雕刻完成层

```
一个浮雕/浅镂空的纹样层，模拟葫芦雕刻完成后的效果。
形状：与葫芦表面贴合的薄壳，纹样有0.5-2mm的浮雕凸起。
纹样：中国传统吉祥图案——牡丹花（主体）、鲤鱼、祥云、回纹边饰。
技法：浅浮雕为主，部分镂空（如花瓣边缘）。
颜色：象牙白色（与葫芦本体同色），通过光影表现立体感。
PBR材质，光滑表面。
```

### 3.7 knife_rest — 刻刀（静置位）

```
一把中国传统葫芦雕刻刻刀，平放在工作台上。
总长约15cm：木制刀柄（长10cm，深棕色）+ 金属刀头（长5cm，银色）。
刀头为斜口平刀形状，刀刃锋利。
姿态：水平放置，刀头朝右。
PBR材质，金属部分有轻微反射。
```

### 3.8 knife_action — 刻刀（雕刻位）

```
一把中国传统葫芦雕刻刻刀，呈雕刻姿态（悬于葫芦表面）。
总长约15cm：木制刀柄（长10cm，深棕色）+ 金属刀头（长5cm，银色）。
刀头为斜口平刀形状，刀刃锋利。
姿态：与水平面成约30度角，刀头接触葫芦表面。
PBR材质，金属部分有轻微反射。
```

### 3.9 painted_layer — 上色完成层

```
一个彩绘纹样层，模拟葫芦雕刻上色后的效果。
形状：与葫芦表面贴合的薄壳。
纹样与carved_layer相同，但增加了色彩：
- 牡丹花：朱砂红色（#C4463A）
- 叶子：青绿色（#5B8C5A）
- 祥云：金黄色（#C5A55A）
- 边饰：深红色勾边
色彩鲜艳但不失雅致，传统中国配色。
PBR材质，略带光泽。
```

### 3.10 scene_prop_dish — 颜料碟

```
一个小圆形陶瓷颜料碟，中国传统风格。
直径约8cm，高约2cm，浅碟形状。
白色瓷胎，碟内分隔为3个小格，分别有红、绿、黄色颜料残留。
边缘有一圈简单的青花装饰线。
PBR材质，陶瓷光泽。
```

---

## 4. Blender 后处理脚本

AI 生成的模型需要在 Blender 中重命名部件并导出。以下是自动化脚本：

### 4.1 导入并重命名（Blender Python）

```python
# blender_rename_parts.py
# 在 Blender 中运行：Edit > Preferences > Install 安装此脚本，或直接在 Scripting 标签页粘贴执行

import bpy

# 部件映射表：AI 生成的默认名 → 目标名
# 根据实际生成结果调整左侧名称
PART_MAP = {
    # scene_base
    'Cube': 'scene_base',
    'base': 'scene_base',
    'table': 'scene_base',
    'workbench': 'scene_base',
    
    # gourd_raw
    'gourd_raw': 'gourd_raw',
    'bottle_gourd': 'gourd_raw',
    'gourd': 'gourd_raw',
    
    # gourd_body
    'gourd_body': 'gourd_body',
    'gourd_peeled': 'gourd_body',
    
    # peel_strips
    'peel': 'peel_strips',
    'skin': 'peel_strips',
    'strip': 'peel_strips',
    'peel_strip': 'peel_strips',
    
    # pattern_draft
    'pattern': 'pattern_draft',
    'draft': 'pattern_draft',
    'sketch': 'pattern_draft',
    'line_drawing': 'pattern_draft',
    
    # carved_layer
    'carved': 'carved_layer',
    'relief': 'carved_layer',
    'engraving': 'carved_layer',
    'carving': 'carved_layer',
    
    # knife_rest
    'knife': 'knife_rest',
    'knife_rest': 'knife_rest',
    'tool': 'knife_rest',
    
    # knife_action
    'knife_action': 'knife_action',
    'knife_carving': 'knife_action',
    'knife_active': 'knife_action',
    
    # painted_layer
    'painted': 'painted_layer',
    'painted_gourd': 'painted_layer',
    'color': 'painted_layer',
    'colored': 'painted_layer',
    
    # scene_prop_dish
    'dish': 'scene_prop_dish',
    'plate': 'scene_prop_dish',
    'paint_dish': 'scene_prop_dish',
    'palette': 'scene_prop_dish',
}

def rename_parts():
    renamed = 0
    for obj in bpy.data.objects:
        lower = obj.name.lower().replace(' ', '_').replace('-', '_')
        for pattern, target in PART_MAP.items():
            if pattern in lower and obj.name != target:
                print(f"  Renaming: {obj.name} → {target}")
                obj.name = target
                renamed += 1
                break
    print(f"\nDone. Renamed {renamed} objects.")
    print("\nCurrent objects:")
    for obj in bpy.data.objects:
        print(f"  {obj.name} ({obj.type})")

rename_parts()
```

### 4.2 导出 GLB（Blender Python）

```python
# blender_export_glb.py

import bpy
import os

output_path = os.path.join(os.path.expanduser("~"),
    "develop/vibecoding/sjg/display-v2/public/media/crafts/dongchang-hulu.glb")

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12,
    export_apply=True,
    export_yup=True,
)

file_size = os.path.getsize(output_path) / (1024 * 1024)
print(f"\nExported: {output_path}")
print(f"File size: {file_size:.2f} MB")
print(f"Target: < 8 MB")
print(f"Status: {'✅ OK' if file_size < 8 else '⚠️ Too large, reduce poly count'}")
```

### 4.3 验证命名（Blender Python）

```python
# blender_validate_parts.py

import bpy

REQUIRED_PARTS = [
    'gourd_raw', 'gourd_body', 'peel_strips',
    'pattern_draft', 'carved_layer',
    'knife_rest', 'knife_action', 'painted_layer',
    'scene_base', 'scene_prop_dish',
]

existing = {obj.name for obj in bpy.data.objects}
missing = [p for p in REQUIRED_PARTS if p not in existing]
extra = [n for n in existing if n not in REQUIRED_PARTS and not n.startswith('scene_prop_')]

print("=== Part Validation ===")
print(f"Required: {len(REQUIRED_PARTS)}")
print(f"Found: {len(REQUIRED_PARTS) - len(missing)}")

if missing:
    print(f"\n❌ Missing parts:")
    for p in missing:
        print(f"  - {p}")
else:
    print("\n✅ All required parts present!")

if extra:
    print(f"\nℹ️ Extra objects (ok if intentional):")
    for n in extra:
        print(f"  - {n}")
```

---

## 5. 验证清单

生成并导出后，逐项检查：

- [ ] 文件名：`dongchang-hulu.glb`
- [ ] 文件大小：< 8MB（DRACO 压缩后）
- [ ] 原点：底座中心，Y 轴向上
- [ ] 比例：葫芦高约 25cm（真实比例）
- [ ] 部件数量：≥ 9 个（不含可选 scene_prop_*）
- [ ] 部件命名：全部匹配 `glbParts.js` 中的 `HULU_PARTS`
- [ ] 材质：PBR 标准（非 baked toon）
- [ ] 纹理：≤ 2K 分辨率
- [ ] Draw call：< 30
- [ ] 放入路径：`display-v2/public/media/crafts/dongchang-hulu.glb`
- [ ] 浏览器加载：`npm run dev` → `/crafts` → 3D 场景正常渲染

### 快速验证命令

```bash
# 检查文件是否存在
ls -lh display-v2/public/media/crafts/dongchang-hulu.glb

# 用 gltf-transform 检查部件命名（需先安装）
npx @gltf-transform/cli inspect display-v2/public/media/crafts/dongchang-hulu.glb
```

---

## 6. 推荐工具与工作流

### 方案 A：Meshy.ai（推荐，质量最高）

1. 访问 https://meshy.ai
2. 使用「整体场景提示词」生成 → 选择「PBR」材质模式
3. 下载 GLB → 在 Blender 中按 §4.1 重命名部件
4. 按 §4.2 导出 DRACO 压缩 GLB

### 方案 B：Tripo3D（速度快）

1. 访问 https://tripo3d.ai
2. 上传参考图或输入提示词
3. 下载 GLB → Blender 后处理

### 方案 C：分部件生成 + Blender 组合

1. 用 Meshy/Tripo 逐个生成 §3 中的部件
2. 在 Blender 中导入所有部件
3. 调整位置和比例
4. 按 §4.1 重命名 → §4.2 导出

### 方案 D：手工建模（质量最高但耗时）

1. Blender 手工建模
2. 参考东昌葫芦雕刻实物照片
3. 严格按命名规范组织部件
4. 导出 GLB

---

## 7. 占位模型（临时方案）

如需先跑通管线再等真实资产，可用以下 Blender Python 快速生成占位模型：

```python
# blender_placeholder.py — 生成简易占位模型

import bpy
import math

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# scene_base
bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=0.025, location=(0, 0, 0.0125))
base = bpy.context.active_object
base.name = 'scene_base'

# gourd_raw (green gourd)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, location=(0, 0, 0.15))
raw = bpy.context.active_object
raw.name = 'gourd_raw'
raw.scale = (1, 1, 1.5)
mat_raw = bpy.data.materials.new('gourd_raw_mat')
mat_raw.diffuse_color = (0.3, 0.55, 0.2, 1)
raw.data.materials.append(mat_raw)

# gourd_body (white gourd)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.073, location=(0, 0, 0.15))
body = bpy.context.active_object
body.name = 'gourd_body'
body.scale = (1, 1, 1.5)
mat_body = bpy.data.materials.new('gourd_body_mat')
mat_body.diffuse_color = (0.9, 0.85, 0.75, 1)
body.data.materials.append(mat_body)
body.hide_render = True

# peel_strips
for i in range(3):
    bpy.ops.mesh.primitive_cube_add(size=0.02, location=(0.1 + i*0.03, 0.05, 0.1))
    strip = bpy.context.active_object
    strip.name = f'peel_strips' if i == 0 else f'peel_strips.{i:03d}'
    strip.scale = (1, 0.3, 4)
    mat_strip = bpy.data.materials.new(f'peel_mat_{i}')
    mat_strip.diffuse_color = (0.2, 0.5, 0.15, 1)
    strip.data.materials.append(mat_strip)

# pattern_draft (transparent shell)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.076, location=(0, 0, 0.15))
draft = bpy.context.active_object
draft.name = 'pattern_draft'
draft.scale = (1, 1, 1.5)
mat_draft = bpy.data.materials.new('draft_mat')
mat_draft.diffuse_color = (0.1, 0.1, 0.1, 0.3)
mat_draft.blend_method = 'BLEND' if hasattr(mat_draft, 'blend_method') else None
draft.data.materials.append(mat_draft)
draft.hide_render = True

# carved_layer
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.077, location=(0, 0, 0.15))
carved = bpy.context.active_object
carved.name = 'carved_layer'
carved.scale = (1, 1, 1.5)
mat_carved = bpy.data.materials.new('carved_mat')
mat_carved.diffuse_color = (0.85, 0.8, 0.7, 1)
carved.data.materials.append(mat_carved)
carved.hide_render = True

# painted_layer
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.078, location=(0, 0, 0.15))
painted = bpy.context.active_object
painted.name = 'painted_layer'
painted.scale = (1, 1, 1.5)
mat_painted = bpy.data.materials.new('painted_mat')
mat_painted.diffuse_color = (0.75, 0.2, 0.15, 1)
painted.data.materials.append(mat_painted)
painted.hide_render = True

# knife_rest
bpy.ops.mesh.primitive_cube_add(size=0.01, location=(-0.12, 0, 0.03))
knife = bpy.context.active_object
knife.name = 'knife_rest'
knife.scale = (15, 1, 1)
mat_knife = bpy.data.materials.new('knife_mat')
mat_knife.diffuse_color = (0.6, 0.6, 0.6, 1)
knife.data.materials.append(mat_knife)

# knife_action
bpy.ops.mesh.primitive_cube_add(size=0.01, location=(0, 0, 0.2))
knife_a = bpy.context.active_object
knife_a.name = 'knife_action'
knife_a.scale = (15, 1, 1)
knife_a.rotation_euler = (math.radians(30), 0, 0)
knife_a.data.materials.append(mat_knife)
knife_a.hide_render = True

# scene_prop_dish
bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.01, location=(0.12, 0.08, 0.025))
dish = bpy.context.active_object
dish.name = 'scene_prop_dish'
mat_dish = bpy.data.materials.new('dish_mat')
mat_dish.diffuse_color = (0.9, 0.9, 0.85, 1)
dish.data.materials.append(mat_dish)

print("Placeholder model created. Export with blender_export_glb.py")
```

---

*文档生成时间：2026-08-11*
*关联设计文档：`docs/superpowers/specs/2026-08-10-craft-3d-microgame-design.md` §5*
