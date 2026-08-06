# 持久化数据目录

部署时 **务必** 将本目录挂载进容器，重建镜像/容器不会删除这里的文件。

| 路径 | 容器内 | 说明 |
|------|--------|------|
| `data/uploads/` | `/app/uploads` | 用户上传的文件（按用户 ID 分子目录） |
| 项目根目录 `*.json` | `/app/*.json` | 账号、私人导航、笔记、监控等 |

## 编译 API 二进制（WSL2 Debian / Linux）

**WSL2 可以**，且与当前 Docker 镜像 `debian:bookworm-slim` 匹配（都是 glibc）。注意：

1. **编译和 `docker compose` 都在同一个 WSL 终端里做**（不要只在资源管理器里拷文件）。
2. 项目尽量放在 WSL 路径，例如 `~/doniai-nav-api`，少用 `/mnt/d/...`（避免 Docker 构建上下文异常）。
3. 不要用 Windows 里编出来的 `.exe` 改名为 `doniai_nav_api`。

```bash
# 在 WSL2 Debian 里
cd ~/doniai-nav-api   # 或你的 server 目录
./scripts/build-binary.sh
# 必须看到: ELF 64-bit ... GNU/Linux

docker compose build --no-cache
docker compose up -d
docker logs -f doniai-nav-api-api-1
# 应出现 Listening on 0.0.0.0:3000
```

上传到远程 Linux 服务器时：连同 `doniai_nav_api`、`docker-compose.yml`、`Dockerfile`、各 `*.json`、`data/` 一起传，在服务器上再 `docker compose up -d`（无需在服务器装 Rust）。

若仍 `exec: no such file or directory`：确认已拉取最新 `Dockerfile`（**debian**，不是 alpine），并 `file doniai_nav_api` 不是 PE32/Windows。

## 首次部署

```bash
cd ~/doniai-nav-api
./scripts/build-binary.sh
mkdir -p data/uploads

# 若本地曾用过根目录 ./uploads，请迁移到统一路径：
# mkdir -p data/uploads
# cp -a uploads/. data/uploads/ 2>/dev/null || true
# rm -rf uploads
```

上传目录统一为 **`data/uploads`**（代码默认 `UPLOAD_ROOT=data/uploads`）。Docker 将宿主机 `./data/uploads` 挂到容器 `/app/uploads`。
## 备份（建议定期执行）

```bash
./scripts/backup-data.sh
```

备份包在 `backups/` 下，含 `uploads` 与所有 `*.json`。

## 恢复

```bash
tar -xzf backups/doniai-nav-data-YYYYMMDD-HHMMSS.tar.gz -C .
docker compose restart api
```
