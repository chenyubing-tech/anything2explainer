# RAG 样片：H3 原创视频镜头计划

以下为 12 条不同的新素材创意，状态均为 `planned`。尚未提交生成任务，没有生成文件；不能作为成片已使用的素材统计。它们嵌入已有解说节拍，精确文字、数字和图表由 Remotion 叠加，不增加旁白时长。

统一美术：深海藏蓝、哑光纸张、黄铜细节、清晰主体轮廓、低饱和照明。场景之间共享材质，不要求每条都出现相同机房。目标使用时长为剪辑选段时长，实际生成时长按 H3 工具能力选择。

| asset_id | 关联镜头 | 叙事目的和唯一动作 | 目标使用 | 入点 → 出点与代码承接 |
|---|---|---|---|---|
| H3-RAG-01 | SC01 | 信息过载：纸张涌入，检索者只能抓住一页 | 3s | 纸张轮廓接代码文档卡；结尾中央空桌面接三个短板框 |
| H3-RAG-02 | SC02 | 知识截止：新资料停在关闭的档案窗口外 | 2–3s | 水平桌面接时间轴；窗口边缘接截止标记，右侧留新事件位置 |
| H3-RAG-03 | SC06 | 开卷考试：一本参考书在答卷旁翻开 | 3s | 代码考卷在左，生成书本在右；最后书本轮廓回到代码知识库图标 |
| H3-RAG-04 | SC12 | 解析：不同外观的无字文档进入分拣台，输出整洁纸页 | 3–4s | 左进右出，台面接代码解析器；输出页正视图接结构化文档卡 |
| H3-RAG-05 | SC13 | 切块：长卷在自然段的空隙处分为纸片 | 3s | 中央长纸页接文档卡；四个分离纸片接代码 chunk 阵列 |
| H3-RAG-06 | SC17/SC23 二选一 | 语义邻近：一个查询球靠近同材质小球群 | 3s | 查询球从左进入，结尾俯视；转代码点云后再画距离与标签 |
| H3-RAG-07 | SC18 | 索引跳转：从高处稀疏路标跳向下层密集路径 | 3–4s | 斜俯视三层空间接 HNSW 图；终点金球回到代码目标节点 |
| H3-RAG-08 | SC19 | 权限：证据页抵达一道闸门，通过后门关闭 | 2–3s | 证据向右，门框接 ACL 代码框；许可与拒绝标记仅在代码中显示 |
| H3-RAG-09 | SC20 | 增量更新：档案柜只替换一个抽屉中的一页纸 | 3s | 局部抽屉特写接代码文档卡；保留周围抽屉不动，结尾接 v2 标签 |
| H3-RAG-10 | SC26 | 重排：候选卡片依次经过筛选槽，少数进入前排 | 3–4s | 保持卡片向右运动；结尾正视两三张卡，代码再叠加真实排名 |
| H3-RAG-11 | SC28 | 中间被忽视：书页中间的书签被遮住，移向两端后显露 | 3s | 书签两端位置接代码上下文条；U 形曲线回到代码层，生成画面不画实验数据 |
| H3-RAG-12 | SC42–SC44 选一个节拍 | 开头回扣：从容地取出证据页放到答卷旁 | 3s | 回到 01/03 的材质和桌面，使用新动作与新镜头；最后答卷留白接总结文字 |

## 可直接提交的镜头提示词

每条均为独立生成任务。共同画面要求：one continuous shot, no readable text, no numerical charts, no internal cuts, keep the bottom band quiet for composited subtitles。下面的生成场景全部是视觉示意，不是论文实验录像。

**H3-RAG-01**

> In a navy-black archive, stacks of ivory paper slide toward a small brass desk from both sides while a solitary reader reaches for one page. Medium-wide shot, gentle forward dolly, matte materials, restrained warm rim light. End on the single selected page centered on the desk, with clear negative space above it. Show information overload without chaos obscuring the main action.

**H3-RAG-02**

> A brass archive service window closes while several new ivory documents arrive from the right and stop outside it. Side-on composition, slow lateral tracking to the right, dark navy surroundings, crisp silhouettes. End with the closed vertical window edge at the center and the new documents clearly visible on its right.

**H3-RAG-03**

> An ivory reference book opens beside a blank examination sheet on a navy desk. Top-down view, a subtle dolly toward the open book, warm brass edge light. Keep the sheet on the left and book on the right. End with the open book steady, its pages showing paper texture without readable writing.

**H3-RAG-04**

> Folded paper, a bound booklet and a loose sheet move from left to right through a compact brass sorting station and emerge as neat flat ivory pages. Three-quarter side view, a gentle rightward tracking shot, navy-black background. End with one clean page front-facing on the right half of the screen; leave the left half quiet for an explanatory overlay.

**H3-RAG-05**

> A long ivory scroll on a dark navy surface separates cleanly at four natural horizontal gaps into distinct rectangular pieces. Front-facing view, fixed camera, restrained brass highlights on the cut edges. The pieces spread vertically a small distance and settle, retaining the silhouette of the original page. No visible blades or printed words.

**H3-RAG-06**

> A single brass sphere enters from the left and moves toward a nearby cluster of ivory spheres on a dark navy plane. Several distant clusters remain still. Camera gently rises into a near top-down view as the query sphere settles beside the closest group. Keep a clear gap around the selected group for later code-drawn annotations.

**H3-RAG-07**

> A small brass beacon moves along a sparse elevated route, descends to a denser middle terrace and reaches a specific point on a dense lower terrace. Three stacked navy planes, ivory route markers, one continuous oblique tracking shot following the beacon. End on the lower terrace with the beacon at the right of center, stationary and unobstructed.

**H3-RAG-08**

> A single ivory evidence page approaches a rectangular brass gate from the left. The gate opens, the page passes through to the right, and the gate closes behind it. Side-on shot, minimal navy-black environment, crisp movement and restrained lighting. End with the gate frame centered and the page visible on its right.

**H3-RAG-09**

> Close-up of a navy archive cabinet with brass drawer handles. One drawer opens and a single old ivory page is replaced by a fresh page while every surrounding drawer stays still. Slow controlled push toward that drawer. End on its rectangular front face with room for a small version label to be composited later.

**H3-RAG-10**

> A row of ivory cards moves from left to right through a narrow brass sorting slot. A few cards slide forward into a clear front row while the remaining cards stay behind. Camera tracks with the selected cards, finishing on a frontal view of three evenly spaced cards on a navy background. No numbers or lettering on the cards.

**H3-RAG-11**

> A narrow brass bookmark sits hidden among the middle pages of a thick ivory book. The bookmark slides toward the beginning of the book and becomes clearly visible beside an existing bookmark near the end. Oblique close-up, steady camera, navy-black desk, soft directional light. Finish with both edge bookmarks visible and the middle pages subdued.

**H3-RAG-12**

> Return to a navy examination desk with an open ivory reference book on the right and a blank answer sheet on the left. A reader calmly takes one selected evidence page from the book and places it beside the answer sheet. Gentle pullback, matte paper, warm brass details matching the earlier archive. End on the uncluttered desk with quiet upper space for a concluding code-drawn title.

## 验收与落盘

生成后逐条补充工具返回的任务 id、实际时长、文件路径及 `generated/accepted/rejected` 状态。对比相邻代码帧与视频入出点，确认物体形状、位置和运动方向；不合格的选段重剪或重生成。未生成前不往 `FOOTAGE_Gn` 写不存在的媒体路径。
