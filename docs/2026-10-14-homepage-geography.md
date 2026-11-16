# 首页地理图与参考风格调整

日期：2026-10-14。状态：本地实现与验收，未提交或部署。

## 呈现方式

采用用户提供的首页参考图作为视觉方向：左侧深褐大字与印章、右侧青绿立体山水、金色黄河、纸面与雾气留白。宽屏下九城胜迹排列成一条卡片带；体验入口改成圆形小景与简短说明。较小屏幕保持多行卡片与上下图文结构。

地图仍为北朝上的区域示意。九市标注采用城市中心，并非沿河的站点；保留原来的城市探索链接和三维沙盘入口。

## 图像与地理层分开

- 地貌插画：内置 imagegen 生成，`display-v2/public/media/inkwash/atlas/river-geography-v4.webp`，1536×1024，约 275 KiB。地貌高度、树木、村落、细流水系等为艺术表现，不是实测地形。
- 河道：沿用仓库 `promo-film/v2/data/yellow-river-source.extract.geojson` 的连续下游段，210 个源节点。同一投影下以金色 SVG 线叠加，缩放时保持位置。没有把九市中心连成河道，没有用平滑曲线改动源折线。
- 九市中心：沿用 `sjg-datav/src/assets/shandong.json` 的 `properties.center`，由 `display-v2/src/config/atlasGeography.js` 投影到同一画布；2026-10-14 下载 DataV 响应，与仓库数据逐值一致。
- 底图保留 3:2 原始比例。城市标注、河道与图片共用一个舞台。
- 原始 `river-landscape-v2.webp` 保留，可用于回退。

坐标参考范围：东经 114.45°～120.3°，北纬 34.65°～38.35°；采用参考纬度 36.5° 的等距柱状区域投影，四周保留留白。控制图见 [首页地理控制图](assets/homepage-geography-guide.png)。

## 来源与适用范围

- [Natural Earth 河流资料](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/)：1:1000 万概化河道，`10m` 不代表 10 米精度；源资料与处理方式详见 [既有地图来源说明](../promo-film/v2/data/sources.md)。
- [Natural Earth 陆地与海岸资料](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/)：用于制作出图控制图，约束渤海与山东沿海的大致形状；最终海岸仍为 AI 插画。
- [DataV 山东地市资料](https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json)：用于九市中心标注。源文件未声明坐标系、比例尺或许可，不把与 Natural Earth 的组合叠加当作高精度测绘资料。
- [山东地情档案《黄河志》沿黄地区](https://shandong-chorography.org/database/g0/section/10/article/10/)：沿黄市域与城区位置是不同概念，例如济宁的梁山、泰安的东平、德州的齐河属沿黄地区；因此城市中心无需落在河道上。

河流终点标为「黄河三角洲」，不称「当前精确入海口」。页面「图示说明」可展开上述主要来源和简短解释。插画不进入 AI 文献证据检索。

## 最终选定的出图提示词

使用内置 imagegen。输入 1 是用户的首页参考图，仅取绘画风格；输入 2 是依据河道、海岸与城市坐标绘制的控制图。先生成参考风格插画，再去掉模型绘制的主河道，由页面叠加源数据河道。

### 参考风格插画

```text
Use case: scientific-educational. Produce ONLY a standalone hero illustration for a Chinese literary travel website, 1536×1024 horizontal 3:2. Image 1 is the USER'S VISUAL STYLE AND COMPOSITION REFERENCE: borrow its exquisite bright mineral-green Chinese ink-watercolor relief terrain, lustrous golden river, soft misty ivory fades, delicate semi-three-dimensional miniature-landscape quality and elegant breathing space. Do NOT copy any website UI, letters, cards, compass, titles or layout text from image 1. Image 2 is the HARD GEOGRAPHIC CONTROL GUIDE for north-up western/central Shandong: coastline and Yellow River must stay at the SAME normalized pixel coordinates and remain the SAME shape as image 2. Do NOT adopt the fictional geography of image 1. Remove every word and red dot from image 2. The artwork should read as a lovely slightly raised paper landscape painted in fine Chinese shanshui brushwork, rather than a flat heavily detailed farmland diagram. Keep the geographical plan-view unchanged; add relief by shading and vertical ridges, never rotate/skew the whole map. West and north are FLAT low plains and gently textured fields with generous pale ivory space, especially left third and upper inland half; absolutely NO dramatic mountains there. The central/southern hills cluster only around x680-1130, y510-790, with compact Tai Shan just north of Taian at x720 y560. Here use expressive miniature moss-green and emerald crags, delicate trees, soft ink contours and mist, slightly elevated but not Himalayas. The gold river follows the reference guide from southwest x265 y875 past west/north of the central hill cluster toward northeast x1090 y190. It is the focal continuous gold ribbon, 10-16 pixels wide, with no connections through city centers. Flat delta reeds and wetlands around northeast endpoint; muted turquoise Bohai Sea in upper right and Yellow Sea on lower right follow the EXACT guide coastline. Plain land and pale mist fade softly into warm ivory near outer edges, as in image 1. Avoid dense grids of villages, busy extra rivers or roads; small details are sparse. No text, no labels, no dots, no city symbols, no numbers, no frame, no compass, no cropped UI, no legend, no artificial rectangular island outline, no floating fantasy land bridge. Preserve the entire geographic extent and 3:2 canvas, no zoom or crop.
```

### 分离主河道

```text
Use case: precise-object-edit. Remove ONLY the continuous bright GOLDEN YELLOW river ribbon and its thin dark banks running from lower-left to upper-right from this illustration. Replace that narrow ribbon with matching pale ivory flat plain / soft mist terrain so there is NO golden river line or river-bed trace. Also remove the long golden spur of that same river near its upper right endpoint, blending it naturally into the nearby wetland color. The actual geospatial river will be drawn exactly over this artwork by the website, so leave no competing main river. Preserve ALL other pixels and structures as faithfully as possible: the lovely luminous emerald miniature central mountains, plain fields, sparse trees, soft mist and white breathing space, coastline geometry, BOTH blue sea areas and their wave texture, existing tiny fine blue streams (these may remain), canvas size 1536×1024 and the north-up layout. Do not move mountains, coast, islands or any land mass. Do not redraw the entire map, add any new elements, crop, zoom, rotate or change color treatment. No text, symbols, labels or UI.
```

提示词中的位置保留要求是给生成模型的约束，并非对最终插画精度的保证。代码中的城市点、主河道才是确定的坐标层。

## 验收

新增测试核对九市中心与既有源数据一致、北朝上相对方位、210 个河道节点投影无增删。浏览器检查城市标签、图示说明、跳转和响应式布局；截图与尺寸报告保存在 `.local/atlas-geography/`，不提交构建产物或本地会话数据。
