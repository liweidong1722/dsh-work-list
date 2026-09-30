# DSH 工作清单

一个本地优先、支持富文本编辑的 DSH Web 侧边栏工作清单插件。

当前版本：**0.1.2**

## 🆕 v0.1.2 更新

相比 v0.1.1：

- 去掉新增事项输入框左侧多余的 `＋` 图标，界面更简洁。
- 富文本工具栏改为吸顶显示，长清单向下滚动时仍可直接使用编辑功能。
- 字体、字号增减和字体样式选择并入富文本工具栏，滚动时也始终可用。

完整变更：https://github.com/liweidong1722/dsh-work-list/compare/v0.1.1...v0.1.2

## 🆕 v0.1.1 更新

相比 v0.1.0：

- 新增事项折叠 / 展开，默认只显示标题，点击正文即可直接编辑。
- 新增同分类拖拽排序，以及支持还原、永久删除和清空的回收站。
- 新增事项搜索、JSON 导入 / 导出，并让新增事项也支持完整富文本编辑。
- 优化全局富文本工具栏、分类新增 / 删除，以及导入导出和保存状态的布局。
- 修复编辑退出、完成事项操作等交互细节，减少误操作和界面干扰。

完整变更：https://github.com/liweidong1722/dsh-work-list/compare/0.1.0...v0.1.1

## 安装

### 推荐：通过 DSH 插件通道安装

```bash
dsh plugin --profile web add github:liweidong1722/dsh-work-list#v0.1.2
```

安装完成后重启 `dsh web` 并刷新页面，左侧会出现 **「工作清单」**。

安装最新版 `main`：

```bash
dsh plugin --profile web add github:liweidong1722/dsh-work-list#main
```

卸载：

```bash
dsh plugin --profile web remove dsh-work-list
```

DSH 的 `plugin add` 会调用 pnpm 完成依赖安装，并根据本包声明的
`dsh.bundle.patch` 自动把插件加入对应 profile 的 bundle 列表。

### 直接使用 pnpm 下载

包中已经包含构建好的 `lib/`，因此无需在安装机上重新编译：

```bash
pnpm add github:liweidong1722/dsh-work-list#v0.1.2
```

这种方式适合验证包内容或在其他工程中作为依赖使用。
如果是安装到 DSH profile，推荐使用上面的 `dsh plugin --profile ... add`，
因为它还会负责 bundle 的自动激活。

## 功能

- DSH Web 左侧栏直接提供「工作清单」。
- 内置「日常 / 工作 / 学习 / 生活」分类，也支持自定义分类。
- 支持勾选完成、待完成 / 已完成筛选、回收站还原与永久删除。
- 每条事项都可以继续作为轻量富文本笔记编辑。
- 支持正文、标题 1 / 2 / 3、加粗、斜体、下划线、删除线和文字颜色。
- 支持编号列表、项目符号、多级缩进和虚线分隔。
- 标题使用醒目的黄色，正文跟随 DSH 当前明暗主题。
- 支持多行输入，`Ctrl+Enter` 保存。
- 支持 `Ctrl+Z` 撤销，`Ctrl+Shift+Z` / `Ctrl+Y` 重做。
- 点击编辑器外部会自动保存并退出编辑。
- 支持字号和字体样式调整。
- 优先使用 DSH 的 `--dsw-alias-*` 主题变量，并实时跟随明暗主题。

## 数据存储

数据由 DSH host 保存到：

```text
~/.dsh/work-list.json
```

文件是普通 JSON，可以直接备份、迁移和恢复。

插件带 revision 冲突保护：如果文件在页面外被重新导入或修改，
旧页面不能再用过期状态把新数据覆盖掉。

旧版浏览器 `localStorage` 数据会在首次升级时尝试迁移到该文件。

## 开发

要求：

- Node.js 22.19+ 或 24+
- pnpm

```bash
pnpm install
pnpm check
```

常用命令：

```bash
pnpm typecheck
pnpm test
pnpm build
```

`pnpm build` 生成：

```text
lib/index.js
lib/client.js
```

`lib/` 会随版本一起提交和发布，使 GitHub/pnpm 安装无需在目标机器上重新构建。
## 项目结构

```text
src/
├── index.ts                 # DSH host RPC 与文件持久化
└── client/
    ├── index.tsx            # DSH 侧边栏 / 主面板注册
    ├── WorkListPanel.tsx    # 主界面与交互
    ├── model.mjs            # 清单数据模型
    ├── model.d.mts          # 模型类型声明
    ├── rpc.ts               # 浏览器与 host RPC
    ├── richText.ts          # 富文本清洗与转换
    ├── styles.ts            # 页面样式
    └── theme.ts             # DSH 明暗主题检测
test/
└── model.test.mjs
lib/
├── index.js
└── client.js
```

## License

MIT License
