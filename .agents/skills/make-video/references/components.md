# 组件检索

先读工程里的 `src/component-catalog.json`（随 init 进入 `work/project/src/`），再按本页决定复用、改参数或新写场景。编排步骤见 [composition.md](composition.md)。

本轮只有注册表里的 kind。不要把「组件已经拆开」理解成配音语义对齐或自动配音；这两项仍是 `not_implemented`。也没有通用 JSON 视频 DSL，没有跨模板的全局 Skill。

## 基础组件

| id | 适用 | 不适用 | 组合 | 限制 |
| --- | --- | --- | --- | --- |
| background | 所有场景的深色环境底，由 `Video` 统一铺上 | 不要当成可替换的产品照片 | 与任意 scene 一起出现 | 不读取 content 文案；换主题色改 theme，换粒子形态要改组件 |
| stage | 场景内部的透视平面、全画幅 SVG 和等宽标注 | 不要单独做成一条镜头 | 被各 scene 引用 | 无独立参考图；改投影公式会影响多个镜头 |

`stage` 的 reference 在 catalog 里是 `null`，notes 说明它没有单独静帧。

## 场景

每个 kind 在 `src/registry/index.ts` 里只有一条映射。未知 kind 会失败，错误信息包含该 kind 名。默认示例不含 `media`，但 schema 与 catalog 都保留它。

| kind | 适用 | 不适用 | 组合建议 | 限制 |
| --- | --- | --- | --- | --- |
| chip | 硬件外观、租金/产出对比 | 人物、流体、任意产品照片 | 常作开场；surface 只换贴图 | 透视坐标按芯片 UV；照片请改用 media |
| percentage | 一个 0–100 的比例和一句结论 | 多指标并列 | 接在硬件账之后 | 网格着色由 value 决定，不能塞第二组数据 |
| system | 日期与「系统锁定」立方体 | 长说明 | 短镜头，2–4 秒量级 | date 必须是 `MM.DD` |
| architecture | 固定五层结构、命令与模块名 | 层数不是 5 的结构 | 适合封面选景 | `data.layers` 是五条层名，不是自由叠加的场景层 |
| chapters | 两张章节卡、网络节点、成本折线 | 三章以上 | 中段叙事 | cards 必须 2 条，nodes 必须 6 条 |
| thesis | 仪表读数、强调词、否定划线 | 中性列表 | 放在结构说明之后 | 划线绑在 negative/statement 上 |
| intertitle | 一句主题标题 | 数据或图表 | 章节之间的短停顿 | 时长可以很短，但仍至少 1 秒 |
| headlines | 多条新闻飞掠加一张主卡片 | 长文正文 | 信息密度高的中后段 | headlines 最多 32 条，主卡用 prefix/keyword/suffix |
| weights | 参数量、矩阵、分词、代码 | 真实源代码讲解的完整文件 | 收束镜头 | tokens 与 tokenIds 各 4 个；surface 是矩阵贴图 |
| media | 真实图片或视频 | 仍想要透视芯片/矩阵语言时 | 主题对不上现成隐喻时插入 | 文件必须在 public/；视频静音且不自动循环 |

## 检索顺序

1. 在 catalog 的 `scenes[].kind` 里找能承载这句文案的镜头。
2. 只改 `content.json` 的 `data`、`title`、`summary`、`duration`。
3. 隐喻不合（人物、特定产品、流体）时用 `media`，或在本期 `work/project/src/scenes/` 改组件。
4. 新 kind 必须同时改 `content.ts` 的 Zod、`registry` 和 catalog，否则 `inspect` 失败。
