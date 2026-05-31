# SJG 数字人文平台 - 数据接口设计文档 (API Interfaces)

本文档整理并规范了 **展示端 (display-frontend)** 和 **管理端 (admin-frontend)** 开发所需的全部数据接口，包括公开展示接口、后台管理接口以及核心实体数据结构设计。

---

## 1. 核心实体数据结构 (Core Entities)

### 1.1 景点 (ScenicSpot)
| 属性名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `id` | Long | 景点唯一标识 | `1` |
| `name` | String | 景点名称 | `"泰山"` |
| `description` | String | 景点描述 | `"五岳之首，位于山东省泰安市"` |
| `longitude` | BigDecimal | 经度 | `117.129000` |
| `latitude` | BigDecimal | 纬度 | `36.254000` |
| `address` | String | 详细地址 | `"山东省泰安市泰山区"` |
| `imageUrl` | String | 真实风格图片URL | `"/images/spots/taishan_real.jpg"` |
| `imageAnimeUrl` | String | 动漫水墨风格图片URL | `"/images/spots/taishan_anime.jpg"` |
| `region` | String | 所属区域（城市） | `"泰安"` |

### 1.2 诗人 (Poet)
| 属性名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `id` | Long | 诗人唯一标识 | `1` |
| `name` | String | 姓名 | `"李白"` |
| `dynastyId` | Long | 所属朝代ID | `1` |
| `birthYear` | Integer | 出生年份 | `701` |
| `deathYear` | Integer | 逝世年份 | `762` |
| `birthplace` | String | 出生地 | `"陇西成纪"` |
| `biography` | String | 简介 | `"唐代伟大的浪漫主义诗人"` |
| `avatarUrl` | String | 真实风格头像 | `"/images/poets/li_bai_real.jpg"` |
| `avatarAnimeUrl` | String | 动漫水墨风格头像 | `"/images/poets/li_bai_anime.jpg"` |
| `style` | String | 诗词风格风格（如：浪漫主义、豪放派）| `"浪漫主义"` |

### 1.3 诗词 (Poem)
| 属性名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `id` | Long | 诗词唯一标识 | `1` |
| `title` | String | 标题 | `"望岳"` |
| `content` | String | 内容 | `"岱宗夫如何？齐鲁青未了。..."` |
| `poetId` | Long | 作者（诗人）ID | `2` |
| `dynastyId` | Long | 所属朝代ID | `1` |
| `spotId` | Long | 关联景点ID | `1` |
| `annotation` | String | 注释 | `"岱宗：泰山别名..."` |
| `background` | String | 创作背景 | `"杜甫科举落第后游历齐鲁所作"` |
| `audioUrl` | String | 朗读音频文件URL | `"/audios/wangyue.mp3"` |
| `videoUrl` | String | 关联视频/赏析URL | `"/videos/wangyue.mp4"` |
| `sentimentTags` | String | 情感标签，以逗号分隔 | `"豪放,壮志,自然"` |

### 1.4 朝代 (Dynasty)
| 属性名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `id` | Long | 朝代唯一标识 | `1` |
| `name` | String | 朝代名称 | `"唐朝"` |
| `startYear` | Integer | 起始年份 | `618` |
| `endYear` | Integer | 结束年份 | `907` |
| `description` | String | 朝代描述 | `"中国历史上最繁荣的朝代之一"` |

### 1.5 历史事件 (Event)
| 属性名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `id` | Long | 事件唯一标识 | `1` |
| `title` | String | 事件标题 | `"安史之乱"` |
| `description` | String | 事件详情 | `"唐朝由盛转衰的转折点"` |
| `dynastyId` | Long | 所属朝代ID | `1` |
| `year` | Integer | 发生年份 | `755` |
| `significance` | String | 历史意义/影响 | `"导致唐朝国力衰微，藩镇割据"` |
| `imageUrl` | String | 历史画卷URL | `"/images/events/anshiluan.jpg"` |

---

## 2. 公开展示端接口 (Public Frontend APIs)
无需登录鉴权，基础路径为 `/api/public`。

### 2.1 景点相关 (Spots)

#### 2.1.1 分页查询景点列表
* **请求方法**：`GET`
* **请求路径**：`/api/public/spots`
* **请求参数**：
  * `page` (int, 选填, 默认 1): 当前页码
  * `size` (int, 选填, 默认 20): 每页数量
  * `region` (String, 选填): 区域筛选（如“济南”、“泰安”）
* **响应结构**：
  ```json
  {
    "total": 10,
    "records": [
      {
        "id": 1,
        "name": "趵突泉",
        "address": "山东省济南市历下区",
        "imageUrl": "...",
        "imageAnimeUrl": "...",
        "region": "济南",
        "longitude": 117.012,
        "latitude": 36.661,
        "poemCount": 5
      }
    ]
  }
  ```

#### 2.1.2 查询景点详情（含关联诗词）
* **请求方法**：`GET`
* **请求路径**：`/api/public/spots/{id}`
* **响应结构**：
  ```json
  {
    "spot": {
      "id": 1,
      "name": "趵突泉",
      "description": "...",
      "longitude": 117.012,
      "latitude": 36.661,
      "address": "...",
      "imageUrl": "...",
      "imageAnimeUrl": "...",
      "region": "济南"
    },
    "poems": [
      {
        "id": 1,
        "title": "趵突泉",
        "content": "...",
        "poetId": 5,
        "dynastyId": 3,
        "spotId": 1,
        "sentimentTags": "清幽,平淡"
      }
    ]
  }
  ```

#### 2.1.3 获取所有区域及景点统计
* **请求方法**：`GET`
* **请求路径**：`/api/public/spots/regions`
* **响应结构**：
  ```json
  [
    { "name": "菏泽", "spotCount": 1 },
    { "name": "济宁", "spotCount": 1 },
    { "name": "泰安", "spotCount": 5 },
    { "name": "济南", "spotCount": 2 }
  ]
  ```

