#!/usr/bin/env python3
"""匿名 HTTP 上传到 OSS（当桶为「公共读写」且 AK 不可用时使用）。

用法:
  upload_http.py <manifest.json> [--dry-run] [--acl public-read]

manifest.json: [{"localFile": "...", "ossKey": "images/poets/x.webp"}, ...]

要点：
  · 每个对象显式带 `x-oss-object-acl: public-read` —— 这样即便之后把桶 ACL 收回「公共读」，
    这些对象仍然可公开读取（对象级 ACL 保留）。
  · 逐个 PUT 后立即 HEAD 校验，输出 200/非 200 回执，便于对账。
  · ⚠️ 桶处于「公共读写」时，互联网上任何人都能写入本桶，用完请立即收回「公共读」。
"""
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request

ENDPOINT = "https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com"
CT = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".mp4": "video/mp4"}


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    manifest = json.load(open(sys.argv[1], encoding="utf-8"))
    dry = "--dry-run" in sys.argv
    acl = "public-read"
    if "--acl" in sys.argv:
        acl = sys.argv[sys.argv.index("--acl") + 1]

    # 绕过系统代理（本机代理会让对 OSS 的 TLS 握手失败）
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    missing = [m for m in manifest if not os.path.isfile(m["localFile"])]
    if missing:
        raise SystemExit("本地文件缺失:\n" + "\n".join(m["localFile"] for m in missing))

    total = sum(os.path.getsize(m["localFile"]) for m in manifest)
    print(f"清单 {len(manifest)} 个文件 / {total/1024/1024:.1f} MB   ACL={acl}"
          + ("   [dry-run]" if dry else ""))
    if dry:
        for m in manifest:
            print(f"  {os.path.getsize(m['localFile'])/1024:8.1f} KB  {m['ossKey']}")
        return

    ok, bad, sent = 0, [], 0
    t0 = time.time()
    for i, m in enumerate(manifest, 1):
        lp, key = m["localFile"], m["ossKey"]
        ext = os.path.splitext(lp)[1].lower()
        req = urllib.request.Request(
            f"{ENDPOINT}/{key}", data=open(lp, "rb").read(), method="PUT",
            headers={"Content-Type": CT.get(ext, mimetypes.guess_type(lp)[0] or "application/octet-stream"),
                     "x-oss-object-acl": acl,
                     "Cache-Control": "public, max-age=31536000"})
        try:
            with opener.open(req, timeout=120) as r:
                code = r.status
        except urllib.error.HTTPError as e:
            code = e.code
            bad.append((key, f"PUT {code}"))
            print(f"  [{i:>3}/{len(manifest)}] FAIL PUT {code}  {key}")
            continue
        # 立即 HEAD 校验
        try:
            with opener.open(urllib.request.Request(
                    f"{ENDPOINT}/{key}", method="HEAD"), timeout=30) as r:
                hcode = r.status
        except urllib.error.HTTPError as e:
            hcode = e.code
        sent += os.path.getsize(lp)
        if hcode == 200:
            ok += 1
        else:
            bad.append((key, f"HEAD {hcode}"))
        el = time.time() - t0
        print(f"  [{i:>3}/{len(manifest)}] {hcode}  {sent/1024/1024:6.1f}MB "
              f"{sent/1024/1024/max(el,0.01):5.2f}MB/s  {key}")

    print(f"\n完成：成功 {ok}，失败 {len(bad)}，用时 {time.time()-t0:.0f}s")
    for k, why in bad:
        print(f"  ✗ {why}  {k}")
    print(f"\n⚠️ 上传完毕，请把桶的读写权限从「公共读写」收回为「公共读」。"
          f"\n   对象已带 x-oss-object-acl: public-read，收回后仍可公开读取。")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
