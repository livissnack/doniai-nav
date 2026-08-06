#!/bin/sh
# 为 Alpine 容器编译静态/ musl 二进制（需: apk add musl-dev 或本机已装 musl-tools）
set -e
cd "$(dirname "$0")/.."
rustup target add x86_64-unknown-linux-musl 2>/dev/null || true
cargo build --release --target x86_64-unknown-linux-musl
cp -f target/x86_64-unknown-linux-musl/release/doniai_nav_api ./doniai_nav_api
chmod +x ./doniai_nav_api
echo "已生成 (musl): $(pwd)/doniai_nav_api"
file ./doniai_nav_api
