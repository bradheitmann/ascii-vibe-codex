# src/ascii_vibe/aliases.py
import re
from typing import Tuple

LABEL_ALIASES_CJK = {
    "温度": "ONDO", "経路": "ROUTE", "顧客": "CUSTOMER", "速度": "SPEED",
    "時間": "TIME", "数量": "QTY", "最大": "MAX",
}
EMOJI_TO_ASCII = {
    "🔥": "FIRE","💧":"WATER","🌳":"TREE","⚡":"ELEC","❤️":"HEART","🚀":"ROCKET","📦":"BOX","🐍":"PYTHON"
}
UNIT_ALIASES = {
    "metric": {"ms":"milliseconds","s":"seconds","m":"minutes","h":"hours"},
    "data":   {"B":"bytes","KB":"kilobytes","MB":"megabytes","GB":"gigabytes","TB":"terabytes"},
    "percent": "%",
    "currency": {"USD":"$","EUR":"€","JPY":"¥","GBP":"£"},
}

# Heuristics per Section 2 unicode rules
_CJK = re.compile(r"[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]")
_EMOJI = re.compile(r"[\U0001F000-\U0001FAFF\u2600-\u27BF]")

def contains_cjk_or_emoji(s: str) -> bool:
    return bool(_CJK.search(s) or _EMOJI.search(s))

def alias_label(label: str) -> str:
    if label in LABEL_ALIASES_CJK: return LABEL_ALIASES_CJK[label]
    # replace any emoji found with ASCII label
    out = []
    for ch in label:
        out.append(EMOJI_TO_ASCII.get(ch, ch))
    return "".join(out)

def unit_symbol(unit: str) -> str:
    # percent passes through
    if unit == "%": return "%"
    # currency symbol preference
    for m in ("currency","metric","data"):
        table = UNIT_ALIASES.get(m, {})
        if unit in table: return table[unit]
    return unit  # fallback