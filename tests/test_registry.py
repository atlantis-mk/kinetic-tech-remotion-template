"""V2-03a / V2-03b：场景注册表。

实现前模块不存在，import / 加载失败即红。实现后本文件零 diff。

期望接口：
  模块路径（按顺序取第一个存在的文件）：
    .agents/skills/make-video/assets/project-template/src/registry.ts
    .agents/skills/make-video/assets/project-template/src/registry/index.ts
    以及同名 .tsx / .mjs / .js
  KNOWN_KINDS：kind 字符串集合，恰好等于
    chip, percentage, system, architecture, chapters, thesis,
    intertitle, headlines, weights, media
  getSceneComponent(kind)：未知 kind 抛出 Error，message 含
    "Unknown scene kind: " 与该 kind 名。
    例：Unknown scene kind: not-a-real-kind
"""
import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / ".agents/skills/make-video/assets/project-template"
EXPECTED_KINDS = frozenset({
    "chip",
    "percentage",
    "system",
    "architecture",
    "chapters",
    "thesis",
    "intertitle",
    "headlines",
    "weights",
    "media",
})
CANDIDATES = (
    TEMPLATE / "src/registry.ts",
    TEMPLATE / "src/registry/index.ts",
    TEMPLATE / "src/registry.tsx",
    TEMPLATE / "src/registry/index.tsx",
    TEMPLATE / "src/registry.mjs",
    TEMPLATE / "src/registry.js",
)
INTERFACE = (
    "期望 project-template/src/registry.ts（或 src/registry/index.ts）导出 "
    "KNOWN_KINDS（集合恰好为 chip, percentage, system, architecture, chapters, "
    "thesis, intertitle, headlines, weights, media）与 getSceneComponent(kind)。"
    "未知 kind 抛出 Error，message 含 \"Unknown scene kind: \" 与该名字，"
    "例如 Unknown scene kind: not-a-real-kind。"
)
LOADER = r"""
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const entry = process.argv[2];
const project = process.argv[3];
const built = esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
  packages: 'external',
  jsx: 'automatic',
  absWorkingDir: project,
  logLevel: 'silent',
});
const filename = path.join(project, '.registry-test-bundle.cjs');
const mod = new Module(filename);
mod.filename = filename;
mod.paths = Module._nodeModulePaths(project);
mod._compile(built.outputFiles[0].text, filename);
const exported = mod.exports || {};
const known = exported.KNOWN_KINDS;
const getSceneComponent = exported.getSceneComponent;
function asKinds(value) {
  if (Array.isArray(value)) return value.map(String);
  if (value && typeof value === 'object' && typeof value[Symbol.iterator] === 'function') {
    return Array.from(value, String);
  }
  if (value && typeof value === 'object') return Object.keys(value);
  return null;
}
let error = null;
let threw = false;
if (typeof getSceneComponent === 'function') {
  try {
    getSceneComponent('not-a-real-kind');
  } catch (caught) {
    threw = true;
    error = caught && (caught.message || String(caught)) || '';
  }
}
process.stdout.write(JSON.stringify({
  kinds: asKinds(known),
  getSceneComponent: typeof getSceneComponent,
  threw,
  error,
}));
"""


def load_registry():
    entry = next((path for path in CANDIDATES if path.is_file()), None)
    if entry is None:
        raise AssertionError("未找到场景注册表模块。" + INTERFACE)
    proc = subprocess.run(
        ["node", "-e", LOADER, str(entry), str(TEMPLATE)],
        cwd=TEMPLATE,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise AssertionError(
            "加载注册表失败。" + INTERFACE + "\n" + (proc.stderr or proc.stdout)
        )
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as error:
        raise AssertionError("注册表加载器未输出 JSON。" + INTERFACE + "\n" + proc.stdout) from error


class RegistryTests(unittest.TestCase):
    def test_v2_03a_known_kinds_match_scene_schema(self):
        loaded = load_registry()
        kinds = loaded.get("kinds")
        self.assertIsInstance(kinds, list, INTERFACE)
        self.assertEqual(set(kinds), set(EXPECTED_KINDS), INTERFACE)
        self.assertEqual(len(kinds), len(set(kinds)), "KNOWN_KINDS 不应含重复 kind")

    def test_v2_03b_unknown_kind_error_includes_name(self):
        loaded = load_registry()
        self.assertEqual(loaded.get("getSceneComponent"), "function", INTERFACE)
        self.assertTrue(loaded.get("threw"), "getSceneComponent('not-a-real-kind') 须抛错。" + INTERFACE)
        message = loaded.get("error") or ""
        self.assertIn("Unknown scene kind:", message, INTERFACE)
        self.assertIn("not-a-real-kind", message, INTERFACE)


if __name__ == "__main__":
    unittest.main()
