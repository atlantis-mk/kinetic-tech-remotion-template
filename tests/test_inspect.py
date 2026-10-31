"""V2-06b / V2-06c：最小 inspect。

实现前没有 inspect 子命令，故为红。实现后本文件零 diff。
不把 layers / transition 执行列为必过。

钉死契约：
  - `pipeline.py inspect` 与 env/init/validate/check/preview/render/verify 并列，不替换这七个命令。
  - 模板完整时退出码 0，stdout 最后一行 JSON 且 ok 为 true。
  - 缺少 src/component-catalog.json 时退出码为 5（输入／完整性错误），
    且 stdout 或 stderr 含子串 catalog。不得表现为 argparse invalid choice。
"""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PIPELINE = ROOT / ".agents/skills/make-video/scripts/pipeline.py"
TEMPLATE_REL = Path(".agents/skills/make-video/assets/project-template")
CATALOG_REL = TEMPLATE_REL / "src/component-catalog.json"
SEVEN = ("env", "init", "validate", "check", "preview", "render", "verify")
NODE_MODULES = ROOT / TEMPLATE_REL / "node_modules"


def run_pipeline(root, *args):
    return subprocess.run(
        [sys.executable, str(PIPELINE), "--root", str(root), *args],
        capture_output=True,
        text=True,
    )


class InspectTests(unittest.TestCase):
    def make_root(self):
        tmp = tempfile.TemporaryDirectory(prefix="v2-inspect-")
        root = Path(tmp.name)
        shutil.copytree(
            ROOT / ".agents",
            root / ".agents",
            ignore=shutil.ignore_patterns("node_modules", "__pycache__", ".git"),
            symlinks=True,
        )
        shutil.copy2(ROOT / "README.md", root / "README.md")
        if NODE_MODULES.is_dir():
            link = root / TEMPLATE_REL / "node_modules"
            link.symlink_to(NODE_MODULES, target_is_directory=True)
        self.addCleanup(tmp.cleanup)
        return root

    def test_v2_06b_inspect_succeeds_on_intact_template(self):
        root = self.make_root()
        proc = run_pipeline(root, "inspect")
        blob = proc.stdout + proc.stderr
        self.assertNotIn("invalid choice", blob, "inspect 须是已注册子命令")
        self.assertEqual(proc.returncode, 0, blob)
        lines = [line for line in proc.stdout.splitlines() if line.strip()]
        self.assertTrue(lines, "inspect 成功时 stdout 须输出单行 JSON")
        payload = json.loads(lines[-1])
        self.assertIs(payload.get("ok"), True)

    def test_v2_06b_inspect_exit_5_when_catalog_missing(self):
        root = self.make_root()
        catalog = root / CATALOG_REL
        if catalog.exists() or catalog.is_symlink():
            catalog.unlink()
        proc = run_pipeline(root, "inspect")
        blob = proc.stdout + proc.stderr
        self.assertNotIn("invalid choice", blob, "inspect 须是已注册子命令，完整性失败才返回 5")
        self.assertEqual(proc.returncode, 5, blob)
        self.assertRegex(blob, r"catalog")

    def test_v2_06c_inspect_does_not_replace_seven_commands(self):
        proc = subprocess.run([sys.executable, str(PIPELINE), "--help"], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        for name in (*SEVEN, "inspect"):
            self.assertIn(name, proc.stdout)
        isolated = Path(tempfile.mkdtemp(prefix="v2-env-"))
        self.addCleanup(lambda: shutil.rmtree(isolated, ignore_errors=True))
        env = run_pipeline(isolated, "env")
        self.assertEqual(env.returncode, 0, env.stdout + env.stderr)
        self.assertFalse((isolated / "work").exists(), "env 不得初始化 work/")


if __name__ == "__main__":
    unittest.main()
