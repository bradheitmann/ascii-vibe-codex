# src/ascii_vibe/qc.py
from typing import Dict

def validate_row_widths(lines: list[str]) -> bool:
    """Check if all non-empty lines have equal width"""
    non_empty = [line for line in lines if line.strip()]
    if not non_empty:
        return True
    return len(set(len(line) for line in non_empty)) == 1

def validate_bar_proportions(lines: list[str], data: dict, width: int) -> bool:
    """Validate that bar proportions match expected mathematical ratios"""
    bar_lines = [line for line in lines if line.strip().startswith("[")]
    if not bar_lines or not data:
        return True
    
    values = list(data.values())
    max_val = max(values) if values else 1
    
    for i, line in enumerate(bar_lines):
        if i < len(values):
            expected_chars = round(values[i] / max_val * width)
            actual_chars = line.count("█") + line.count("=")  # both fill styles
            if expected_chars != actual_chars:
                return False
    return True

class ValidationError(Exception):
    pass

def qc_block(text: str, data=None, width: int | None = None) -> Dict[str, bool]:
    lines = text.splitlines()
    out = {"width_ok": True, "proportions_ok": True, "borders_ok": True}
    
    try:
        if not validate_row_widths(lines):
            out["width_ok"] = False
    except Exception:
        out["width_ok"] = False
    
    if data is not None and width is not None:
        try:
            if not validate_bar_proportions(lines, data, width):
                out["proportions_ok"] = False
        except Exception:
            out["proportions_ok"] = False
    
    # Borders heuristic: if any line starts/ends with mismatched frame chars, flag false.
    frame_chars = {"┌","┏","╔","+","│","┃","║","|","┐","┓","╗","└","┗","╚","─","━","═","-"}
    for line in lines:
        if line and any(c in frame_chars for c in line):
            # Simple heuristic: check if line looks like it should be symmetric but isn't
            if line.startswith(("┌","┏","╔","+")) and not line.endswith(("┐","┓","╗","+")):
                out["borders_ok"] = False
                break
            if line.startswith(("└","┗","╚","+")) and not line.endswith(("┘","┛","╝","+")):
                out["borders_ok"] = False
                break
    
    return out

def qc_footer(qc: Dict[str,bool], expected_width: int, widths_list: list[int], seed: str) -> str:
    return (
        f"QC: width_ok={qc.get('width_ok', True)} expected={expected_width} "
        f"widths={widths_list} math_ok={qc.get('proportions_ok', True)} "
        f"borders_ok={qc.get('borders_ok', True)} seed={seed}"
    )