# 命令、参数和素材

所有 pipeline 命令均可从任意目录运行；默认根由脚本位置推导，可传 `--root /path/to/template`。路径含空格或中文时给 shell 参数加引号。命令失败输出非零码，日志在 work/preview；0 成功、2 用法错误、3 缺少环境、5 输入不合法、7 执行失败。

| 命令 | 行为 |
| --- | --- |
| env | 检查 node/npm/python3/ffmpeg/ffprobe，不生成 work，不证明浏览器可用 |
| init --install | 缺失才复制工程与空 task，npm ci，生成程序音效；保留已有改动 |
| validate | 实际 schema、时序、路径、文件、音视频流和时长检查，重建必要 SFX |
| check | validate + tsc + 实际浏览器加载 Main 与三张封面合成 |
| preview --frames 0-59 | 全部场景首/中/末帧和指定范围短片，输出到 preview |
| render [--only all\|video\|covers] | 按 task.deliverables 或默认清单原子输出 |
| verify | 本轮摘要、尺寸、fps、时长、预期音轨及完整解码；不表示视听通过 |
| inspect | 可选。校验 component-catalog、registry 与 Zod kind，并解析 reference/source。不创建 work，不替代上表七个命令。完整性失败退出码 5 |

工程锁定 Remotion 4.0.538、React 19.2.0、TypeScript 5.9.3、Zod 3.25.76。无需 AE、Python 第三方库或付费服务。Chrome 路径可通过 CHROME_PATH 指定，REMOTION_CONCURRENCY 默认为 4。npm run studio 前先 npm run sound；content 改时间轴后需重建 sound。

## 参数入口

唯一参数文件为 work/project/content.json。类型、长度与范围以 src/content.ts 的实际 schema 为准，未知字段会报错，不能偷偷被忽略。`schemaVersion` 保持 `"1.0"`。不要写入 `scenes[].layers` 或 `transition`：自由组合层和跨场景转场本轮不可用，留作后续。`architecture.data.layers` 仍是五条层名。选镜头先查 `src/component-catalog.json` 与 references/components.md。

- video.aspect: `16:9` 或 `9:16`；video.fps: 24–60 整数。尺寸分别 1920×1080 / 1080×1920。
- theme: 四个十六进制颜色。文字、主强调色、部分高亮与背景可换；金属材质、渐变、矩阵色等保留固定风格，需要深度换色时修改组件。
- scenes: 有顺序的数组。id 唯一，kind 选场景，duration 单位秒、1–120，必须对应整帧。总时长不超过 600 秒。复制或重排时保留 data 结构并换唯一 id。title/summary 用于竖屏与媒体场景。
- subtitles: 手工定时的 `{start,end,text}`，单位秒，按顺序不重叠、不得越界；空数组关闭。
- cover: title 最多两行、总长24字符；subtitle、eyebrow、sceneId 与 progress。progress 在 .05–.95 之间显式采样动画，与 Still 的 fps=1 无关。media 视频封面使用素材开头帧；动画场景按 progress 采样。

| kind | data 的内容 |
| --- | --- |
| chip | specs 三条标注；cost/revenue 0–999；currency/unit；两条指标标签、badge、surface |
| percentage | value 0–100；teaser/label/conclusion；legend 两条；网格按比例重新着色 |
| system | date MM.DD；yearLabel；brand/systemLabel |
| architecture | title/subtitle/eyebrow/component/command；layers 与 details 各五条 |
| chapters | cards 两组 eyebrow/title/line/emphasis；nodes 六条、center、graphLabel |
| thesis | low/high、prefix/highlight、bridge、negative/statement；划线对应否定结构 |
| intertitle | title/subtitle/eyebrow |
| headlines | headlines 数组、label、prefix/keyword/suffix；相同数据进入飞掠卡片和主卡片 |
| weights | amount/unit、层数据标题说明、结构/分词/代码标题、input、四个 tokens/IDs、code、surface |
| media | file、type image/video、fit contain/cover、eyebrow；实际加载 Img/OffthreadVideo |

SVG 芯片、数字矩阵和粒子是风格资产。surface 替换图须适合对应 UV 和透视坐标；任意产品图片应优先用 media 场景，不能把照片贴在芯片平面上就视作自动适配。

## 媒体与声音

保留原件在 work/input/{audio,images,videos,text}，将实际引用的文件复制到 work/project/public/。例如 `public/media/demo.png` 对应 `data.file: "media/demo.png"`，不能填 public/ 前缀、绝对路径、网络 URL 或 `..`。

media 视频始终静音，时长至少覆盖场景，不自动循环；要使用其声音，可另提取音轨接入。image 输入建议 PNG/JPEG/WebP/SVG。媒体裁剪/视频开头偏移或循环需要先扩展 schema 与组件，当前不含这些参数。

```json
{"id":"product","kind":"media","duration":4,"title":"产品如何工作","summary":"展示真实外观与使用流程。","data":{"file":"media/demo.png","type":"image","fit":"contain","eyebrow":"PRODUCT VIEW"}}
```

默认 `audio.sfx: {"enabled":true,"volume":1}`，由代码按相对提示点合成。`voiceover:null` 关闭配音，接入示例：`{"file":"audio/narration.wav","start":0,"volume":0.85}`。配音尾部不得越过成片；允许短于视频留出静音。支持的格式以 FFmpeg/Remotion 实际解码为准，推荐 WAV/MP3。没有 TTS、转写、语义自动对齐或人声分离。

自带音效：audio.cues 元素 `{file,at,duration,volume}`，秒为单位；文件至少覆盖声明 duration，播放到 duration 截止。调整音量时避免多条音轨叠加削波。完全静音：sfx.enabled=false、voiceover=null、cues=[]。不用为无配音场景申请 Key。

直接工程维护命令：`node scripts/content.cjs validate`、`npm run sound`、`node scripts/render.mjs list`、`node scripts/render.mjs still Main /tmp/frame.png 240`。它们绕过 pipeline 的完整交付与验收记录，不能替代生产 render/verify。
