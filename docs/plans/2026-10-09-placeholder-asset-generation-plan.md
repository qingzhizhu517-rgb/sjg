# 印章占位补图计划（2026-10-09）

> 目标：为当前**因缺图而回落到「文／景」印章 SVG 占位**的条目，按项目既有双风格管线批量生成配图，
> 落到「本地 `public/` + 阿里云 OSS 同构路径」，并以 migration 回填数据库字段。
>
> 数据源：本机 `sjg01` 库（与 `db-export/sjg01_20260929_210011/sjg01_full.sql` 同源，2026-10-09 实查）

---

## 一、缺口清单（实查口径）

判据：媒体字段为 `NULL` / `''` / `'[]'` 即视为缺图 → 前端 `useImage.js` 回落印章占位。

| 对象 | 字段 | 缺图数 | 总量 | 缺口率 |
|---|---|---|---|---|
| **诗人画像** | `poet.avatar_url` + `poet.avatar_anime_url`（两者全空） | **102** | 129 | 79% |
| | 仅 `avatar_url` 空 | 103 | 129 | 80% |
| | 仅 `avatar_anime_url` 空 | 121 | 129 | 94% |
| **文化条目配图** | `cultural_item.image_url` + `image_anime_url`（两者全空） | **58** | 63 | 92% |
| | `image_url` 空 | 63 | 63 | 100% |
| **景点** | `scenic_spot.image_url` + `image_anime_url`（两者全空） | 2 | 71 | 3% |
| 诗词视频 | `poem.video_url` | 168 | 203 | — |
| 诗词音频 | `poem.audio_url` | 203 | 203 | 100% |

**本期范围：诗人画像 102 + 文化条目配图 58 = 160 张静态图**（景点仅 2 个另计；音视频不在本期）。

### 1.1 待生成清单文件

| 文件 | 内容 |
|---|---|
| `output/2026-10-09-placeholder-fill/poets-missing-avatar.tsv` | 102 位诗人（id / 姓名 / 朝代 / 籍贯） |
| `output/2026-10-09-placeholder-fill/cultural-missing-image.tsv` | 58 条文化条目（id / 标题 / 类别 / 地区 / 状态） |
| `output/2026-10-09-placeholder-fill/poet-plan.json` | 诗人生成计划（含 slug、本地路径、OSS key、目标 URL） |
| `output/2026-10-09-placeholder-fill/cultural-plan.json` | 文化条目生成计划（同上） |
| 本文件附录 A / B | 全量 160 条对照表，便于逐条审阅 |

朝代分布（诗人 102）：清 39 · 明 31 · 隋唐 11 · 元 11 · 宋 8 · 魏晋南北朝 2
类别分布（文化 58）：craft 16 · literature 16 · food_opera 14 · festival 12

---

## 二、命名与路径规范（与 OSS 同构）

沿用 `V25`/`V26` 已确立的**英文 pinyin snake_case** 约定（不沿用旧 UGC 的中文原名命名）：

```
诗人画像   display-v2/public/images/poets/{slug}_anime.webp
           oss://shandong-lit-landscape/images/poets/{slug}_anime.webp
文化配图   display-v2/public/images/cultural/{slug}.webp
           oss://shandong-lit-landscape/images/cultural/{slug}.webp
```

- `slug` = 姓名/条目标题的拼音下划线化；重名自动追加 `_{id}` 消歧（脚本已做冲突检查，160 条无冲突）。
- DB 字段写入**相对路径**（`/images/poets/xxx_anime.webp`），与既有 23 条本地引用形态一致。
  → 开发环境走 `public/`；生产环境由 `VITE_OSS_BUCKET_URL` 做前缀替换即可整体切到 OSS，**零改代码**。
- ⚠️ 文化配图**不带** `_anime` 后缀（与 `bengrou_rice.webp` 等既有文件一致）；
  ⚠️ 但 `buildLocalImageCandidates()`（`imageCandidates.js:14-26`）在水墨主题下会**自动追加** `_anime` 候选，
  因此 `_anime.webp` 与 `{slug}.webp` 两种命名在不同主题下都能命中，命名务必与计划表一致。

---

## 三、生成参数基线

| 项 | 值 | 说明 |
|---|---|---|
| 目标尺寸 | **1024×1536（2:3 竖版）** | 与既有画像 `1086×1448`（3:4）最接近的可选尺寸；生成后裁切缩放至 1086×1448 |
| quality | `high` | 沿用管线基线 |
| 文化配图尺寸 | `1536×1024`（横版）或 `1024×1024`（方形） | 按条目性质二选一，见 §4.2 |
| 生成后处理 | 裁水印 → 缩放 → 转 WebP | 见 §5 |

> ImageGen 输出默认带右下角「AI生成 WORKBUDDY」水印（约底部 8% 高度），**必须裁掉**。

---

## 四、提示词配方

### 4.1 诗人水墨画像（102 张）

**统一风格配方（每条都必须带）**

```
中国水墨人物画，工笔与写意结合，半身像，宣纸肌理，淡墨晕染，
大面积留白，朱砂色印章点缀，人物神态{神态词}，
背景以淡墨{背景元素}点染，画面右侧竖排题写「{姓名}」及一行{朝代}小注，
仿古绢本设色，色调灰褐沉静，无现代元素，无文字水印
```

**按朝代的服饰变量（关键，决定画面可信度）**

