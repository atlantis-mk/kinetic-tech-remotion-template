"""V2-01 README 双轨元数据。

实现前：V2-01a / V2-01b / V2-01d 为红；V2-01c 在基线已满足，为绿。
实现后本文件零 diff。
"""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
ENGINEERING_KEYS = ("id", "name", "engine", "entrypoints", "capabilities", "schema_version")


def extract_frontmatter(text):
    match = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not match:
        raise AssertionError("README.md 必须以 --- YAML frontmatter 开始")
    return match.group(1)


def unquote(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def top_scalar(frontmatter, key):
    match = re.search(rf"(?m)^{re.escape(key)}:[ \t]*(.*)$", frontmatter)
    if not match or not match.group(1).strip():
        raise AssertionError(f"README frontmatter 缺少非空工程键 {key}")
    return unquote(match.group(1))


def nested_map(frontmatter, key):
    """读取顶层键下仅一层缩进的标量映射。缺失时返回 None。"""
    match = re.search(rf"(?m)^{re.escape(key)}:[ \t]*\n((?:[ \t].*\n?)*)", frontmatter + "\n")
    if not match:
        return None
    result = {}
    for raw in match.group(1).splitlines():
        if not raw.strip() or raw.strip().startswith("#") or raw.strip().startswith("-"):
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        if indent != 2:
            continue
        name, sep, value = raw.strip().partition(":")
        if not sep:
            continue
        result[name.strip()] = unquote(value)
    return result


class ReadmeMetaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = README.read_text(encoding="utf-8")
        cls.frontmatter = extract_frontmatter(cls.text)
        cls.meta = {key: top_scalar(cls.frontmatter, key) for key in ("schema_version", "id", "name", "engine")}
        cls.meta["entrypoints"] = nested_map(cls.frontmatter, "entrypoints")
        cls.meta["capabilities"] = nested_map(cls.frontmatter, "capabilities")
        cls.meta["aivio"] = nested_map(cls.frontmatter, "aivio")

    def test_v2_01a_aivio_block_and_engineering_keys(self):
        for key in ENGINEERING_KEYS:
            self.assertIn(key, self.meta)
            self.assertTrue(self.meta[key], f"工程键 {key} 须非空")
        aivio = self.meta["aivio"]
        self.assertIsInstance(
            aivio,
            dict,
            "README frontmatter 须含 aivio 映射，且 title / description / cover 均为非空字符串",
        )
        for key in ("title", "description", "cover"):
            self.assertIn(key, aivio, f"aivio.{key} 缺失")
            self.assertIsInstance(aivio[key], str)
            self.assertTrue(aivio[key].strip(), f"aivio.{key} 须非空")

    def test_v2_01b_root_cover_png_matches_aivio_cover(self):
        cover_file = ROOT / "cover.png"
        self.assertTrue(cover_file.is_file() and cover_file.stat().st_size > 0, "仓库根目录须存在非空 cover.png")
        aivio = self.meta["aivio"] or {}
        cover = aivio.get("cover")
        self.assertIsInstance(cover, str, "aivio.cover 须为指向根 cover.png 的相对路径")
        self.assertTrue(cover.strip())
        resolved = (ROOT / cover).resolve()
        self.assertTrue(resolved.is_file(), f"aivio.cover 指向的文件不存在: {cover}")
        self.assertEqual(resolved, cover_file.resolve(), "aivio.cover 须解析到仓库根目录 cover.png")

    def test_v2_01c_voice_capabilities_not_implemented(self):
        capabilities = self.meta["capabilities"]
        self.assertIsInstance(capabilities, dict)
        self.assertEqual(capabilities.get("speech_semantic_alignment"), "not_implemented")
        self.assertEqual(capabilities.get("automatic_voiceover_generation"), "not_implemented")

    def test_v2_01d_engineering_schema_version_2_0(self):
        self.assertEqual(self.meta["schema_version"], "2.0")


if __name__ == "__main__":
    unittest.main()
