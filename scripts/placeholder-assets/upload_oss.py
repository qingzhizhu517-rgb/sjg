#!/usr/bin/env python3
"""印章占位补图 · 批量上传 OSS（按原路径写入 + public-read + HEAD 回执）

用法:
  upload_oss.py <manifest.json> [--dry-run]

manifest.json: [{"localFile": "...", "ossKey": "images/poets/xxx_anime.webp"}, ...]

为什么不用 POST /api/admin/upload：
  OssService.java:97 的 objectName = directory + "/" + UUID + ext 会强制重命名，
  破坏「本地 public/ 相对路径 == OSS 对象键」的同构约定，导致 DB 引用对不上。
"""
import json
import os
import sys

import oss2

ENDPOINT = "oss-cn-beijing.aliyuncs.com"
BUCKET = "shandong-lit-landscape"


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    manifest_path = sys.argv[1]
    dry = "--dry-run" in sys.argv

    manifest = json.load(open(manifest_path, encoding="utf-8"))
    print(f"清单: {manifest_path}  条目数: {len(manifest)}")

    ak = os.environ.get("OSS_ACCESS_KEY_ID")
    sk = os.environ.get("OSS_ACCESS_KEY_SECRET")
    if not ak or not sk:
        raise SystemExit("缺少 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET 环境变量")

    # 绕过系统代理（本机代理会导致对 OSS 的 TLS 握手失败，curl 返 000）
    for var in ("http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "all_proxy"):
        os.environ.pop(var, None)

    missing = [m for m in manifest if not os.path.isfile(m["localFile"])]
    if missing:
        raise SystemExit("本地文件缺失:\n" + "\n".join(m["localFile"] for m in missing))

    if dry:
        for m in manifest:
            print(f"[dry-run] {m['localFile']} -> oss://{BUCKET}/{m['ossKey']}")
        return

    auth = oss2.Auth(ak, sk)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET)

    for m in manifest:
        with open(m["localFile"], "rb") as fh:
            bucket.put_object(
                m["ossKey"], fh,
                headers={
                    "x-oss-object-acl": "public-read",
                    "Content-Type": "image/webp",
                    "Cache-Control": "public, max-age=31536000",
                },
            )
        status = bucket.head_object(m["ossKey"]).status
        url = f"https://{BUCKET}.{ENDPOINT}/{m['ossKey']}"
        print(f"{status}  {os.path.getsize(m['localFile']) / 1024:6.1f} KB  {url}")


if __name__ == "__main__":
    main()