| 朝代 | 服饰 / 冠巾 | 背景元素 |
|---|---|---|
| 魏晋南北朝 | 宽袍大袖、幅巾、玄色缘边 | 竹林、山石、清泉 |
| 隋唐 | 幞头、圆领窄袖袍、唐制革带 | 长安宫阙剪影、牡丹、远山 |
| 宋 | 东坡巾 / 直脚幞头、圆领襕衫或文人便袍 | 松枝、溪桥、平远山水 |
| 元 | 交领右衽长袍、笠帽或幞头、窄袖 | 枯木寒林、驼影、塞外远山 |
| 明 | 明制道袍、四方平定巾 / 网巾、宽袖 | 太湖石、芭蕉、书斋 |
| 清 | 清代长衫马褂、瓜皮小帽或暖帽、立领 | 老梅、竹石、庭院 |

**按身份的补充词（可选，用于提升辨识度）**

- 诗人/词人：`手持书卷` 或 `执笔凝思`
- 官员/名臣：`身着朝服，腰束革带，神态端肃`
- 隐逸/布衣：`散发宽衣，神情疏朗`
- 女性词人：`发髻簪钗，披帛垂肩，神情温婉`

**示例（已落地样板，供比对）**：既有 `pu_songling_anime.webp` 为「半身、灰袍、执《聊斋志异》书卷、
右侧竖排题名＋小注＋两方朱印、淡墨古树与云月背景」。**新图必须与之同一风格族**，避免新旧割裂。

### 4.2 文化条目配图（58 张）

**四类模板（按 `category` 选用）**

| 类别 | 数量 | 尺寸 | 提示词骨架 |
|---|---|---|---|
| `craft` 传统技艺 | 16 | 1024×1024 | `{技艺名}制作过程特写，{核心工具与材料}，匠人手部细节，自然侧光，非遗纪实摄影质感，画面简洁无杂乱背景，高画质` |
| `literature` 文学 | 16 | 1536×1024 | `{主题}意境水墨插画，{核心意象}，宣纸肌理，淡墨晕染，大面积留白，朱砂印章点缀，笔触写意，无文字` |
| `food_opera` 饮食戏曲 | 14 | 1536×1024 | `{名称}，{场景描述}，{色彩与光线}，山东地方民俗纪实风格，构图稳重，高画质，无人物特写` |
| `festival` 节庆 | 12 | 1536×1024 | `{节庆名}场景，{核心民俗活动}，{人群远景剪影}，暖色年节氛围，中国民俗摄影，构图讲究，高画质` |

> 注：`culture` 类配图在既有素材中**不加水墨 `_anime` 后缀**，但水墨主题下若需双风格，
> 可另行追加 `{slug}_anime.webp`（本期默认只出 1 张，风格按主题适配）。

---

## 五、生成后处理四步（管线固化）

```bash
# 1) 裁水印（底部 8% 高度）
ffmpeg -y -i in.png -vf "crop=iw:trunc(ih*0.92/2)*2:0:0" step1.png

# 2) 缩放至目标尺寸
sips --resampleHeightWidth 1448 1086 step1.png --out step2.png   # 诗人
sips --resampleHeightWidth 1024 1536 step1.png --out step2.png   # 文化横版

# 3) 转 WebP（质量 82，控制体积）
ffmpeg -y -i step2.png -q:v 82 -c:v libwebp step3.webp

# 4) 目视验收（Read 工具看图，确认无水印残留、风格与既有素材同族）
```

---

## 六、OSS 上传方案

`POST /api/admin/upload` **不可用**（`OssService.java:97` 会把对象 UUID 重命名，破坏路径同构）。
改用 `oss2` 脚本（本机已装 2.19.1）按**原路径**写入并设 `public-read`：

```python
import oss2
auth = oss2.Auth(os.environ["OSS_ACCESS_KEY_ID"], os.environ["OSS_ACCESS_KEY_SECRET"])
bucket = oss2.Bucket(auth, "oss-cn-beijing.aliyuncs.com", "shandong-lit-landscape")
bucket.put_object_from_file(key, local_file, headers={"x-oss-object-acl": "public-read"})
```

- 上传 key = 计划表中的 `ossKey`（= 本地相对路径去掉前导 `/`）。
- 上传后**逐条 HEAD 校验 200**，输出对账报告。
- ⚠️ 本机访问 OSS 必须绕过系统代理（`--noproxy '*'`），否则 TLS 握手失败返 `000`。
- ⚠️ 桶不允许公共列举，**无法反查清单**，只能按计划表逐条校验。

---

## 七、数据库回填

⚠️ 编号：仓库现有迁移已到 **`V30__poet_relation_provenance.sql`**，本计划从 **`V31`** 起编号，
**每一批补图对应一个独立迁移文件**（迁移一经应用不可修改）。

回填 SQL 由 `scripts/placeholder-assets/gen_migration.py` 从补图计划自动生成：

```bash
/Users/a1/.workbuddy/binaries/python/envs/default/bin/python \
  scripts/placeholder-assets/gen_migration.py \
  31 output/2026-10-09-placeholder-fill/samples-backfill.json \
  backend/src/main/resources/db/migration/V31__placeholder_asset_backfill.sql

# 应用（项目未引入 Flyway，用仓库自带脚本手动应用）
DB_PASSWORD="${DB_PASSWORD:?请先配置 DB_PASSWORD}" /usr/bin/python3 \
  scripts/apply_migration.py backend/src/main/resources/db/migration/V31__placeholder_asset_backfill.sql
```

样例（V31 实际内容）：

