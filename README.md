# Figma REST MCP Server

本项目提供一个 stdio MCP Server，通过 Figma REST API 读取设计稿数据，并把完整快照缓存到本机用户目录。

## 安装

公开包安装方式：

```bash
npm i -g figma-rest-mcp-server
```

也可以使用 pnpm：

```bash
pnpm add -g figma-rest-mcp-server
```

## 认证

不要使用 `.env` 文件。全局安装后，本项目从用户主目录下的 `auth.json` 读取 Figma Personal Access Token：

```text
~/.figma-rest-mcp-server/auth.json
```

推荐使用交互式命令生成或更新 `auth.json`，避免 token 进入 shell history：

```bash
figma-rest-mcp auth
```

也可以手动创建：

```json
{
  "figmaPat": "<你的Figma Personal Access Token>"
}
```

`auth.json` 是本机明文凭据文件，不能提交、不能共享。

## 注册到 Codex

```bash
codex mcp add figma_rest -- figma-rest-mcp serve
```

注册后重启 Codex App 或开启新会话。

## 运行路径

查看当前 auth 和缓存路径：

```bash
figma-rest-mcp paths
```

默认路径：

```text
~/.figma-rest-mcp-server/auth.json
~/.figma-rest-mcp-server/.figma-cache
```

这样在其他项目里使用 `figma_rest` MCP 时，不会在那个项目下创建或访问 `.figma-cache`。

## 本地开发

```bash
pnpm install
pnpm build
pnpm cli auth
pnpm cli paths
pnpm cli serve
```

开发期也可以继续使用：

```bash
pnpm figma:pat
```

## 发布

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm pack --dry-run
npm publish
```

## 设计稿示例

```text
https://www.figma.com/design/Lxci9PlOEhEnJ7D0EJLm5e/%E8%B6%A3%E6%B0%AA8?node-id=1974-7822&m=dev
```

解析结果：

- file key: `Lxci9PlOEhEnJ7D0EJLm5e`
- node id: `1974:7822`

## 接入流程

见 `./接入流程.md`。

## 原理介绍

见 `./原理介绍.md`。
