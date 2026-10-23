# README 元数据与能力声明

这是本用户模板包的软件收录约定，不是 Remotion 通用标准。已有外部读取器时先核对其真实协议，保留兼容性。

## 元数据契约

README 第一行 --- 开始 UTF-8 YAML，用下一行独立 --- 结束；安全解析、无重复键。路径相对项目根，使用 /，不越出根目录，目录路径以 / 结尾。schema_version 与模板内容 version 分开维护。

| 必填字段 | 约定 |
| --- | --- |
| schema_version | 字符串 "1.0" |
| id | 稳定小写字母/数字/连字符标识 |
| name, description | 非空显示名称与用途 |
| version | 字符串，主版本.次版本.修订版本 |
| status | scaffold 或 ready |
| engine, scope | remotion、single-video；其他模式先适配协议 |
| tags | 字符串数组 |
| entrypoints | instructions、skill、template 文件路径 |
| paths | reference、source、workspace、input、delivery 目录路径 |
| accepted_inputs | audio/image/video/text 去重数组；接受整理不代表自动接入画面 |
| video_aspect_ratios | 声明实际支持的比例 |
| default_deliverables | 实际默认交付列表 |

标准路径值：

```yaml
entrypoints:
  instructions: "AGENTS.md"
  skill: ".agents/skills/make-video/SKILL.md"
  template: ".agents/skills/make-video/references/template.md"
paths:
  reference: ".agents/skills/make-video/assets/reference/"
  source: ".agents/skills/make-video/assets/project-template/"
  workspace: "work/"
  input: "work/input/"
  delivery: "work/delivery/"
```

静态 reference/source 需实际存在；运行目录未生成不意味着模板缺失。交付项包含唯一的直接 filename、type（video/cover）；cover 另含 aspect_ratio、width、height，尺寸与比例一致。视频尺寸由本期任务确定。

## 能力与参考

可选 capabilities 按粒度声明：

- verified：该项有实际验证证据。
- available：入口已实现，完整验证尚未完成。
- requires_adaptation：需要 AI 在本期适配或实现。
- not_implemented：没有现成实现。

能力可分 landscape_video、portrait_video、content_parameters、voiceover_input、image_video_inputs、cover_outputs、project_initialization、timeline_validation、delivery_technical_checks、automatic_voiceover_generation、automatic_audio_alignment。根据实际增减，不复制旧模板的结论。

可选 reference_files 将用途映射到随包存在的参考文件，不能指向临时预览或另一台电脑的绝对路径。

ready 的依据是实际工程、足够的风格参考、运行入口以及至少一次真实预览/渲染。它不代表所有能力均 verified，更不代表本期已完成。scaffold 明确还缺什么。

## 文档一致性

README 正文保留显示名称及“模板用途、适用场景、素材要求、默认交付、制作入口”。软件读 YAML，正文不另设冲突规则。

生成项目的 references/readme-format.md 应包含完整本项目协议；references/template.md 应说明风格证据、固定特征、替换映射、真实参数入口、实际验证日期和范围。路径迁移时同步更新说明和 README。不要把开发机已安装依赖写成仓库自带依赖。