```sql
-- poet.avatar_anime_url 回填 1 条
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/wang_zhi_huan_anime.webp' WHERE `id` = 133;
-- cultural_item.image_anime_url 回填 1 条
UPDATE `cultural_item` SET `image_anime_url` = '/images/cultural/wei_fang_feng_zheng_zhi_zuo_ji_yi.webp' WHERE `id` = 33;
```

- 一律写 `*_anime_url`（水墨字段），保留 `*_url`（实景字段）不动 —— 与 V25/V26 的既有策略一致。
- 回填脚本可由 `poet-plan.json` / `cultural-plan.json` **自动生成**，避免手写错漏。
- ⚠️ 内容治理约束：本次只改媒体字段，不触碰 `status`，**不触发审核流程**。

---

## 八、验收标准

| 检查项 | 通过条件 |
|---|---|
| 文件落位 | 160 个文件在 `display-v2/public/images/{poets,cultural}/` 存在，命名与计划表一致 |
| 尺寸 | 诗人 1086×1448；文化按 §4.2 |
| 水印 | 目视无「AI生成 WORKBUDDY」残留 |
| OSS | 160 个 key 逐条 HEAD 返回 `200` |
| 前端 | 诗人列表页 / 文化详情页**不再出现印章占位**；`data:image/svg+xml` 占位数为 0 |
| 回归 | `node --test` 全绿；`vite build` 通过；无头截图比对 |

---

## 九、成本与批次划分

图片约 **5–10 积分/张**（按 `sjg-media-assets` 技能基线）：

| 批次 | 内容 | 张数 | 预估积分 |
|---|---|---|---|
| **B0 样张**（建议先做） | 诗人 1 + 文化 1，跑通「生成→裁水印→转WebP→上传OSS→回填」全链路 | 2 | 10–20 |
| B1 | 隋唐 + 宋 + 元 + 魏晋（32 位，牌面最响的名家优先） | 32 | 160–320 |
| B2 | 清（39 位） | 39 | 195–390 |
| B3 | 明（31 位） | 31 | 155–310 |
| B4 | 文化条目 craft + festival（28 条） | 28 | 140–280 |
| B5 | 文化条目 literature + food_opera（30 条） | 30 | 150–300 |
| 合计 | | **162** | **810–1620** |

⚠️ **批量生成前需用户确认**（管线技能明确要求）。另：生图工具**并行调用会撞秒级文件名**且 `output_dir` 不可靠，
**必须串行生成**，否则会静默丢图。

---

<!-- APPENDIX -->

## 十、批次状态

> 积分分配与优先级理由见 **`docs/plans/2026-10-09-credit-allocation.md`**（1000 积分方案）。

