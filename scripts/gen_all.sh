#!/bin/bash
# 批量图片生成 - 直接调用 arkcli，无 Python 子进程问题
# 运行: bash scripts/gen_all.sh
MODEL="doubao-seedream-5.0-lite"
SIZE="2048x2048"
OUT="output/imagegen"
DELAY=310

mkdir -p "$OUT/spots" "$OUT/poets"

log() { echo "[$(date +%H:%M:%S)] $1"; }

gen() {
    local dir="$1" name="$2" prompt="$3"
    local outpath="$OUT/$dir/${name}.jpg"
    if [ -f "$outpath" ] && [ "$(stat -f%z "$outpath" 2>/dev/null || echo 0)" -gt 50000 ]; then
        log "SKIP: $dir/$name (exists)"
        return 0
    fi
    log "START: $dir/$name"
    arkcli +gen --model "$MODEL" --size "$SIZE" --save-to "$OUT/$dir" --no-open "$prompt" 2>&1
    if [ -f "$OUT/$dir/ark-gen.jpeg" ]; then
        mv "$OUT/$dir/ark-gen.jpeg" "$outpath"
        log "OK: $dir/$name ($(du -h "$outpath" | cut -f1))"
    elif [ -f "$OUT/$dir/ark-gen.jpg" ]; then
        mv "$OUT/$dir/ark-gen.jpg" "$outpath"  
        log "OK: $dir/$name ($(du -h "$outpath" | cut -f1))"
    else
        log "FAIL: $dir/$name (no output)"
    fi
}

# ===== Scenic Spots =====
log "===== Scenic Spots (32) ====="
for item in \
  "华不注山|山东济南华不注山实景照片，春秋名山孤峰刺天，自然山水" \
  "华山|山东济南华山古称华不注实景照片，孤峰耸立于黄河南岸" \
  "德州黄河号子|山东德州黄河号子文化表演场景，黄河流域岸边劳动号子" \
  "曲阜阙里|山东曲阜阙里历史文化街区实景，孔子故里古建筑" \
  "文宣王庙|山东曲阜孔庙大成殿红墙黄瓦，中国古代建筑儒家圣地" \
  "济宁太白楼|山东济宁太白楼实景，唐代酒楼李白常饮处文化地标" \
  "济宁南池|山东济宁南池公园实景，古代园林荷花池塘" \
  "京杭大运河济宁段|京杭大运河济宁段实景，古运河河道水乡风光" \
  "兖州城楼|山东兖州城楼遗址实景，古城遗迹历史建筑" \
  "济宁石门山|山东济宁石门山泗水实景，自然山水风光" \
  "济宁浣笔泉|山东济宁浣笔泉实景，历史名泉古典园林" \
  "石佛寺济宁|山东济宁石佛寺实景，佛教寺庙古建筑" \
  "济宁王母阁|山东济宁王母阁南城实景，古建筑楼阁" \
  "济宁南湖|山东济宁南湖实景，城市湖泊公园风光" \
  "东明漆园庄子钓台|山东菏泽东明漆园庄子钓台实景，庄子文化遗址" \
  "东明漆园|山东菏泽东明漆园实景，庄子为吏处历史遗址"; do
    name="${item%%|*}"
    prompt="${item##*|}"
    gen "spots" "$name" "$prompt"
    [ $? -eq 0 ] && [ -f "$outpath" ] || sleep "$DELAY"
done

log "===== Done ====="
ls -la "$OUT/spots/" 2>/dev/null