### 2.2 诗人相关 (Poets)

#### 2.2.1 分页查询/搜索诗人列表
* **请求方法**：`GET`
* **请求路径**：`/api/public/poets`
* **请求参数**：
  * `page` (int, 选填, 默认 1)
  * `size` (int, 选填, 默认 20)
  * `keyword` (String, 选填): 按诗人名称模糊匹配
* **响应结构**：
  ```json
  {
    "total": 6,
    "records": [
      {
        "id": 1,
        "name": "李白",
        "dynastyId": 1,
        "birthYear": 701,
        "deathYear": 762,
        "birthplace": "陇西成纪",
        "biography": "...",
        "avatarUrl": "...",
        "avatarAnimeUrl": "...",
        "style": "浪漫主义"
      }
    ]
  }
  ```

#### 2.2.2 根据ID查询诗人详情
* **请求方法**：`GET`
* **请求路径**：`/api/public/poets/{id}`
* **响应结构**：
  ```json
  {
    "poet": {
      "id": 1,
      "name": "李白",
      "biography": "...",
      "avatarUrl": "...",
      "avatarAnimeUrl": "...",
      "style": "..."
    },
    "dynasty": {
      "id": 1,
      "name": "唐朝",
      "startYear": 618,
      "endYear": 907
    },
    "poems": [
      {
        "id": 10,
        "title": "将进酒",
        "content": "..."
      }
    ]
  }
  ```

### 2.3 诗词相关 (Poems)

#### 2.3.1 搜索/分页查询诗词列表
* **请求方法**：`GET`
* **请求路径**：`/api/public/poems`
* **请求参数**：
  * `page` (int, 默认 1)
  * `size` (int, 默认 20)
  * `keyword` (String, 选填): 按诗词标题模糊匹配
* **响应结构**：
  ```json
  {
    "total": 12,
    "records": [
      {
        "id": 1,
        "title": "望岳",
        "content": "...",
        "poetId": 2,
        "spotId": 1
      }
    ]
  }
  ```

#### 2.3.2 获取诗词详情（含作者、朝代、景点）
* **请求方法**：`GET`
* **请求路径**：`/api/public/poems/{id}`
* **响应结构**：
  ```json
  {
    "poem": {
      "id": 1,
      "title": "望岳",
      "content": "...",
      "poetId": 2,
      "dynastyId": 1,
      "spotId": 1,
      "annotation": "...",
      "background": "...",
      "audioUrl": "...",
      "videoUrl": "...",
      "sentimentTags": "豪放,壮志"
    },
    "poet": {
      "id": 2,
      "name": "杜甫",
      "avatarUrl": "..."
    },
    "dynasty": {
      "id": 1,
      "name": "唐朝"
    },
    "spot": {
      "id": 1,
      "name": "泰山"
    }
  }
  ```

### 2.4 历史时间线 (Timeline)

#### 2.4.1 获取按朝代分组的历史时间线
* **请求方法**：`GET`
* **请求路径**：`/api/public/timeline`
* **响应结构**：
  ```json
  [
    {
      "dynasty": {
        "id": 1,
        "name": "唐朝",
        "startYear": 618,
        "endYear": 907
      },
      "events": [
        {
          "id": 1,
          "title": "安史之乱",
          "year": 755,
          "significance": "..."
        }
      ],
      "poets": [
        {
          "id": 1,
          "name": "李白"
        }
      ],
      "poems": [
        {
          "id": 1,
          "title": "静夜思"
        }
      ]
    }
  ]
  ```

---

## 3. 后台管理接口 (Admin CRUD APIs)
需要 `Authorization: Bearer <token>` 凭证。基础路径为 `/api/admin`。

### 3.1 登录与权限 (Auth)
* **登录接口** (`POST /api/auth/login`)
  * 入参：`{"username": "admin", "password": "..."}`
  * 回参：`{"token": "eyJhbG...", "user": {...}}`
* **退出登录** (`POST /api/auth/logout`)
* **获取当前登录用户信息** (`GET /api/auth/info`)

### 3.2 景点管理 (Spots)
* `GET /api/admin/spots` (分页、模糊搜索、区域筛选)
* `GET /api/admin/spots/{id}` (单条查询)
* `POST /api/admin/spots` (创建)
* `PUT /api/admin/spots/{id}` (修改)
* `DELETE /api/admin/spots/{id}` (删除)

### 3.3 诗人管理 (Poets)
* `GET /api/admin/poets` (分页、模糊搜索)
* `GET /api/admin/poets/{id}` (单条查询)
* `POST /api/admin/poets` (创建)
* `PUT /api/admin/poets/{id}` (修改)
* `DELETE /api/admin/poets/{id}` (删除)

### 3.4 诗词管理 (Poems)
* `GET /api/admin/poems` (分页、模糊搜索)
* `GET /api/admin/poems/{id}` (单条查询)
* `POST /api/admin/poems` (创建)
* `PUT /api/admin/poems/{id}` (修改)
* `DELETE /api/admin/poems/{id}` (删除)

### 3.5 历史事件管理 (Events)
* `GET /api/admin/events` (分页、朝代筛选)
* `GET /api/admin/events/{id}` (单条查询)
* `POST /api/admin/events` (创建)
* `PUT /api/admin/events/{id}` (修改)
* `DELETE /api/admin/events/{id}` (删除)

### 3.6 文件上传 (Upload)
* `POST /api/admin/upload` (上传图片/视频/音频，返回文件访问URL)
  * 请求格式：`multipart/form-data`
  * 字段：`file: File`
  * 响应：`{"url": "http://localhost:8080/uploads/..."}`