| 批次 | 内容 | 张数 | 本地落位 | OSS 上传 | DB 回填 | 状态 |
|---|---|---|---|---|---|---|
| **B0 样张** | 诗人 王之涣(#133) + 文化 潍坊风筝制作技艺(#33) | 2 | ✅ | ✅ | ✅ V31 | 完成 |
| **P1 修破图** | 14 个破图/空图景点 + 2 个复用插画（0 积分） | 16 | ✅ | ✅ | ✅ V32 | 完成 |
| **P2 诗人名家** | 魏晋 2 + 隋唐 10 + 宋 8 + 元 11（+1 返工，另 3 张 v2 重生成） | 35 | ✅ | ✅ | ✅ V33 | 完成 |
| **P3-a 明** | 明代 30 位（#104 佚名按决定跳过） | 30 | ✅ | ✅ | ✅ V34 | 完成 |
| P3-b | 清代 39 位（含康熙 #44 / 乾隆 #47 走帝王配方、#20 浣花按女性词人处理） | 39 | — | — | — | 待执行 |
| P4 | 文化条目 57 条（festival/craft/food_opera/literature） | 57 | — | — | — | 待执行 |
| ~~B-old~~ | ~~城市 hero 9 张（P2-M5）~~ | 0 | — | — | — | **砍掉：目标是死代码，无调用点** |

### P2 产出（2026-10-09）

| 项 | 值 |
|---|---|
| 新增诗人画像 | `public/images/poets/{slug}_anime.webp` × 31（1086×1448） |
| 联络表验收 | `output/2026-10-09-placeholder-fill/contact-sheet-poets-{a,b}.png` |
| 返工 | 萧楚材（首版色调偏亮偏平）重生成 1 张 |
| 回填迁移 | `V33__poet_portrait_backfill_p2.sql`（31 条，已应用） |
| 校验 | 诗人可解析 28 → **59**；景点保持 **71/71** |
| 待确认 | #104 佚名（非人物）、#44 康熙 / #47 乾隆（帝王形制）、#20 浣花（身份不明） |

### P1 产出（2026-10-09）

| 项 | 值 |
|---|---|
| 新增景点图 | `public/images/spots/{slug}_anime.webp` × 14（1536×1024，青绿山水写意） |
| 0 积分复用 | #64 东津渡 → `/media/inkwash/sights/dongying-dongjin.webp`；#71 碣石山 → `binzhou-jieshi.webp` |
| 联络表验收 | `output/2026-10-09-placeholder-fill/contact-sheet-spots.png` |
| 回填迁移 | `V32__spot_asset_repair_backfill.sql`（16 条，已应用） |
| 解析验证 | 16/16 主图可解析，0 破图 0 占位 |

### B0 样张产出

| 项 | 值 |
|---|---|
| 诗人生成图 | `display-v2/public/images/poets/wang_zhi_huan_anime.webp`（1086×1448，186 KB） |
| 文化生成图 | `display-v2/public/images/cultural/wei_fang_feng_zheng_zhi_zuo_ji_yi.webp`（1024×1024，178 KB） |
| 原始图 | `output/2026-10-09-placeholder-fill/_raw/*.png` |
| 回填迁移 | `backend/src/main/resources/db/migration/V31__placeholder_asset_backfill.sql` |
| 解析验证 | 以真实 `imageCandidates.js` 模拟 `useImage.js` 白名单校验 → 两条均命中，印章占位消除 |

**新增工具（可复用于后续批次）**

| 脚本 | 作用 |
|---|---|
| `scripts/placeholder-assets/process.py` | 裁水印（底部 8%）→ cover 缩放居中裁切 → cwebp -q 82 |
| `scripts/placeholder-assets/upload_oss.py` | 按原路径批量上传 OSS + `public-read` + HEAD 回执（绕过 UUID 重命名） |
| `scripts/placeholder-assets/gen_migration.py` | 由补图计划生成回填 migration |
| `output/2026-10-09-placeholder-fill/{poet,cultural}-plan.json` | 命名映射与目标路径（160 条） |

## 十一、当前阻塞：OSS 上传凭证失效

2026-10-09 实测上传返回：

```
403 InvalidAccessKeyId
The OSS Access Key Id you provided is disabled.
OSSAccessKeyId: [REDACTED_ACCESS_KEY_ID]   EC: 0002-00000903
```

- 环境变量 `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` **已注入但该 AK 在阿里云侧处于「禁用」状态**；
- 本机**不存在**其它凭证来源（`~/.ossutilconfig`、`~/.aliyun/config.json` 均无，仓库内无未跟踪的 `.env`）；
- 桶本身正常：既有对象匿名 `HEAD` 仍返回 `200`（bucket 为 `public-read`，读取不需要 AK）。

**解除方式（任一）**：
1. 在阿里云控制台 **RAM 访问控制 → 用户 → 访问密钥** 中启用该 AK；
2. 或生成一对新的 AK/SK，以环境变量 `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` 注入后重跑：
   ```bash
   /usr/bin/python3 scripts/placeholder-assets/upload_oss.py output/2026-10-09-placeholder-fill/manifest-<batch>.json
   ```

凭证就绪后 B0 的 2 个对象可立即补传，后续批次可直接串行生成 → 处理 → 上传一条龙。

---

## 附录 A｜诗人画像 102 条（按朝代分组）

### 隋唐（11 位）

| id | 姓名 | 籍贯 | slug | 目标路径 |
|---|---|---|---|---|
| 34 | 刘长卿 | 宣州宣城（今安徽宣城），郡望河间（今河北献县） | `liu_zhang_qing` | `/images/poets/liu_zhang_qing_anime.webp` |
| 73 | 罗隐 | 新城（今浙江杭州富阳） | `luo_yin` | `/images/poets/luo_yin_anime.webp` |
| 81 | 刘晏 | 曹州南华（今山东菏泽东明） | `liu_yan` | `/images/poets/liu_yan_anime.webp` |
| 82 | 胡曾 | 邵州邵阳（今湖南邵阳） | `hu_ceng` | `/images/poets/hu_ceng_anime.webp` |
| 84 | 裴迪 | 河东（今山西） | `pei_di` | `/images/poets/pei_di_anime.webp` |
| 92 | 韩翃 | 南阳（今河南南阳） | `han_hong` | `/images/poets/han_hong_anime.webp` |
| 101 | 李洞 | 京兆（今陕西西安） | `li_dong` | `/images/poets/li_dong_anime.webp` |
| 106 | 萧楚材 | — | `xiao_chu_cai` | `/images/poets/xiao_chu_cai_anime.webp` |
| 114 | 元稹 | 河南府洛阳（今河南洛阳） | `yuan_zhen` | `/images/poets/yuan_zhen_anime.webp` |
| 133 | 王之涣 | 并州晋阳（今山西太原） | `wang_zhi_huan` | `/images/poets/wang_zhi_huan_anime.webp` |
| 134 | 刘禹锡 | 洛阳（今河南洛阳） | `liu_yu_xi` | `/images/poets/liu_yu_xi_anime.webp` |

### 宋（8 位）

| id | 姓名 | 籍贯 | slug | 目标路径 |
|---|---|---|---|---|
| 23 | 石介 | 兖州奉符（今山东泰安） | `shi_jie` | `/images/poets/shi_jie_anime.webp` |
| 52 | 晁补之 | 济州巨野（今山东巨野） | `chao_bu_zhi` | `/images/poets/chao_bu_zhi_anime.webp` |
| 53 | 许景衡 | 浙江瑞安 | `xu_jing_heng` | `/images/poets/xu_jing_heng_anime.webp` |
| 83 | 杨亿 | 建州浦城（今福建浦城） | `yang_yi` | `/images/poets/yang_yi_anime.webp` |
| 102 | 张咏 | 濮州鄄城（今山东菏泽鄄城） | `zhang_yong` | `/images/poets/zhang_yong_anime.webp` |
| 108 | 陈师道 | 彭城（今江苏徐州） | `chen_shi_dao` | `/images/poets/chen_shi_dao_anime.webp` |
| 118 | 刘克庄 | 兴化军莆田（今福建莆田） | `liu_ke_zhuang` | `/images/poets/liu_ke_zhuang_anime.webp` |
| 132 | 李之仪 | 山东无棣（今滨州无棣县） | `li_zhi_yi` | `/images/poets/li_zhi_yi_anime.webp` |

### 元（11 位）

| id | 姓名 | 籍贯 | slug | 目标路径 |
|---|---|---|---|---|
| 16 | 李泂 | 滕州（今山东滕州） | `li_jiong` | `/images/poets/li_jiong_anime.webp` |
| 35 | 袁桷 | 庆元路鄞县（今浙江宁波） | `yuan_jue` | `/images/poets/yuan_jue_anime.webp` |
| 36 | 吴师道 | 婺州兰溪（今浙江兰溪） | `wu_shi_dao` | `/images/poets/wu_shi_dao_anime.webp` |
| 37 | 萨都剌 | 代州雁门（今山西代县） | `sa_dou_la` | `/images/poets/sa_dou_la_anime.webp` |
| 85 | 李好文 | 大名路东明（今山东东明） | `li_hao_wen` | `/images/poets/li_hao_wen_anime.webp` |
| 95 | 宋褧 | 大都宛平（今北京） | `song_jiong` | `/images/poets/song_jiong_anime.webp` |
| 96 | 乃贤 | 葛逻禄部人，后迁庆元（今浙江宁波） | `nai_xian` | `/images/poets/nai_xian_anime.webp` |
| 109 | 王恽 | 卫州路汲县（今河南卫辉） | `wang_yun` | `/images/poets/wang_yun_anime.webp` |
| 115 | 王冕 | 诸暨（今浙江诸暨） | `wang_mian` | `/images/poets/wang_mian_anime.webp` |
| 116 | 杨维桢 | 会稽诸暨（今浙江绍兴诸暨） | `yang_wei_zhen` | `/images/poets/yang_wei_zhen_anime.webp` |
| 123 | 于钦 | 益都（今山东青州） | `yu_qin` | `/images/poets/yu_qin_anime.webp` |

### 魏晋南北朝（2 位）

| id | 姓名 | 籍贯 | slug | 目标路径 |
|---|---|---|---|---|
| 21 | 陆机 | 吴郡吴县（今江苏苏州） | `lu_ji` | `/images/poets/lu_ji_anime.webp` |
| 22 | 谢道韫 | 陈郡阳夏（今河南太康） | `xie_dao_yun` | `/images/poets/xie_dao_yun_anime.webp` |

### 明（31 位）

| id | 姓名 | 籍贯 | slug | 目标路径 |
|---|---|---|---|---|
| 4 | 晏璧 | — | `yan_bi` | `/images/poets/yan_bi_anime.webp` |
| 24 | 宋濂 | 金华浦江（今浙江浦江） | `song_lian` | `/images/poets/song_lian_anime.webp` |
| 25 | 方孝孺 | 浙江台州府宁海县（今浙江宁海） | `fang_xiao_ru` | `/images/poets/fang_xiao_ru_anime.webp` |
| 26 | 徐文通 | 浙江金华 | `xu_wen_tong` | `/images/poets/xu_wen_tong_anime.webp` |
| 28 | 徐中行 | 浙江长兴（今浙江湖州） | `xu_zhong_hang` | `/images/poets/xu_zhong_hang_anime.webp` |
| 29 | 李化龙 | 河南长垣 | `li_hua_long` | `/images/poets/li_hua_long_anime.webp` |
| 30 | 李中行 | 山东乐安（今广饶） | `li_zhong_hang` | `/images/poets/li_zhong_hang_anime.webp` |
| 39 | 胡广 | 江西吉水 | `hu_guang` | `/images/poets/hu_guang_anime.webp` |
| 40 | 徐祯卿 | 常熟梅李镇，徙居吴县（今江苏苏州） | `xu_zhen_qing` | `/images/poets/xu_zhen_qing_anime.webp` |
| 42 | 高出 | 山东莱阳（今属烟台） | `gao_chu` | `/images/poets/gao_chu_anime.webp` |
| 54 | 陶安 | 太平府当涂（今安徽当涂） | `tao_an` | `/images/poets/tao_an_anime.webp` |
| 55 | 杨巍 | 山东海丰（今滨州无棣） | `yang_wei` | `/images/poets/yang_wei_anime.webp` |
| 56 | 谢榛 | 山东临清（今山东临清） | `xie_zhen` | `/images/poets/xie_zhen_anime.webp` |
| 57 | 杨玉润 | — | `yang_yu_run` | `/images/poets/yang_yu_run_anime.webp` |
| 58 | 王象春 | 山东济南府新城（今淄博桓台） | `wang_xiang_chun` | `/images/poets/wang_xiang_chun_anime.webp` |
| 66 | 陈凤梧 | 江西吉安府泰和 | `chen_feng_wu` | `/images/poets/chen_feng_wu_anime.webp` |
| 67 | 薛瑄 | 山西河津（今山西万荣） | `xue_xuan` | `/images/poets/xue_xuan_anime.webp` |
| 69 | 戴璟 | 浙江宁波府奉化 | `dai_jing` | `/images/poets/dai_jing_anime.webp` |
| 76 | 李如圭 | 湖广岳州府澧州（今湖南澧县） | `li_ru_gui` | `/images/poets/li_ru_gui_anime.webp` |
| 77 | 龚勉 | 直隶常州府无锡（今江苏无锡） | `gong_mian` | `/images/poets/gong_mian_anime.webp` |
| 80 | 殷云霄 | 山东兖州府东平州寿张（今聊城阳谷） | `yin_yun_xiao` | `/images/poets/yin_yun_xiao_anime.webp` |
| 86 | 何景明 | 河南信阳 | `he_jing_ming` | `/images/poets/he_jing_ming_anime.webp` |
| 87 | 陈其猷 | 直隶大名府东明（今山东菏泽东明） | `chen_qi_you` | `/images/poets/chen_qi_you_anime.webp` |
| 88 | 石星 | 直隶大名府东明（今山东菏泽东明） | `shi_xing` | `/images/poets/shi_xing_anime.webp` |
| 89 | 李先芳 | 山东东昌府濮州（今河南范县） | `li_xian_fang` | `/images/poets/li_xian_fang_anime.webp` |
| 97 | 唐之淳 | 越州会稽（今浙江绍兴） | `tang_zhi_chun` | `/images/poets/tang_zhi_chun_anime.webp` |
| 98 | 侯祁 | 山东兖州府郓城县（今山东郓城） | `hou_qi` | `/images/poets/hou_qi_anime.webp` |
| 104 | 佚名 | — | `yi_ming` | `/images/poets/yi_ming_anime.webp` |
| 110 | 何应瑞 | 山东兖州府曹州（今山东菏泽） | `he_ying_rui` | `/images/poets/he_ying_rui_anime.webp` |
| 119 | 吴铠 | 山东阳谷县（今山东聊城阳谷） | `wu_kai` | `/images/poets/wu_kai_anime.webp` |
| 124 | 章忠 | — | `zhang_zhong` | `/images/poets/zhang_zhong_anime.webp` |

### 清（39 位）

| id | 姓名 | 籍贯 | slug | 目标路径 |
|---|---|---|---|---|
| 2 | 黄景仁 | 常州府武进（今江苏常州武进） | `huang_jing_ren` | `/images/poets/huang_jing_ren_anime.webp` |
| 9 | 王昶 | 青浦（今上海青浦） | `wang_chang` | `/images/poets/wang_chang_anime.webp` |
| 10 | 刘藻 | 山东菏泽 | `liu_zao` | `/images/poets/liu_zao_anime.webp` |
| 20 | 浣花 | 山东济南 | `huan_hua` | `/images/poets/huan_hua_anime.webp` |
| 32 | 赵执信 | 山东益都（今山东淄博博山） | `zhao_zhi_xin` | `/images/poets/zhao_zhi_xin_anime.webp` |
| 33 | 魏源 | 湖南邵阳金潭（今湖南隆回） | `wei_yuan` | `/images/poets/wei_yuan_anime.webp` |
| 43 | 秦松龄 | 江苏无锡 | `qin_song_ling` | `/images/poets/qin_song_ling_anime.webp` |
| 44 | 爱新觉罗·玄烨 | 北京紫禁城 | `ai_xin_jue_luo_xuan_ye` | `/images/poets/ai_xin_jue_luo_xuan_ye_anime.webp` |
| 45 | 卢见曾 | 山东德州 | `lu_jian_ceng` | `/images/poets/lu_jian_ceng_anime.webp` |
| 46 | 田致 | — | `tian_zhi` | `/images/poets/tian_zhi_anime.webp` |
| 47 | 爱新觉罗·弘历 | 北京（雍亲王府） | `ai_xin_jue_luo_hong_li` | `/images/poets/ai_xin_jue_luo_hong_li_anime.webp` |
| 49 | 许朝 | — | `xu_chao` | `/images/poets/xu_chao_anime.webp` |
| 50 | 李浃 | 山东德州 | `li_jia` | `/images/poets/li_jia_anime.webp` |
| 59 | 汪琬 | 长洲（今江苏苏州） | `wang_wan` | `/images/poets/wang_wan_anime.webp` |
| 60 | 张衍 | 山东诸城 | `zhang_yan` | `/images/poets/zhang_yan_anime.webp` |
| 61 | 沈廷芳 | 浙江仁和（今杭州） | `shen_ting_fang` | `/images/poets/shen_ting_fang_anime.webp` |
| 62 | 严文典 | 浙江归安（今湖州） | `yan_wen_dian` | `/images/poets/yan_wen_dian_anime.webp` |
| 63 | 张衍重 | 山东无棣 | `zhang_yan_zhong` | `/images/poets/zhang_yan_zhong_anime.webp` |
| 64 | 沈世铨 | — | `shen_shi_quan` | `/images/poets/shen_shi_quan_anime.webp` |
| 70 | 胤禛 | 北京紫禁城 | `yin_zhen` | `/images/poets/yin_zhen_anime.webp` |
| 74 | 蒙建华 | 山东济宁 | `meng_jian_hua` | `/images/poets/meng_jian_hua_anime.webp` |
| 75 | 郑守生 | 山东济宁 | `zheng_shou_sheng` | `/images/poets/zheng_shou_sheng_anime.webp` |
| 78 | 杭世骏 | 仁和（今浙江杭州） | `hang_shi_jun` | `/images/poets/hang_shi_jun_anime.webp` |
| 79 | 徐金铭 | 山东历城（今济南） | `xu_jin_ming` | `/images/poets/xu_jin_ming_anime.webp` |
| 90 | 杨应标 | — | `yang_ying_biao` | `/images/poets/yang_ying_biao_anime.webp` |
| 91 | 范通 | — | `fan_tong` | `/images/poets/fan_tong_anime.webp` |
| 99 | 陈良谟 | — | `chen_liang_mo` | `/images/poets/chen_liang_mo_anime.webp` |
| 100 | 张锷 | — | `zhang_e` | `/images/poets/zhang_e_anime.webp` |
| 111 | 王曰高 | 山东东昌府茌平县（今山东聊城茌平） | `wang_yue_gao` | `/images/poets/wang_yue_gao_anime.webp` |
| 112 | 刘大绅 | 云南宁州（今云南华宁） | `liu_da_shen` | `/images/poets/liu_da_shen_anime.webp` |
| 117 | 张问陶 | 四川遂宁（今四川遂宁蓬溪） | `zhang_wen_tao` | `/images/poets/zhang_wen_tao_anime.webp` |
| 120 | 陈廷敬 | 山西泽州府阳城（今山西晋城阳城） | `chen_ting_jing` | `/images/poets/chen_ting_jing_anime.webp` |
| 121 | 陈仁德 | 四川重庆 | `chen_ren_de` | `/images/poets/chen_ren_de_anime.webp` |
| 125 | 刘学渤 | — | `liu_xue_bo` | `/images/poets/liu_xue_bo_anime.webp` |
| 126 | 张本大 | — | `zhang_ben_da` | `/images/poets/zhang_ben_da_anime.webp` |
| 127 | 汤朝槭 | — | `tang_chao_qi` | `/images/poets/tang_chao_qi_anime.webp` |
| 128 | 狄培 | — | `di_pei` | `/images/poets/di_pei_anime.webp` |
| 129 | 施闰章 | 江南宁国府宣城（今安徽宣城） | `shi_run_zhang` | `/images/poets/shi_run_zhang_anime.webp` |
| 130 | 金天羽 | 江苏吴江 | `jin_tian_yu` | `/images/poets/jin_tian_yu_anime.webp` |

## 附录 B｜文化条目配图 58 条（按类别分组）

### 传统技艺（16 条）

| id | 标题 | 地区 | 状态 | 目标路径 |
|---|---|---|---|---|
| 33 | 潍坊风筝制作技艺 | 潍坊 | published | `/images/cultural/wei_fang_feng_zheng_zhi_zuo_ji_yi.webp` |
| 34 | 淄博陶瓷烧制技艺 | 淄博 | published | `/images/cultural/zi_bo_tao_ci_shao_zhi_ji_yi.webp` |
| 35 | 东昌葫芦雕刻 | 聊城 | published | `/images/cultural/dong_chang_hu_lu_diao_ke.webp` |
| 36 | 鲁绣 | 济南 | published | `/images/cultural/lu_xiu.webp` |
| 37 | 杨家埠木版年画 | 潍坊 | published | `/images/cultural/yang_jia_bu_mu_ban_nian_hua.webp` |
| 38 | 济南皮影戏 | 济南 | published | `/images/cultural/ji_nan_pi_ying_xi.webp` |
| 79 | 曲阜楷木雕刻（木雕·曲阜楷木雕刻） | 济宁 | published | `/images/cultural/qu_fu_kai_mu_diao_ke.webp` |
| 80 | 嘉祥石雕（石雕·嘉祥石雕） | 济宁 | published | `/images/cultural/jia_xiang_shi_diao.webp` |
| 81 | 泰山玉雕刻（石雕·泰山玉雕刻） | 泰安 | published | `/images/cultural/tai_shan_yu_diao_ke.webp` |
| 82 | 肥城桃木雕刻 | 泰安 | published | `/images/cultural/fei_cheng_tao_mu_diao_ke.webp` |
| 83 | 德州黑陶烧制技艺（陶器烧制技艺·德州黑陶烧制技艺） | 德州 | published | `/images/cultural/de_zhou_hei_tao_shao_zhi_ji_yi.webp` |
| 84 | 蟋蟀罐传统制作技艺（宁津） | 德州 | published | `/images/cultural/xi_shuai_guan_chuan_tong_zhi_zuo_ji_yi.webp` |
| 85 | 泥塑（惠民泥塑） | 滨州 | published | `/images/cultural/ni_su.webp` |
| 86 | 柳编（博兴柳编） | 滨州 | published | `/images/cultural/liu_bian.webp` |
| 87 | 毛笔制作技艺（广饶齐笔制作技艺） | 东营 | published | `/images/cultural/mao_bi_zhi_zuo_ji_yi.webp` |
| 88 | 黄河口芦苇画 | 东营 | published | `/images/cultural/huang_he_kou_lu_wei_hua.webp` |

### 文学（16 条）

| id | 标题 | 地区 | 状态 | 目标路径 |
|---|---|---|---|---|
| 39 | 孟姜女传说 | 泰安 | published | `/images/cultural/meng_jiang_nv_chuan_shuo.webp` |
| 40 | 梁祝传说 | 济宁 | published | `/images/cultural/liang_zhu_chuan_shuo.webp` |
| 41 | 泰山传说 | 泰安 | published | `/images/cultural/tai_shan_chuan_shuo.webp` |
| 42 | 运河传说 | 聊城 | published | `/images/cultural/yun_he_chuan_shuo.webp` |
| 43 | 黄河号子 | 东营 | published | `/images/cultural/huang_he_hao_zi.webp` |
| 44 | 孔融让梨 | 济宁 | published | `/images/cultural/kong_rong_rang_li.webp` |
| 67 | 尧的传说（鄄城谷林） | 菏泽 | published | `/images/cultural/yao_de_chuan_shuo.webp` |
| 68 | 麒麟传说 | 菏泽 | published | `/images/cultural/qi_lin_chuan_shuo.webp` |
| 69 | 大舜传说 | 济南 | published | `/images/cultural/da_shun_chuan_shuo.webp` |
| 70 | 闵子骞传说 | 济南 | published | `/images/cultural/min_zi_qian_chuan_shuo.webp` |
| 71 | 东方朔传说 | 德州 | published | `/images/cultural/dong_fang_shuo_chuan_shuo.webp` |
| 72 | 四女寺的传说 | 德州 | published | `/images/cultural/si_nv_si_de_chuan_shuo.webp` |
| 73 | 孟姜女传说（淄博） | 淄博 | published | `/images/cultural/meng_jiang_nv_chuan_shuo_73.webp` |
| 74 | 牛郎织女传说（沂源） | 淄博 | published | `/images/cultural/niu_lang_zhi_nv_chuan_shuo.webp` |
| 75 | 董永传说 | 滨州 | published | `/images/cultural/dong_yong_chuan_shuo.webp` |
| 76 | 丈八佛传说 | 滨州 | published | `/images/cultural/zhang_ba_fu_chuan_shuo.webp` |

### 饮食戏曲（14 条）

| id | 标题 | 地区 | 状态 | 目标路径 |
|---|---|---|---|---|
| 45 | 鲁菜 | 济南 | published | `/images/cultural/lu_cai.webp` |
| 46 | 德州扒鸡 | 德州 | published | `/images/cultural/de_zhou_pa_ji.webp` |
| 47 | 周村烧饼 | 淄博 | published | `/images/cultural/zhou_cun_shao_bing.webp` |
| 48 | 煎饼卷大葱 | 临沂 | published | `/images/cultural/jian_bing_juan_da_cong.webp` |
| 49 | 吕剧 | 东营 | published | `/images/cultural/lv_ju.webp` |
| 50 | 山东快书 | 济南 | published | `/images/cultural/shan_dong_kuai_shu.webp` |
| 51 | 柳子戏 | 菏泽 | published | `/images/cultural/liu_zi_xi.webp` |
| 91 | 四平调（金乡四平调） | 济宁 | published | `/images/cultural/si_ping_diao.webp` |
| 92 | 泰山豆腐宴 | 泰安 | published | `/images/cultural/tai_shan_dou_fu_yan.webp` |
| 93 | 山东梆子（泰安） | 泰安 | published | `/images/cultural/shan_dong_bang_zi.webp` |
| 94 | 临清什香面 | 聊城 | published | `/images/cultural/lin_qing_shen_xiang_mian.webp` |
| 95 | 聊城八角鼓 | 聊城 | published | `/images/cultural/liao_cheng_ba_jiao_gu.webp` |
| 96 | 滨州锅子饼 | 滨州 | published | `/images/cultural/bin_zhou_guo_zi_bing.webp` |
| 97 | 沾化渔鼓戏 | 滨州 | published | `/images/cultural/zhan_hua_yu_gu_xi.webp` |

### 节庆（12 条）

| id | 标题 | 地区 | 状态 | 目标路径 |
|---|---|---|---|---|
| 54 | 泰山东岳庙会 | 泰安 | published | `/images/cultural/tai_shan_dong_yue_miao_hui.webp` |
| 55 | 临清庙会（古运河庙会） | 聊城 | published | `/images/cultural/lin_qing_miao_hui.webp` |
| 56 | 临清驾鼓（新春社火锣鼓） | 聊城 | published | `/images/cultural/lin_qing_jia_gu.webp` |
| 57 | 趵突泉迎春花灯会 | 济南 | published | `/images/cultural/bao_tu_quan_ying_chun_hua_deng_hui.webp` |
| 58 | 千佛山重阳山会（千佛山庙会） | 济南 | published | `/images/cultural/qian_fo_shan_chong_yang_shan_hui.webp` |
| 59 | 中国乐陵金丝小枣文化旅游节 | 德州 | published | `/images/cultural/zhong_guo_le_ling_jin_si_xiao_zao_wen_hua_lv_you_jie.webp` |
| 60 | 宁津蟋蟀文化节（暨杂技古会） | 德州 | published | `/images/cultural/ning_jin_xi_shuai_wen_hua_jie.webp` |
| 61 | 齐文化节（临淄） | 淄博 | published | `/images/cultural/qi_wen_hua_jie.webp` |
| 62 | 淄博国际聊斋文化旅游节（聊斋文化节） | 淄博 | published | `/images/cultural/zi_bo_guo_ji_liao_zhai_wen_hua_lv_you_jie.webp` |
| 63 | 惠民胡集书会 | 滨州 | published | `/images/cultural/hui_min_hu_ji_shu_hui.webp` |
| 64 | 黄河口开渔节 | 东营 | published | `/images/cultural/huang_he_kou_kai_yu_jie.webp` |
| 65 | 中国孙子文化旅游节（广饶） | 东营 | published | `/images/cultural/zhong_guo_sun_zi_wen_hua_lv_you_jie.webp` |

## 附录 C｜复现命令

```bash
# 重新导出缺口清单并生成命名映射
/Users/a1/.workbuddy/binaries/python/envs/default/bin/python /tmp/sjg_plan_build.py
# 逐条 HEAD 校验 OSS 对象
curl -s -o /dev/null -w '%{http_code}\n' --noproxy '*' "<ossUrl>"
```
