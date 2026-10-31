"""V2-03c / V2-03d / V2-03e：升级前默认 content 的 golden。

夹具是基线 content.json 的字节拷贝。结构与 duration 在拷贝后为绿。
pipeline validate 走既有无浏览器路径。技术 check 会打开浏览器列出合成，
不放进本 unittest（见模块说明）；七命令本身仍由既有 test_pipeline 覆盖。
"""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / ".agents/skills/make-video/assets/project-template"
GOLDEN = ROOT / "tests/fixtures/content-default-v1.json"
PIPELINE = ROOT / ".agents/skills/make-video/scripts/pipeline.py"
SOURCE_CONTENT = TEMPLATE / "content.json"
EXPECTED_KINDS = (
    "chip",
    "percentage",
    "system",
    "architecture",
    "chapters",
    "thesis",
    "intertitle",
    "headlines",
    "weights",
)


def composition_keys(mapping):
    return set(mapping) - {"data"}


class ContentRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = GOLDEN.read_bytes()
        cls.data = json.loads(cls.raw)

    def test_v2_03c_golden_is_pre_upgrade_default(self):
        self.assertTrue(GOLDEN.is_file() and self.raw.strip(), "缺少 golden tests/fixtures/content-default-v1.json")
        self.assertEqual(self.raw, SOURCE_CONTENT.read_bytes(), "golden 须为当前 project-template/content.json 的字节拷贝")
        self.assertEqual(self.data.get("schemaVersion"), "1.0")
        self.assertEqual(len(self.data["scenes"]), 9)
        self.assertEqual([scene["kind"] for scene in self.data["scenes"]], list(EXPECTED_KINDS))
        self.assertNotIn("media", [scene["kind"] for scene in self.data["scenes"]])
        self.assertNotIn("layers", self.data)
        self.assertNotIn("transition", self.data)
        for scene in self.data["scenes"]:
            keys = composition_keys(scene)
            self.assertNotIn("layers", keys, "场景顶层不得有组合 layers（data.layers 是架构文案，允许保留）")
            self.assertNotIn("transition", keys)
            self.assertNotIn("transition", scene.get("data", {}))

    def test_v2_03e_duration_sums_to_60(self):
        total = sum(scene["duration"] for scene in self.data["scenes"])
        self.assertEqual(total, 60.0)

    def test_v2_03d_pipeline_validate_golden(self):
        """既有 pipeline validate（参数与素材，不启动浏览器）。check 见文件头说明。"""
        node_modules = TEMPLATE / "node_modules"
        self.assertTrue(node_modules.is_dir(), "validate 需要 project-template/node_modules（与既有 test_pipeline 相同）")
        with tempfile.TemporaryDirectory(prefix="v2-golden-") as tmp:
            root = Path(tmp)
            shutil.copytree(
                ROOT / ".agents",
                root / ".agents",
                ignore=shutil.ignore_patterns("node_modules", "__pycache__", ".git"),
            )
            proc = subprocess.run(
                [sys.executable, str(PIPELINE), "--root", str(root), "init"],
                capture_output=True,
                text=True,
            )
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            project = root / "work/project"
            (project / "content.json").write_bytes(self.raw)
            (project / "node_modules").symlink_to(node_modules, target_is_directory=True)
            schema = subprocess.run(
                ["node", "scripts/content.cjs", "validate", str(project / "content.json")],
                cwd=project,
                capture_output=True,
                text=True,
            )
            self.assertEqual(schema.returncode, 0, schema.stderr or schema.stdout)
            validate = subprocess.run(
                [sys.executable, str(PIPELINE), "--root", str(root), "validate"],
                capture_output=True,
                text=True,
            )
            self.assertEqual(validate.returncode, 0, validate.stdout + validate.stderr)
            payload = json.loads(validate.stdout.strip().splitlines()[-1])
            self.assertIs(payload.get("ok"), True)


if __name__ == "__main__":
    unittest.main()
