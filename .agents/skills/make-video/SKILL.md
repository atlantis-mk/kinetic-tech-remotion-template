---
name: make-video
description: 使用本仓库的科技透视动效模板制作一条视频与三种封面，支持参数化场景、横竖屏、程序音效及本地媒体输入。仅在开始实际制作时创建 work/。
---

# 制作一条科技解说视频

先读根 [AGENTS.md](../../../AGENTS.md)，它是唯一制作总规则。本技能提供技术步骤。

1. 读取 [template.md](references/template.md) 确认风格与能力边界。恢复任务时先读 [task-state.md](references/task-state.md) 并检查根 work/task.json 与实际文件。
2. 开始制作才运行 `python3 .agents/skills/make-video/scripts/pipeline.py init --install`。它复制真实工程、保留已有修改，生成程序音效；没有主题时先整理需求，不把默认示例直接当作用户成片。
3. 在 `work/project/content.json` 逐镜头替换文案、指标、标注、新闻、代码和封面。场景可重排、复制、改时长；配置受真实 Zod schema 与时间轴检查约束。新视觉主体超出已有场景时修改本期 src，而非只改标题。参数与媒体操作见 [remotion.md](references/remotion.md)。
4. 原始素材存 work/input；实际使用的派生素材放 work/project/public 并用相对路径引用。按需求添加配音、音效和字幕；默认程序音效，无 TTS 或自动对齐。先核对配音语义再排时间轴。
5. 执行 `validate`、`check`、`preview --frames 0-59`，结合每场景起始/中间/末尾帧与有声短片检查，必要时改片段范围；再 `render`、`verify`。技术报告不会宣称视听通过。
6. 实际看关键帧、转场、成片和三张封面，收听有声预览，并按根规则记录验收与任务阶段。修改后重新渲染相关交付。
7. 默认交付 `work/delivery/video.mp4`、`cover-4x3.png`、`cover-3x4.png`、`cover-16x9.png`。若用户要求另一个清单，先落实 task.deliverables 与实际渲染能力。

维护模板时修改 assets/project-template，使用根 tests 的隔离测试；不要为维护运行根 init。模板元数据协议见 [readme-format.md](references/readme-format.md)。
