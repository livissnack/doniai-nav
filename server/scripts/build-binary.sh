#!/bin/sh
# 在 server 目录编译并复制 doniai_nav_api 到根目录，供 Docker 使用
# 适用: WSL2 Debian、Linux 服务器（glibc）
set -e
cd "$(dirname "$0")/.."

if grep -qi microsoft /proc/version 2>/dev/null; then
  case "$(pwd)" in
    /mnt/*) echo "警告: 项目在 /mnt/ 下，建议在 WSL 家目录如 ~/doniai-nav-api 编译，避免 Docker 读不到文件"; ;;
  esac
fi

cargo build --release
cp -f target/release/doniai_nav_api ./doniai_nav_api
chmod +x ./doniai_nav_api

echo "已生成: $(pwd)/doniai_nav_api"
file ./doniai_nav_api

case "$(file -b ./doniai_nav_api)" in
  *ELF*Linux*) echo "OK: 可用于 debian:bookworm-slim 容器" ;;
  *PE32*|*Windows*) echo "错误: 这是 Windows 程序，请在 WSL 内执行本脚本，不要用 .exe"; exit 1 ;;
  *) echo "请确认在 WSL/Linux 下编译"; ;;
esac
