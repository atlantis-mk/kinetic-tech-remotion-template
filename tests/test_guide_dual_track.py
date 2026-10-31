"""V2-02 指南仓双轨说明。

本样板仓 PR 不修改 aivio-template-guide，也不克隆它。
V2-02a / V2-02b / V2-02c 在实现阶段由指南仓 PR 或门禁侧文档检查。
此处 skip，注明「指南仓另测」。
"""
import unittest

SKIP = "指南仓另测：V2-02 在实现阶段由 aivio-template-guide PR 或门禁侧文档检查；本样板仓不克隆、不修改指南仓"


@unittest.skip(SKIP)
class GuideDualTrackTests(unittest.TestCase):
    """断言写在此处供门禁对照；本仓 discover 不执行。"""

    def test_v2_02a_dual_track_section_and_copyable_example(self):
        self.fail("指南 README 须有「工程元数据 + aivio 展示元数据」双轨节，且含 aivio 块与至少两个工程字段的可复制示例")

    def test_v2_02b_topics_exclude_aivio_template(self):
        self.fail("指南仓 topics 不得含 aivio-template；由门禁侧 API／元数据检查")

    def test_v2_02c_schema_version_unrelated_to_card_protocol(self):
        self.fail("指南正文须注明工程 schema_version 与卡片／aivio.* 协议无关")


if __name__ == "__main__":
    unittest.main()
