# 项目协作约定（AGENTS.md）

> 适用于本仓库的所有代码改动，包括人工提交与 AI 代理自动修改。

## 一、每次改代码必须同步做两件事

1. **升级版本号**
   - 修改根目录 `version` 文件的第 4 行：`总版本 - vX.Y.Z+vue3+VITE6.4.3`
   - 测试阶段版本号带 `-beta` 后缀（如 `v4.5.1-beta`）；正式版不带后缀（如 `v4.5.0`）
   - 只改版本号，保留 `+vue3+VITE6.4.3` 后缀
   - 第 6 行「构建时间」由构建脚本自动写入，不要手改
   - 同步更新 `src/data/changelog.js` 中对应当前版本的记录

2. **追加更新日志**
   - 在 `src/data/changelog.js` 的 `changelogEntries` 数组**最顶部**新增一条记录
   - 结构固定为：`version`（版本号）、`time`（构建时间，格式 `YYYY-MM-DD HH:mm`）、`type`（类型）、`items`（更新点数组，便于展开查看详情）
   - 同一次改动只加一条，不要拆成多条；同一天有多次改动就加多条，按时间倒序排列

```js
{
  version: 'v4.4.0-beta',
  time: '2026-11-06 01:22',
  type: 'feature',
  items: ['本次改动要点 1', '本次改动要点 2']
}
```

## 二、版本号递增规则

| 改动性质 | 版本变化 | 示例 |
| --- | --- | --- |
| 新增功能 / 页面 / 交互 | minor +1 | v4.3.0-beta → v4.4.0-beta |
| 修 bug / 样式调整 / 性能优化 | patch +1 | v4.4.0-beta → v4.4.1-beta |
| 紧急修复（线上不可用） | patch +1，并标记 `urgent` | v4.4.1-beta → v4.4.2-beta |

## 三、更新日志类型（决定卡片顶部色条）

| type | 颜色 | 适用场景 |
| --- | --- | --- |
| `feature` | 绿 | 新增功能、新增入口 |
| `fix` | 绿 | 修复 bug |
| `beta` | 蓝 | 实验性更新 |
| `urgent` | 红 | 紧急修复 |
| `style` | 紫 | 纯界面、样式、布局调整 |
| `perf` | 橙 | 性能优化 |
| `docs` | 青 | 文档更新 |
| `refactor` | 靛蓝 | 代码重构 |
| `security` | 粉 | 安全修复 |
| `test` | 灰蓝 | 测试相关 |

类型在 `changelogTypes` 中映射到 i18n 标签，新增类型需同时补充 `src/utils/i18n.js` 中的 `nav.logTypeXxx`，并在 `changelogTypeColors` 中加对应颜色。

`type` 支持数组做拼色，例如 `type: ['beta', 'style']` 会渲染蓝紫渐变色条并显示两枚徽标。

## 四、收尾自检

- [ ] `version` 第 4 行已升版本
- [ ] `src/data/changelog.js` 顶部已新增本次条目，`type` 选择正确
- [ ] `npm run build` 通过，且构建输出的版本号与新条目一致
