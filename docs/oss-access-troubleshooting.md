# OSS 访问故障排查（2026-10-09）

> 现象：控制台能打开、桶显示「公共读」，但程序上传失败、浏览器读图 403。
> 实测结论：**是两个互相独立的故障，必须按顺序修**。

---

## 一、现状诊断（2026-10-09 12:11 实测）

### 故障 ① 桶级「阻止公共访问」已生效 —— 匿名读一律 403

```
GET https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/<任意对象>
→ HTTP 403
<Code>AccessDenied</Code>
<Message>You have no right to access this object because of bucket acl.</Message>
<EC>0003-00000001</EC>
```

关键证据：
- **不存在的对象也返回同样的 403**（而非 404）→ 说明是**桶级策略拦截**，不是对象 ACL 问题；
- 桶根路径匿名访问返回 `Anonymous user has no right to access this bucket`（EC `0003-00000002`）；
- 截图里「读写权限 = 公共读」与「**访问 = 文件不可以被公共访问**」并列 —— **后者才是实际生效的**，
  前者只是桶 ACL 的声明值，被「阻止公共访问」策略覆盖。

> ⏱️ **这是新出现的**：今早 10:50 同一批对象匿名读还返回 `200`，
> 12:11 已全部 `403`。阿里云对存量的公共读桶会默认/触发开启「阻止公共访问」。

⚠️ **副作用**：开启后**无法再用 404 判断对象是否存在**（一律 403），
本项目此前那套「逐条 HEAD 探测素材存活」的审计方法会**全体误判**，须等关闭后再用。

### 故障 ② AK 被禁用 —— 所有鉴权操作 403

```
PutObject → 403
<Code>InvalidAccessKeyId</Code>
<Message>The OSS Access Key Id you provided is disabled.</Message>
<EC>0002-00000903</EC>
```

- 当前注入的凭证：`OSS_ACCESS_KEY_ID` = `LTAI5t78…VEWgM`（24 字符）、`OSS_ACCESS_KEY_SECRET`（30 字符）；
- 该 AK 在阿里云侧状态为「**已禁用**」，不是过期、也不是权限不足；
- 因此**上传、列举、改对象 ACL 全部不可用**，与故障 ① 无关（两者互相独立）。

---

## 二、修复顺序（**必须先 ① 后 ②**）

顺序反了会白忙：AK 修好了、权限也给了，但桶级拦截还在，文件传上去照样 403 读不到。

### 第 1 步：关闭「阻止公共访问」

1. 登录阿里云 → **对象存储 OSS** → 左侧 Bucket 列表 → 点击 `shandong-lit-landscape`
2. 左侧菜单 **「权限管理」** → **「阻止公共访问」**（部分控制台版本在
   「基础设置」或「数据安全」下，也可直接点截图里「访问」那一行的**编辑/设置**入口）
3. 将「阻止公共访问」**关闭**（可能要二次确认 + 短信验证）
4. 保持桶「读写权限 = 公共读」不变

**验证**（应在 1 分钟内生效）：
```bash
curl -s -o /dev/null -w '%{http_code}\n' --noproxy '*' \
  "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com/spots/%E9%BB%84%E6%B2%B3%E5%8F%B7%E5%AD%90-%E5%AE%9E%E6%99%AF-01.jpg"
# 期望 200（此前实测为 200 的对象）
```

### 第 2 步：启用或更换 AK

路径：阿里云控制台 → 右上角头像 → **「访问控制 RAM」** → 左侧 **「身份管理 → 用户」**

- **情况 A：找得到持有 `LTAI5t78…VEWgM` 的用户**
  → 进入该用户 → **「认证管理 / 访问密钥」** → 该 AccessKey 显示「已禁用」→ 点击**「启用」**
- **情况 B：找不到（AK 属于其它账号/已被删除/权限被回收）**
  → 新建用户（勾选「OpenAPI 调用访问」）→ 创建 AccessKey → **授权**：
  最小权限建议只给该桶的读写，或直接附 `AliyunOSSFullAccess`（简单但权限偏大）

**密钥怎么给到我**（三选一，按安全性排序）：

| 方式 | 说明 |
|---|---|
| ✅ **推荐** 写入 `~/.zshrc` | 本项目已有先例（`JWT_SECRET`、`LLM_API_KEY` 都在那里），我重启 shell 后即可读；**不进仓库、不进对话记录** |
| ⚠️ 写入本地独立文件 | 例如 `~/.sjg-oss.env`（`chmod 600`），我 `source` 后使用 |
| ❌ 直接贴在对话里 | 会留在聊天记录中，不建议 |

配上后验证：
```bash
/usr/bin/python3 -c "
import os, oss2
for v in ('http_proxy','https_proxy','HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','all_proxy'): os.environ.pop(v, None)
b = oss2.Bucket(oss2.Auth(os.environ['OSS_ACCESS_KEY_ID'], os.environ['OSS_ACCESS_KEY_SECRET']),
                'oss-cn-beijing.aliyuncs.com', 'shandong-lit-landscape')
b.put_object('images/_probe.txt', b'ok', headers={'x-oss-object-acl':'public-read'})
print('写入 OK'); b.delete_object('images/_probe.txt')
"
```

---

## 三、备选路径（暂时不想动 AK）

| 方式 | 是否需要 AK | 说明 |
|---|---|---|
| **OSS 控制台「上传文件 / 上传文件夹」** | ❌ 不需要 | 把 `display-v2/public/images/{poets,spots,cultural}/` 整个文件夹拖上去，**目标前缀必须保持 `images/...`**（对象键与本地相对路径同构）。⚠️ 仍需先完成第 1 步，否则控制台也不允许设 `public-read` |
| `ossutil` 命令行 | ✅ 需要 | 本机未安装，可保留相对路径批量上传 |
| STS 临时令牌 | 部分 | 需要有效的 RAM 用户来签发，绕不开第 2 步 |
| **继续只走本地 `public/`** | ❌ 不需要 | 项目当前 dev 环境就是这样跑的，全绿；只是 P2-M9「上 OSS」一直挂着 |

---

## 四、对项目的影响

| 场景 | 影响 |
|---|---|
| 本机开发（dev） | **无影响**。`display-v2/src/utils/mediaBase.js` 在 dev 恒用本地 `public/`，DB 里的新素材也已写成相对路径 |
| 生产环境（prod） | **严重**。DB 中 313 处 OSS 外链 + `VITE_OSS_BUCKET_URL` 全部会 403，**全站图片挂掉** |
| 素材审计脚本 | 失效。403 掩盖了「存在/不存在」的差异，须等第 1 步完成后再跑 |
| 新增素材上传 | 阻塞。等第 2 步 |

---

## 五、顺带提醒（截图里看到的其它设置）

| 设置 | 现状 | 建议 |
|---|---|---|
| 版本控制 | **开通** | 每覆写一次对象都会留历史版本并**持续计费**。若不需要回滚能力，建议关闭或改用生命周期规则定期清理 |
| 存储冗余类型 | 同城冗余（ZRS） | 单价高于本地冗余（LRS）。毕设项目若在意成本可改；已存数据需新建桶迁移，**改前想清楚** |
| 归档直读 | 未开启 | 不影响，保持即可 |
| 允许的 TLS 版本 | 未设置，全部允许 | 不影响，保持即可 |
