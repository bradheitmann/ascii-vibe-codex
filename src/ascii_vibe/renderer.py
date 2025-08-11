# src/ascii_vibe/renderer.py
from typing import Dict, List, Tuple
import math
from .charlib import get_style_pack
from .aliases import contains_cjk_or_emoji, alias_label

# ---------- helpers ----------

def _round_half_up(x: float) -> int:
    return int(math.floor(x + 0.5))

def _scale_bar_len(value: float, vmax: float, width: int) -> int:
    if vmax <= 0: return 0
    frac = value / vmax
    return max(0, min(width, _round_half_up(frac * width)))

def _build_horizontal_ruler(width: int, tick_positions=(0.0,0.25,0.5,0.75,1.0), tick="|", fill="-") -> str:
    cols = [""] * width
    for i in range(width):
        cols[i] = fill
    for p in tick_positions:
        idx = min(width-1, max(0, _round_half_up(p * width)))
        cols[idx] = tick
    return "".join(cols)

def _any_cjk_or_emoji(labels: List[str]) -> bool:
    return any(contains_cjk_or_emoji(l) for l in labels)

def render_bar_chart_ascii(title: str, series: Dict[str, float], width: int,
                           style_pack: str = "bold_unicode",
                           show_scale: bool = True,
                           ascii_only: bool = False) -> str:
    """
    Canonical Section-2-compliant horizontal bar chart with:
    - dynamic field widths
    - CJK/emoji legend indexing
    - percentage tick ruler
    - style pack fill/ruler
    """
    if not series:
        return f"{title}\n( no data )"

    # style pack selection with ascii forcing
    if ascii_only:
        style_pack = "minimal_ascii"
    sp = get_style_pack(style_pack)
    fill = sp["fill"]
    empty = " "  # keep bar body padding as space to preserve visual proportions

    labels = list(series.keys())
    values = list(series.values())
    vmax = max(values) if values else 0.0
    total = sum(values) if values else 0.0

    # Legend indexing if any label has CJK/emoji, per Section 2
    needs_legend = _any_cjk_or_emoji(labels)
    legend_index = {lbl: str(i+1) for i, lbl in enumerate(labels)} if needs_legend else None

    # Field widths (labels become [X] if legend used; else alias to ASCII)
    resolved_labels = []
    for lbl in labels:
        shown = legend_index[lbl] if needs_legend else alias_label(lbl)
        resolved_labels.append(shown)

    label_col_width = max(6, max(len(x) for x in resolved_labels))
    max_value_len   = max(len(str(int(v))) for v in values) if values else 1
    # percent computation uses total; avoid div0
    percents = [int(_round_half_up((v/total)*100)) if total>0 else 0 for v in values]
    max_percent_len = max(len(str(p)) for p in percents) if percents else 1

    rows: List[str] = [title]

    if needs_legend:
        rows.append("Labels:")
        for i, lbl in enumerate(labels, 1):
            rows.append(f"  {i}. {alias_label(lbl)}")

    # Bars
    for i, lbl in enumerate(labels):
        v = values[i]
        n = _scale_bar_len(v, vmax, width)
        bar = (fill * n) + (empty * (width - n))
        tag = f"[{resolved_labels[i]:<{label_col_width}}]"
        valpct = f"{int(v):>{max_value_len}} ({percents[i]:>{max_percent_len}}%)"
        rows.append(f"{tag} {bar} {valpct}")

    # Ruler and tick row
    if show_scale:
        label_space = label_col_width + 3  # "[..] "
        ruler = _build_horizontal_ruler(width, tick=sp["ruler"], fill="-")
        rows.append(" " * label_space + ruler)

        tick_positions = (0.0,0.25,0.5,0.75,1.0)
        tick_vals = [str(int(_round_half_up(p * vmax))) for p in tick_positions]
        tick_row = " " * label_space
        pos_chars = 0
        for p, lab in zip(tick_positions, tick_vals):
            target = _round_half_up(p * width)
            pad = max(0, target - pos_chars - len(lab))
            tick_row += (" " * pad) + lab
            pos_chars += pad + len(lab)
        rows.append(tick_row)

    return "\n".join(rows)

# ---------- Swiss full-block band (caps + aligned values) ----------

def render_swiss_full_block_bar(
    title: str,
    labels: List[str],
    values: List[int],
    total_width: int = 50,
    bar_width: int = 35,
) -> str:
    """
    Swiss full-block band: full '█' cap rows, bars with aligned right caps & values.
    Every bar row is EXACTLY total_width characters.

    Row layout (all fixed slots):
      0         1      L   1     B     1   2  1  1
      █ + space + [LABEL] + space + BAR + space +VV+space+█  == total_width

    Where:
      L = label_field_width (including the brackets)
      B = bar_width
      VV = 2-digit value (right-aligned)
    """
    W = int(total_width)
    B = int(bar_width)
    if not labels or not values or len(labels) != len(values):
        return title or ""

    vmax = max(values) if values else 0
    if vmax <= 0:
        vmax = 1  # avoid div/0, render empties

    # Compute the label field width so the whole row sums to W.
    #  left cap(1) + sp(1) + L + sp(1) + B + sp(1) + value(2) + sp(1) + right cap(1) = W
    # => L = W - (B + 8)
    L = W - (B + 8)
    if L < 4:
        raise ValueError(f"total_width={W} too small for bar_width={B}")

    # Inner label width (inside [ … ]) is label_field minus the brackets.
    L_inner = L - 2
    # Build lines
    lines: List[str] = []

    # Top full cap
    lines.append("█" * W)

    # Centered title (kept within side caps, not counted as a cap row)
    title_inner = (title or "").upper().center(W - 2)
    lines.append("█" + title_inner + "█")

    # Optional thin spacer (kept consistent width)
    # lines.append("█" + " " * (W - 2) + "█")

    # Bar rows
    for lab, val in zip(labels, values):
        # normalize label; allow already-bracketed strings
        raw = lab.strip()
        if raw.startswith("[") and raw.endswith("]"):
            raw = raw[1:-1].strip()
        label_inner = raw.upper().ljust(L_inner)[:L_inner]
        label_block = "[" + label_inner + "]"

        n = int(round((float(val) / float(vmax)) * B))
        bar_seg = "█" * n + " " * (B - n)
        val_txt = f"{int(val):>2}"

        row = (
            "█"
            + " "
            + label_block
            + " "
            + bar_seg
            + " "
            + val_txt
            + " "
            + "█"
        )

        # Hard assert in dev; guarantees deterministic width
        if len(row) != W:
            # Trim or pad defensively (should never trigger)
            row = (row[:W]) if len(row) > W else (row + " " * (W - len(row)))
        lines.append(row)

    # Bottom full cap
    lines.append("█" * W)

    return "\n".join(lines)

# ---------- quick demo (optional) ----------

if __name__ == "__main__":
    demo = {
        "API": 40,
        "DB": 25,
        "CACHE": 5,
    }
    print(render_bar_chart_ascii("Performance", demo, width=30))
    print()
    print(
        render_swiss_full_block_bar(
            "SALES BY REGION",
            ["[NORTH]", "[SOUTH]", "[EAST ]"],
            [45, 30, 10],
            total_width=50,
            bar_width=35,
        )
    )

