# Figma REST MCP Server

本项目提供一个本地 stdio MCP Server，通过 Figma REST API 读取设计稿数据，并把完整快照缓存到本项目的 `.figma-cache` 中。

## 认证

不要使用 `.env` 文件。把 Figma Personal Access Token 写入 macOS Keychain：

```bash
security add-generic-password -a figma-pat -s figma-mcp-server -w "<你的Figma Personal Access Token>" -U
```

读取参数固定为：

- service: `figma-mcp-server`
- account: `figma-pat`

## 构建

```bash
pnpm install
pnpm build
```

## 注册到 Codex

```bash
codex mcp add figma_rest -- node /Users/huangyansen/Desktop/我的/AI-demo/figma-server/dist/index.js
```

默认缓存目录固定为：

```text
{ figma-rest-mcp-server 项目路径}/.figma-cache
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
