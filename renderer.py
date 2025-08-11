# src/ascii_vibe/renderer.py
from typing import Dict, List, Tuple

def _scale_bar_len(value: float, vmax: float, width: int) -> int:
    if vmax <= 0: 
        return 0
    # half-up
    return int(round((value / vmax) * width))

def render_bar_chart_ascii(title: str, series: Dict[str, float], width: int) -> str:
    """
    Deterministic ASCII horizontal bar chart (legacy simple renderer).
    - Labels in [BRACKETS] on the left, fixed bar width, value at end.
    - Ruler on bottom.
    """
    if not series:
        return f"{title}\n( no data )"

    labels = list(series.keys())
    values = list(series.values())
    vmax = max(values) if values else 0

    label_col = max(len(l) for l in labels)
    label_fmt = "[{:<" + str(label_col) + "}] "

    rows: List[str] = [title]
    for label in labels:
        v = series[label]
        n = _scale_bar_len(v, vmax, width)
        bar = "█" * n + " " * (width - n)
        rows.append(label_fmt.format(label) + bar + f" {int(v)}")

    # bottom ruler for visual check
    ruler_top = " " * (label_col + 3) + "|" + "-" * (width - 2) + "|"
    ticks = [0, 0.25, 0.5, 0.75, 1.0]
    vmax_int = int(round(vmax))
    tick_labels = [str(int(round(t * vmax_int))) for t in ticks]

    tick_row = " " * (label_col + 3)
    pos_chars = 0
    for i, t in enumerate(ticks):
        target = int(round(t * width))
        label = tick_labels[i]
        if target < len(label):
            target = len(label)
        pad = max(0, target - pos_chars - len(label))
        tick_row += " " * pad + label
        pos_chars += pad + len(label)

    rows.append(ruler_top)
    rows.append(tick_row)
    return "\n".join(rows)


# ========================= SWISS FULL-BLOCK RENDERER =========================

def _half_up_int(x: float) -> int:
    return int(round(x))

def _prepare_swiss_fields(labels: List[str], values: List[float],
                          total_width: int, bar_width: int | None) -> Tuple[int,int,int,int]:
    """
    Decide widths for label field, bar field, value field so that:
      left_cap(1) + sp(1) + LABEL(L) + sp(1) + BAR(B) + sp(1) + VALUE(V) + sp(1) + right_cap(1)
    == total_width
    So: L + B + V + 6 == total_width
    """
    # label shown as [LABEL]; pick the widest once bracketed
    label_field = max(len(f"[{l}]") for l in labels) if labels else 7
    # value field: at least 2 chars for 0..99, grows if needed
    value_field = max(2, max(len(str(int(v))) for v in values) if values else 2)

    if bar_width is None:
        bar_field = total_width - (label_field + value_field + 6)
    else:
        # reconcile to keep row width exact
        bar_field = total_width - (label_field + value_field + 6)
        # if the provided bar_width is smaller, we use that, then we add trailing spaces
        # but visible width must still be 'bar_field'; rendering function pads.
        # So we keep bar_field as computed exact fill; and use provided for proportional scaling max.
        pass

    if bar_field < 0:
        # fallback: shrink label before failing
        shrink = min(label_field - 3, -bar_field)  # keep some label room
        label_field -= shrink
        bar_field = total_width - (label_field + value_field + 6)

    if bar_field < 1:
        bar_field = 1

    return label_field, bar_field, value_field, total_width

def render_swiss_full_block_bar(
    title: str,
    labels: List[str],
    values: List[float],
    total_width: int = 50,
    bar_width: int | None = 35,
) -> str:
    """
    Swiss full-block band with aligned right caps and values.
    Each data row is EXACTLY total_width characters.

    Row template:
      '█' + ' ' + LABEL(L) + ' ' + BAR(B) + ' ' + VALUE(V) + ' ' + '█'
    Where L + B + V + 6 == total_width.
    BAR is proportional using half-up rounding against max(values) and B as the bar field width.
    """
    assert len(labels) == len(values), "labels and values must be same length"
    if not labels:
        return title

    L, B, V, W = _prepare_swiss_fields(labels, values, total_width, bar_width)
    vmax = max(values)
    top_band = "█" * W
    lines: List[str] = [top_band]

    # centered title row between bands
    title_row_inner = f" {title} "
    if len(title_row_inner) > (W - 2):
        title_row_inner = " " + title[:max(0, W - 4)] + " "
    pad_left = (W - len(title_row_inner)) // 2
    pad_right = W - len(title_row_inner) - pad_left
    lines.append("█" * pad_left + title_row_inner + "█" * pad_right)

    # mid band
    lines.append("█" * W)

    # data rows
    for label, val in zip(labels, values):
        label_txt = f"[{label}]"
        label_padded = label_txt + " " * (L - len(label_txt)) if len(label_txt) < L else label_txt[:L]
        n = _scale_bar_len(val, vmax, B)
        bar_seg = "█" * n + " " * (B - n)
        value_txt = str(int(round(val)))
        value_field = " " * (V - len(value_txt)) + value_txt

        row = "█" + " " + label_padded + " " + bar_seg + " " + value_txt.rjust(V, " ") + " " + "█"
        # assert exact width in Python chars
        if len(row) != W:
            # last-resort clip/pad to preserve invariants
            if len(row) > W:
                row = row[:W]
            else:
                row = row + " " * (W - len(row))
        lines.append(row)

    # bottom band
    lines.append("█" * W)
    return "\n".join(lines)

