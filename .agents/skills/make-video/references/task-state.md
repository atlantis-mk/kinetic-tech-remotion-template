# 任务状态

空白状态来自 assets/task-template.json，status=not_started、stage=intake，未知用 null/空集合。仅 init 缺失时创建，重复 init 不覆盖。一个根 work 只对应当前一条视频。

brief 记录用户要求与 assumptions，video/audio/timeline/cover 记录采用的参数摘要，assets 记录原件和派生件，project 指向 work/project。content.json 才是渲染参数的唯一来源，摘要必须由 AI 同步核对，不要让 task.video 与它各自驱动画面。

stage: intake → planning → production → preview → delivery。completed_stages、checks、artifacts 只记录实际完成的工作与存在的文件；updated_at 使用带时区 ISO8601。checks 分 technical / visual / audio，结果 passed / failed / not_run，附对象、范围、时间。脚本不会把任务自动设为 completed。

恢复先核对实际文件与检查报告，不能只凭旧状态。修改主题、时间轴、音频或素材后，移除受影响阶段及后续完成记录，更新 next_action。render-manifest 的 fingerprint 会使旧交付失效，verify 会检查实际输出 SHA256。

默认交付使用空 deliverables 清单。自定义清单元素是根相对的 `{path,type,width,height}`，必须是 work/delivery 内直接、不重复的 .mp4/.png 文件，视频尺寸必须等于实际画幅，封面仅支持内置三种尺寸。变更清单后运行 render/verify。产物只记实际存在文件，不从默认清单预填完成记录。

技术验证通过不表示视觉或听觉通过；无法实际收听时记录 not_run 并说明原因。所有交付与必要验收实际完成后，AI 才可设 completed。
