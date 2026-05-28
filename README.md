# Figma REST MCP Server

本项目提供一个本地 stdio MCP Server，通过 Figma REST API 读取设计稿数据，并把完整快照缓存到本项目的 `.figma-cache` 中。

## 认证

不要使用 `.env` 文件。本项目从项目根目录的 `auth.json` 读取 Figma Personal Access Token，macOS 和 Windows 都可使用。

推荐使用交互式脚本生成或更新 `auth.json`，避免 token 进入 shell history：

```bash
pnpm figma:pat
```

也可以手动创建：

```json
{
  "figmaPat": "<你的Figma Personal Access Token>"
}
```

`auth.json` 是本地明文凭据文件，已经加入 `.gitignore`，不要提交到 Git。

## 构建

```bash
pnpm install
pnpm build
```

## 注册到 Codex

```bash
codex mcp add figma_rest -- node <你的 figma-rest-mcp-server 目录>/dist/index.js
```

默认缓存目录固定为：

```text
<你的 figma-rest-mcp-server 目录>/.figma-cache
```

这样在其他项目里使用 `figma_rest` mcp 时，会访问该路径读取 `figma-cache`。

## 设计稿

示例链接：

```text
https://www.figma.com/design/Lxci9PlOEhEnJ7D0EJLm5e/%E8%B6%A3%E6%B0%AA8?node-id=1974-7822&m=dev
```

解析结果：

- file key: `Lxci9PlOEhEnJ7D0EJLm5e`
- node id: `1974:7822`
