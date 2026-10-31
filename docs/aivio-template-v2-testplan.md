# aivio-template-v2 · 测试计划（样板仓入库副本）

| 项 | 内容 |
| --- | --- |
| 本线代号 | **aivio-template-v2**（**V2**） |
| 样板仓基线 | `9a5c321c05bcaefd42a620cbca98cd2f1d9347b0`（main） |
| 指南仓基线 | `atlantis-mk/aivio-template-guide` @ `ff2b91104a95258857191871061bde309f39aa32` |
| 权威稿 | 门禁计划 2026-10-31（本文件是其样板仓副本，路径改为本仓相对路径） |
| 红灯基线 | **本红灯 PR 的 HEAD**。实现阶段相对该提交，`tests/` 与 `tests/fixtures/` **零 diff** |
| 标签 | `fixture`／`no-cost`／`template-gate`（不打真 Aivio 产品、不配音） |
| 本副本范围 | 只记录用例与已入库红灯测。不改产品实现 |

钉死数字：默认 content 合计 **60.0s**、**9** 场景（无 media 镜头）；Zod **10** kind：`chip` · `percentage` · `system` · `architecture` · `chapters` · `thesis` · `intertitle` · `headlines` · `weights` · `media`。content.json `schemaVersion` 保持 **`"1.0"`**。README 工程 `schema_version` 升 **`"2.0"`**（与 catalog 同批）。

明确不动：Aivio 产品解析／卡片；其它模板仓；配音语义对齐／自动配音；通用 JSON DSL；全局 Skill；**layers／transition 执行**（L0）；既有 `tests/test_pipeline.py`／`tests/smoke_pipeline.py` 的指纹与原子交付用例；七命令名 `env` · `init` · `validate` · `check` · `preview` · `render` · `verify`。

## 指南仓（V2-02）不在本仓执行

本 PR **不**修改 `aivio-template-guide`。V2-02a／b／c（双轨节、可复制示例、topics 不含 `aivio-template`、注明工程 `schema_version` 与卡片／`aivio.*` 协议无关）在**实现阶段**由指南仓 PR 或门禁侧文档检查。

本仓 `tests/test_guide_dual_track.py` 全部 **skip**，原因：**指南仓另测**。不算本仓红灯失败。

## 钉死验收（V2-01…V2-07）

1. **V2-01 元数据**：`README.md` frontmatter 保留既有工程键，并含非空 `aivio.title`／`aivio.description`／`aivio.cover`；根目录 `cover.png` 与 `aivio.cover` 解析到同一文件；`capabilities.speech_semantic_alignment` 与 `automatic_voiceover_generation` 仍为 `not_implemented`；工程 `schema_version == "2.0"`。
2. **V2-02 指南**：见上节。本仓不测。
3. **V2-03 registry／回归**：`KNOWN_KINDS` 与 10 个 Zod kind 集合相等；未知 kind 失败信息含 kind 名。golden 为升级前默认 content；对其 `validate` 通过；duration 合计 60.0s。sfx 与横竖屏／三封面不回退（既有测，本红灯命令不跑浏览器 smoke）。
4. **V2-04 catalog**：三文件存在且非空；catalog `schemaVersion == "2.0"` 且 `scenes` 覆盖 10 kind；`AGENTS.md` 与技能 `SKILL.md` 含组件检索步骤；`composition.md` 写明 layers／transition 本轮不可用、为后续。
5. **V2-05 L0**：用例与夹具**不得**把 layers／transition **执行**列为必过。文档可预告后续。
6. **V2-06 Pipeline**：七命令名不变。另有最小 `inspect`：完整模板退出码 0；故意破坏时非 0，信息可测。
7. **V2-07 边界**：不得宣称已支持通用 JSON DSL、全局 Skill、配音语义对齐或自动配音。未验证项不得标 `verified`。本红灯 PR 不单列扫描测；V2-01c 锁住两项 `not_implemented`。

## 本仓用例与文件

| ID | 文件 | 断言 | 本红灯 PR |
| --- | --- | --- | --- |
| V2-01a | `tests/test_readme_meta.py` | frontmatter 含非空 `aivio.title`／`description`／`cover`，并保留 `id`／`name`／`engine`／`entrypoints`／`capabilities`／`schema_version` | 红 |
| V2-01b | 同上 | 根目录非空 `cover.png`，且 `aivio.cover` 解析到该文件 | 红 |
| V2-01c | 同上 | 两项配音能力均为 `not_implemented` | 绿 |
| V2-01d | 同上 | 工程 `schema_version == "2.0"`（基线为 `"1.0"`） | 红 |
| V2-02a／b／c | `tests/test_guide_dual_track.py` | 指南双轨、topics、与卡片协议无关 | **skip（指南仓另测）** |
| V2-03a | `tests/test_registry.py` | `KNOWN_KINDS` 集合等于 10 kind | 红（无模块） |
| V2-03b | 同上 | `getSceneComponent("not-a-real-kind")` 抛错，信息含 `Unknown scene kind:` 与 `not-a-real-kind` | 红 |
| V2-03c | `tests/test_content_regression.py` + `tests/fixtures/content-default-v1.json` | golden 存在，字节等于 `content.json`；9 场景、`schemaVersion:"1.0"`、无组合用 layers／transition | 绿 |
| V2-03d | 同上 | 对 golden：`pipeline.py validate` 与 `scripts/content.cjs validate` 退出码 0 | 绿（无浏览器路径） |
| V2-03e | 同上 | `scenes[].duration` 合计 **60.0** | 绿 |
| V2-03f | 既有 `tests/test_pipeline.py` | sfx 开／关与指纹不回退 | 绿（既有） |
| V2-03g／h | 既有 `tests/smoke_pipeline.py` | 横屏／竖屏／三封面。本 PR 的 unittest **不**跑 smoke | 不在本次命令内 |
| V2-04a | `tests/test_catalog.py` | 三个路径存在且非空（见下） | 红 |
| V2-04b | 同上 | catalog `schemaVersion == "2.0"`，`scenes[].kind` 等于 10 kind | 红 |
| V2-04c | 同上 | `AGENTS.md` 与 `SKILL.md` 可检索到 `catalog` 或 `components.md` | 红 |
| V2-04d | 同上 | `composition.md` 含 `layers`、`transition`、`不可用`、`后续` | 红 |
| V2-05a／b | 本文件约束 | 无 layers／transition 执行必过用例。04d 只检查「本轮不可用」文案 | 遵守（无此类用例） |
| V2-06a | 既有 `tests/test_pipeline.py` | 七命令语义仍在 | 绿（既有） |
| V2-06b | `tests/test_inspect.py` | `inspect` 已注册；完整模板退出码 0 且 JSON `ok: true`；缺 catalog 时退出码 **5**，输出含 `catalog` | 红 |
| V2-06c | 同上 | `--help` 仍含七命令且含 `inspect`；`env` 不创建 `work/` | 红 |
| V2-07a／b | 不单列新测 | 基线文档无「已支持配音对齐／自动配音／通用 DSL／全局 Skill」的完成宣称 | 不单列 |
| V2-07c | 同 V2-01c | 两项能力保持 `not_implemented` | 绿 |

