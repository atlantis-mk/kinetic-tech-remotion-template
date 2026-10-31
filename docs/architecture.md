# 工程结构与维护

`.agents/skills/make-video/assets/project-template/` 是唯一工程基准。单期 init 按需复制至 work/project，不覆盖已有工程；运行区由 Git 忽略。

| 文件 | 职责 |
| --- | --- |
| content.json | 默认虚构示例与渲染参数的唯一数据源 |
| src/content.ts | 真实 Zod 联合类型、时间/引用检查、画幅和累计帧数。content.json schemaVersion 仍为 "1.0" |
| src/registry/index.ts | kind 到场景组件的唯一映射；未知 kind 报错并带上 kind 名 |
| src/scenes/ | 按 kind 拆开的场景。旧 Film.tsx / Extension.tsx 已删除，不保留第二份实现 |
| src/components/ | 已复用的底图与透视原语（Background、stage） |
| src/component-catalog.json | 组件与 10 个 kind 的索引，schemaVersion "2.0" |
| src/math.ts | 单应性矩阵、四边形投影、轨迹插值、确定性随机 |
| src/context.tsx | 类型化场景内容上下文，嵌套标注使用同一参数 |
| src/Video.tsx | 经 registry 渲染场景、累计时序、竖屏框架、本地媒体与音轨 |
| src/Cover.tsx | 三种封面构图、显式场景采样进度 |
| src/cue-presets.json | 246 个相对场景时间的程序音效提示点 |
| scripts/content.cjs | 用显式 esbuild 依赖编译真实 schema；CLI 与画面使用同一内容 |
| scripts/registry-loader-hook.cjs | `npm ci` 后把 `require("esbuild")` 接到真实 `lib/main.js`。注册表测试的 `node -e` 会把工程目录当成入口，这个钩子改去加载 `src/registry/index.ts` |
| scripts/build-audio.mjs | Node 标准库确定性 DSP、声像/短反射、峰值控制；按场景顺序/时长重建 WAV |
| scripts/render.mjs | 实际合成加载与渲染、独立空闲端口、可指定 CHROME_PATH |
| make-video/scripts/pipeline*.py | 初始化、参数/媒体/合成检查、原子交付、摘要验证。另有 inspect：catalog / registry 完整性失败时退出码 5，不替换七个命令 |
| references/components.md、composition.md | 选型与 kind+data 编排。layers / transition 本轮不可用 |

画面主体使用原生 React、SVG、Canvas 和 CSS matrix3d，并不需要 AE。原始动画的 1920×1080 空间作为原生舞台，动画时间由每场景进度映射到固定轨迹。竖屏以“标题/说明—完整结构舞台—下方解释”的独立框架重新排版，舞台内部标签会缩小，重要数字应同步写入竖屏标题/说明，需要更大竖屏主体时应改分镜布局。

每个场景至少一秒，累计最长十分钟。时长必须是 fps 下的整帧。累计帧数避免手写 start/end 产生间隙或重叠；场景内保留淡入淡出和定格。独立重排不会自动生成跨镜头连续摄像机轨迹。

SFX 不取自原片。JSON 提示点按场景 kind 匹配、按 duration 缩放，Node 合成整段 48kHz 双声道 WAV。缓存同时比对输入与输出 SHA256；相同输入确定性输出。缩短镜头会缩短声效，过快节奏需要人工调 gain/提示点。没有 LUFS 达标声明；最终音量仍需收听。

渲染先写目标同目录的 .rendering-*；完整媒体检查通过且输入未变化后原子替换。manifest 包含合成、范围、尺寸、输入与输出摘要。fingerprint 覆盖 src/public/scripts/content/package/lock/tsconfig 和实际交付清单，verify 会拒绝旧输入和被改动文件。task 的叙述性状态不参与画面计算。

维护验证：

```bash
cd .agents/skills/make-video/assets/project-template
npm ci
npm run typecheck
cd ../../../../..
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 tests/smoke_pipeline.py --full
```

smoke 使用 tests/artifacts 下的独立模板根并 npm ci。为防覆盖已有证据，目录已存在时明确失败；改名保留旧结果后再运行。测试不创建模板根 work。`--full` 输出完整默认 60 秒；所有运行输出都被忽略。环境要求见使用说明，视听验收范围见 references/template.md。
