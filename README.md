# Figma REST MCP Server

本项目提供一个 stdio MCP Server，通过 Figma REST API 读取设计稿数据，并把完整快照缓存到本机用户目录。

## 接入流程

1. 创建 Figma Personal Access Token

在 Figma 主页进入：

```text
Settings -> Security -> Personal access tokens -> Generate new token
```

权限建议：

- `file_content:read`：必选，用于读取设计稿文件和节点内容。
- `file_comments:read`：可选，只有需要 AI 读取评论、备注、交互说明时再勾选。

2. 全局安装 MCP 包

```bash
npm i -g figma-rest-mcp-server
```

也可以使用 pnpm：

```bash
pnpm add -g figma-rest-mcp-server
```

3. 写入 Figma PAT

```bash
figma-rest-mcp auth
```

默认写入：

```text
~/.figma-rest-mcp-server/auth.json
```

`auth.json` 是本机明文凭据文件，不能提交、不能共享。

4. 查看运行路径

```bash
figma-rest-mcp paths
```

默认路径：

```text
~/.figma-rest-mcp-server/auth.json
~/.figma-rest-mcp-server/.figma-cache
```

这样在其他项目里使用 `figma_rest` MCP 时，不会在那个项目下创建或访问 `.figma-cache`。

5. 注册到 Codex

```bash
codex mcp add figma_rest -- figma-rest-mcp serve
```

注册后重启 Codex App 或开启新会话。

在新会话中即可调用：

```text
读取这个 Figma 链接：xxx 的布局和样式信息
```

6. 清空缓存

```bash
figma-rest-mcp cache:clear
```

该命令只会删除并重建 `~/.figma-rest-mcp-server/.figma-cache`，不会删除 `auth.json`。

## 本地开发

```bash
pnpm install
pnpm build
pnpm cli auth
pnpm cli paths
pnpm cli cache:clear
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
## 原理介绍

见 `./原理介绍.md`。
