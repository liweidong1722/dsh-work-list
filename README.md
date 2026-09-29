# DSH 工作清单

一个本地优先的 DSH Web 侧边栏工作清单插件，面向“像记笔记一样管理待办”的使用方式。

## 功能

- 在 DSH Web 侧边栏注册「工作清单」，打开即可使用。
- 内置「日常 / 工作 / 学习 / 生活」分类，也支持自定义分类。
- 支持勾选完成、待完成/已完成筛选和清空已完成事项。
- 每个事项都可以作为轻量富文本笔记继续编辑。
- 支持标题、加粗、斜体、下划线、删除线、文字颜色、编号列表、项目符号、多级缩进和虚线分隔。
- 支持多行内容，`Ctrl+Enter` 保存；`Ctrl+Z` 撤销，`Ctrl+Shift+Z` / `Ctrl+Y` 重做。
- 支持字号与字体样式调整。
- 优先使用 DSH 的 `--dsw-alias-*` 主题变量，并实时跟随明暗主题。

## 数据存储

数据由 DSH host 保存到：

```text
~/.dsh/work-list.json
```

文件为普通 JSON，可以直接备份、迁移和恢复。插件首次升级时会尝试把旧版浏览器 `localStorage` 数据迁移到该文件。

保存接口带 revision 冲突检查：如果文件在页面外被修改或重新导入，旧页面不能直接覆盖新数据。

## 项目结构

```text
src/
├── index.ts                 # DSH host RPC 与文件持久化
└── client/
    ├── index.tsx            # DSH 侧边栏/主面板注册
    ├── WorkListPanel.tsx    # 主界面与交互
    ├── model.mjs            # 清单数据模型
    ├── model.d.mts          # 模型类型声明
    ├── rpc.ts               # 浏览器与 host RPC
    ├── richText.ts          # 富文本清洗与转换
    ├── styles.ts            # 页面样式
    └── theme.ts             # DSH 明暗主题检测
test/
└── model.test.mjs
```

## 开发

要求 Node.js 22.19+ 或 24+，包管理器使用 pnpm。

```sh
pnpm install
pnpm check
```

单独执行：

```sh
pnpm typecheck
pnpm test
pnpm build
```

构建产物输出到 `lib/`，该目录不提交到 Git。

## 本地接入 DSH

插件通过 `cordis.patch.yml` 声明 bundle，并在客户端注册 `main` 和 `sidebar.panellist` slot。

开发时可以将本包以本地 `link:` 方式加入 DSH Web profile。修改源码后重新执行：

```sh
pnpm build
```

然后重启 `dsh web` 并刷新页面。

## 当前状态

项目仍处于早期迭代阶段，数据格式目前为 version 1。升级数据结构时应优先保持对现有 `~/.dsh/work-list.json` 的兼容。

## License

本项目采用 [MIT License](./LICENSE) 开源许可。
