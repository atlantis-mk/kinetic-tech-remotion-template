"""V2-04 catalog、组件说明与 composition 边界。

实现前三份文档与 catalog 都不存在，且 AGENTS / SKILL 无检索步骤，故 a–d 为红。
本文件不要求 layers / transition 被执行（L0）。实现后零 diff。
"""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / ".agents/skills/make-video/assets/project-template"
CATALOG = TEMPLATE / "src/component-catalog.json"
COMPONENTS = ROOT / ".agents/skills/make-video/references/components.md"
COMPOSITION = ROOT / ".agents/skills/make-video/references/composition.md"
AGENTS = ROOT / "AGENTS.md"
SKILL = ROOT / ".agents/skills/make-video/SKILL.md"
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
STEP = re.compile(r"component-catalog\.json|components\.md|catalog", re.I)


def read_nonempty(path):
    if not path.is_file():
        raise AssertionError(f"缺少非空文件 {path.relative_to(ROOT)}")
    text = path.read_text(encoding="utf-8")
    if not text.strip():
        raise AssertionError(f"文件为空 {path.relative_to(ROOT)}")
    return text


class CatalogTests(unittest.TestCase):
    def test_v2_04a_catalog_and_docs_exist(self):
        for path in (CATALOG, COMPONENTS, COMPOSITION):
            read_nonempty(path)

    def test_v2_04b_catalog_schema_covers_ten_kinds(self):
        data = json.loads(read_nonempty(CATALOG))
        self.assertEqual(data.get("schemaVersion"), "2.0", "component-catalog.json schemaVersion 须为 \"2.0\"")
        scenes = data.get("scenes")
        self.assertIsInstance(scenes, list, "component-catalog.json 须含 scenes 数组")
        kinds = {scene["kind"] for scene in scenes}
        self.assertEqual(kinds, set(EXPECTED_KINDS), "catalog scenes[].kind 须覆盖且仅含 10 个 Zod kind")

    def test_v2_04c_agents_and_skill_mention_catalog_step(self):
        for path in (AGENTS, SKILL):
            text = path.read_text(encoding="utf-8")
            self.assertRegex(
                text,
                STEP,
                f"{path.relative_to(ROOT)} 须含组件检索步骤关键字（catalog 或 components.md）",
            )

    def test_v2_04d_composition_defers_layers_and_transition(self):
        text = read_nonempty(COMPOSITION)
        for token in ("layers", "transition", "不可用", "后续"):
            self.assertIn(
                token,
                text,
                "composition.md 须写明 layers／transition 本轮不可用、为后续，而不是本轮执行",
            )


if __name__ == "__main__":
    unittest.main()
