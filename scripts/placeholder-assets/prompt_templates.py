#!/usr/bin/env python3
"""素材生成提示词模板 v2（版式锚定版）。

规范与实测依据：docs/design/2026-10-09-asset-prompt-spec.md
用法：
    from prompt_templates import poet_prompt, spot_prompt, cultural_prompt
    poet_prompt(name="刘禹锡", dynasty="隋唐", role="诗人",
                attire="幞头、圆领深青长袍", pose="负手而立，袍角当风",
                mood="神情豪迈不屈", scene="乌衣巷口、秦淮水波与朱雀桥，燕子斜飞",
                verse="沉舟侧畔千帆过")

设计要点（每一条都对应一次实测踩到的偏差）：
  · 显式给出画幅比例 → 防网格被裁切
  · 显式给出人物位置与占比 → 防缩成小像
  · 显式给出题名所在竖向条带（88%–98%）→ 防题名左移（陆机案例）
  · 显式给出单字高度占比 + 「不得放大为标题级」→ 防题名放大（陆机案例）
  · 显式给出「不得下移到画面中部」→ 防题名下移（王冕 / 刘禹锡案例）
  · 题款文字必须写死 + 「不得照搬参考图题款内容」→ 防图生图抄参考图文字（实测踩过）
  · 显式给出印章数量与相对边长 → 防印章缺失/过大
  · 人物重绘声明 → 防图生图沿用人脸（实测踩过）
"""

# 版式锚定图：同风格族且已验收的成品
LAYOUT_ANCHOR = "display-v2/public/images/poets/wang_zhi_huan_anime.webp"
LAYOUT_ANCHOR_ALT = "display-v2/public/images/poets/pu_songling_anime.webp"

# 图生图时建议的保真度：high 会连人物一起抄，medium 保留版式而不抄脸
INPUT_FIDELITY = "medium"

POET_TEMPLATE = """\
严格沿用参考图的版式：3:4 竖幅，半身人物居中偏左、头顶在画面高度 25% 处、身体延伸出下缘，\
淡墨点染背景并大量留白。**只沿用版式与画风，人物必须完全重绘\
（不得沿用参考图的面孔、胡须、服装与服饰颜色）**。

【人物】中国水墨人物画，工笔与写意结合，{dynasty}{role}{name}，{attire}，{pose}，{mood}。

【背景】以淡墨点染{scene}。

【题名】画面右上角竖排题写「{name}」，紧贴右上角，其所在竖向条带位于画面宽度 88%–98% 之间，\
首字上缘距画面顶边约 5% 画面高；单字高度约为画面高度的 4.5%（约为人物头部高度的三分之一），\
全名连排总高不超过画面高度的 15%；题名为小字题签，\
**绝不得放大为标题级，绝不得下移到画面中部**。

【题款】题名正下方紧接两列小字竖写，单字高约为题名的一半；\
**题款文字固定写「{verse}」，不得使用其它文字，不得照搬参考图的题款内容**。

【印章】题款末尾钤两方朱砂印章，上下排列，每方边长约为画面宽度的 3%。

【风格】仿古绢本设色，宣纸肌理，淡墨晕染，色调灰褐沉静，无现代元素，无水印。"""

SPOT_TEMPLATE = """\
中国青绿山水写意画，{aspect}横幅。

【主体】{scene}。

【构图】景深分前中远三层：近景以{foreground}压住画面下缘约三分之一；\
中景为主体，居画面中部略偏左；远景淡墨远山与留白，占画面上部约三分之一。

【题识】画面右上角留白处钤朱砂印章一方，边长约为画面宽度的 3%；\
**画面内不得出现任何文字、题款或书法**。

【风格】宣纸肌理，淡墨与青绿设色相济，笔触写意，色调灰褐沉静，无现代元素，无水印。

【版式锚定】画幅比例、主体位置与三层景深关系须与参考图一致，仅景物内容按本节描述绘制。"""

CULTURAL_TEMPLATE = """\
{aspect}暖调纪实摄影，山东地方民俗题材。

【主体】{subject}。

【构图】主体位于画面{pos}，占画幅约三分之二面积，四周留出环境交代；\
前中后景层次清晰，前景略虚化，主体焦点锐利。

【光线】{light}，暖色调，自然光，无生硬阴影。

【禁止项】**画面内不得出现任何文字、招牌文字或水印**；无人群特写，无现代电子设备。

【版式锚定】画幅比例与主体占比须与参考图一致，仅具体内容按本节描述拍摄。"""


def poet_prompt(name, dynasty, role, attire, pose, mood, scene, verse):
    return POET_TEMPLATE.format(dynasty=dynasty, role=role, name=name, attire=attire,
                                pose=pose, mood=mood, scene=scene, verse=verse)


def spot_prompt(scene, aspect="3:2", foreground="礁石与芦苇"):
    return SPOT_TEMPLATE.format(scene=scene, aspect=aspect, foreground=foreground)


def cultural_prompt(subject, aspect="1:1 方形", pos="中央偏左", light="侧逆光"):
    return CULTURAL_TEMPLATE.format(subject=subject, aspect=aspect, pos=pos, light=light)


# 已写死题款的诗人（避免模型自由发挥抄参考图）
VERSES = {
    "陆机": "文赋未就心游万古",
    "刘禹锡": "沉舟侧畔千帆过",
    "王冕": "疏影横斜水清浅",
}
