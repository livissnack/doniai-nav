#!/bin/sh
# 备份上传目录与 JSON 数据（在 server 目录下执行）
set -e
cd "$(dirname "$0")/.."
STAMP=$(date +%Y%m%d-%H%M%S)
OUT="backups/doniai-nav-data-${STAMP}.tar.gz"
mkdir -p backups data/uploads

FILES="data/uploads"
for f in auth_users.json private_nav_store.json notes_store.json monitor_store.json data_cache.json private_nav_default.json; do
  [ -f "$f" ] && FILES="$FILES $f"
done

tar -czf "$OUT" $FILES
echo "已备份: $OUT ($(du -h "$OUT" | cut -f1))"
