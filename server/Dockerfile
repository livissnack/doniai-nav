# 使用已编译好的 Linux 二进制（放在 server 目录根下的 doniai_nav_api）
# WSL2 Debian / Linux 服务器: ./scripts/build-binary.sh  （glibc，配本镜像 debian:bookworm-slim）
# 勿用 Alpine 镜像 + WSL 默认 cargo build，否则 exec: no such file or directory
# 编译与 docker compose 须在同一个 WSL 终端、同一路径下执行；勿用 Windows 下的 .exe

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY doniai_nav_api ./doniai_nav_api
COPY private_nav_default.json ./private_nav_default.json

RUN chmod +x ./doniai_nav_api

ENV PORT=3000
EXPOSE 3000

CMD ["/app/doniai_nav_api"]