`check` 会启动浏览器列出合成（`render.mjs list`）。本 unittest **不**调用 `pipeline.py check`，避免把浏览器烟测算进红灯命令。实现阶段仍须保证七命令里的 `check` 可用；横竖屏渲染由既有 `smoke_pipeline.py` 覆盖，本 PR 不跑。

## 实现必须对齐的接口（测试已写死）

### registry

优先路径：`.agents/skills/make-video/assets/project-template/src/registry.ts`（或 `src/registry/index.ts`，同名 `.tsx`／`.mjs`／`.js` 亦可）。

- `KNOWN_KINDS`：kind 名集合，恰好 10 个，含 `chip` … `media`。
- `getSceneComponent("not-a-real-kind")` 抛出 Error，message 含 `Unknown scene kind:` 与 `not-a-real-kind`。

### catalog 路径

| 文件 | 路径 |
| --- | --- |
| catalog | `.agents/skills/make-video/assets/project-template/src/component-catalog.json` |
| 组件说明 | `.agents/skills/make-video/references/components.md` |
| 组合说明 | `.agents/skills/make-video/references/composition.md` |

catalog 形如 `{ "schemaVersion": "2.0", "scenes": [ { "kind": "chip" }, … ] }`，`scenes[].kind` 集合等于上述 10 kind。

`AGENTS.md` 与 `.agents/skills/make-video/SKILL.md` 正文须出现 `catalog` 或 `components.md`（组件检索／先查 catalog 一类步骤）。

`composition.md` 须同时出现 `layers`、`transition`、`不可用`、`后续`，表示本轮不可用、留给后续。不得据此添加执行必过测。

### inspect

`python3 .agents/skills/make-video/scripts/pipeline.py inspect --root <根>`：

- 与七命令并列，不改名、不替换。
- 模板完整：退出码 **0**，stdout 最后一行为 JSON，`ok` 为 `true`。
- 删除 `src/component-catalog.json`：退出码 **5**（与现有「输入不合法 → 5」一致），stdout 或 stderr 含子串 `catalog`。
- 未注册子命令（argparse `invalid choice`，退出码 2）不算 inspect 已实现。
- 不要求本轮检查 layers／transition 执行。

### golden

`tests/fixtures/content-default-v1.json` 是基线 `.agents/skills/make-video/assets/project-template/content.json` 的字节拷贝：9 场景、合计 60.0s、`schemaVersion:"1.0"`。架构场景 `data.layers` 是文案字段，不是组合层；golden **没有**内容根或场景顶层的 `layers`／`transition`。

## 夹具

| 夹具 | 路径 | 用途 |
| --- | --- | --- |
| 升级前默认 content | `tests/fixtures/content-default-v1.json` | V2-03c／d／e |
| 根封面 | `cover.png`（实现产物，**本 PR 不添加**） | V2-01b |
| 烟测目录 | `tests/artifacts/`（已忽略） | 既有 smoke；不含 layers 必过夹具 |

可选对照表（`kind-registry-expect.json`、未知 kind 夹具、README 片段）本 PR 不入库；未知 kind 在 `test_registry.py` 内联。

**L0**：不得增加「含 layers／transition 且要求渲染为绿」的必过夹具。

## 红灯期望（相对基线 `9a5c321`）

必红：V2-01a、V2-01b、V2-01d、V2-03a、V2-03b、V2-04a、V2-04b、V2-04c、V2-04d、V2-06b、V2-06c。

预期绿：V2-01c、V2-03c、V2-03d（validate）、V2-03e，以及既有 `tests/test_pipeline.py`。

不计入失败：V2-02 skip；不跑 `smoke_pipeline.py`。

## 复跑

1. 实现 PR 不得为变绿而改 `tests/` 或 `tests/fixtures/`。需求变更先改本文件，再改测试，再改实现。
2. 独立复跑：`python -m unittest discover -s tests -p 'test_*.py'`，并确认 `test_pipeline.py` 仍全绿。smoke 非每次 `--full`，但不得回退。
3. 不得删指纹／原子交付负例，不得把 L0 执行测改成必过。
4. 样板仓测为主；指南侧只做文档／topics 检查。
