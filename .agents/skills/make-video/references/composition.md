# 用 kind 与 data 组片

渲染参数只有 `work/project/content.json`。一条场景是 `kind` 加上对应的 `data`。`Video` 按注册表把 kind 交给场景组件，时间轴由各场景 `duration` 累加，不要手写起点来假装对齐。

作者无需改写旧 content.json 字段（仅 kind 与 data）即可出片。`content.json` 的 `schemaVersion` 保持 `"1.0"`。工程 README 的 `schema_version` `"2.0"` 只表示模板带有组件目录，与片子的 schema、也与模板中心卡片的 `aivio.*` 无关。

## 组装

1. 先查 [components.md](components.md) 和 `src/component-catalog.json`，选定 kind。
2. 复制一条同 kind 的场景，换唯一 `id`，改 `title`、`summary`、`duration` 和 `data`。
3. 画幅、主题色、字幕、程序音效、配音文件和封面选景仍在 content 顶层，不在场景组件的 props 里另起一套配置。
4. `cover.sceneId` 必须指向现有场景。封面进度是 `cover.progress`，不是另一条时间轴。
5. 程序音效按 kind 匹配 `cue-presets.json`，再按该场景 duration 缩放。拆分文件不改变这个契约。

默认示例是 9 个场景、合计 60 秒、`audio.sfx.enabled` 为 true、无配音。横屏 1920×1080，竖屏 1080×1920，三张封面仍由既有合成输出。

## 何时新写 React 场景

出现下面任一情况时，改 `work/project/src` 里的场景或新增组件，不要只换标题：

- 现有 kind 的字段装不下这段叙事（例如层数不是 5、章节不是 2）。
- 主体不是芯片、数据墙、立方体、结构层、卡片、仪表、标题、新闻或矩阵，也不是一张静图/一段视频。
- 需要新的镜头运动，而不是沿用该 kind 已有轨迹。

新 kind 要同时补 Zod、`KNOWN_KINDS`、`SCENE_COMPONENTS` 和 catalog。未知 kind 不能静默跳过。

## layers 与 transition（本轮不可用）

自由组合 `scenes[].layers`（component + props）和跨场景 `transition` **本轮不可用**，留作后续。本轮测试不要求它们能执行。不要把这些字段写进 content.json：场景对象是 `.strict()`，未知字段会校验失败。

`architecture` 的 `data.layers` 只是五条层名文案，不是上述自由组合层。

本轮没有通用 JSON 视频 DSL。组件目录只索引现有 React 场景，不能代替场景组件。
