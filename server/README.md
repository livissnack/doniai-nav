# Doniai Nav API（Rust）

Vue 前端配套的后端服务，提供登录鉴权、云笔记、文件管理、DeepSeek AI、监控与私人导航等接口。

## 本地开发

```bash
cp .env.example .env   # 按需填写 PORT、DEEPSEEK_API_KEY 等
cargo run
```

默认监听 `0.0.0.0:3001`（见 `.env.example`）。前端 `.env.development` 通过 Vite 代理到该端口。

## 目录说明

| 路径 | 是否入库 | 说明 |
|------|----------|------|
| `src/` | ✅ | Rust 源码 |
| `scripts/` | ✅ | 编译 / 备份脚本 |
| `private_nav_default.json` | ✅ | 私人导航默认模板 |
| `data/README.md`、`data/uploads/.gitkeep` | ✅ | 部署与挂载说明 |
| `.env`、`target/`、`data/uploads/*`、各类 `*_store.json` / `data_cache.json` | ❌ | 本地密钥、构建产物与运行时数据 |

本地与 Docker 上传目录统一为 `data/uploads`（勿再使用根目录 `uploads/`）。

## Docker 部署

镜像基于预编译的 Linux 二进制 `doniai_nav_api`（见 `Dockerfile` 与 `scripts/build-binary.sh`）。持久化数据请挂载 `data/`，细节见 [data/README.md](./data/README.md)。
