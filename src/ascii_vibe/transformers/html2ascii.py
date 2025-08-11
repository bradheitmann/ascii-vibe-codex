# src/ascii_vibe/transformers/html2ascii.py
from html.parser import HTMLParser
from textwrap import wrap

SWISS_MAX_LINE = 80  # clamp later by CLI width
BULLET = "- "

def _wrap(text: str, width: int) -> list[str]:
    # Swiss: flush-left, ragged-right; hyphenation left to upstream systems
    lines = []
    for para in text.splitlines():
        chunk = para.strip()
        if not chunk:
            lines.append("")
        else:
            lines.extend(wrap(chunk, width=width, break_long_words=False, replace_whitespace=True))
    return lines

class _SwissHTML(HTMLParser):
    def __init__(self, width: int, ascii_only: bool):
        super().__init__(convert_charrefs=True)
        self.width = width
        self.ascii_only = ascii_only
        self.out: list[str] = []
        self._buf = ""
        self._in_li = False
        self._table = None  # structured table state

    # --- helpers
    def _flush_buf_as_paragraph(self):
        txt = " ".join(self._buf.split())
        self._buf = ""
        if txt:
            self.out.extend(_wrap(txt, self.width))
            self.out.append("")

    def _flush_table_structured(self, rows: list[list[str]]):
        if not rows: return
        # detect numeric columns
        from ..numbers import is_numeric_like, split_decimal_for_align
        numeric_cols = set()
        for r in rows[1:]:  # skip header
            for j, c in enumerate(r):
                if is_numeric_like(c):
                    numeric_cols.add(j)

        # compute column widths with decimal alignment
        left_w, right_w = {}, {}
        for j in range(len(rows[0])):
            if j in numeric_cols:
                lw = rw = 0
                for r in rows[1:]:
                    if j < len(r):
                        prefix, left, right = split_decimal_for_align(r[j])
                        lw = max(lw, len(prefix) + len(left))
                        rw = max(rw, len(right))
                left_w[j], right_w[j] = lw, rw
            else:
                w = max(len(r[j]) if j < len(r) else 0 for r in rows)
                left_w[j], right_w[j] = w, 0

        def fmt_cell(j, text, is_header=False):
            if j in numeric_cols and not is_header:
                prefix, left, right = split_decimal_for_align(text)
                mid = " " if right == "" else "."
                return f" {prefix}{left:>{left_w[j]-len(prefix)}}{mid}{right:<{right_w[j]}} "
            else:
                w = left_w[j]
                return f" {text:<{w}} "

        # build ASCII grid
        def bar():
            segs = []
            for j in range(len(rows[0])):
                cell_w = (left_w[j] + (1 if right_w[j] else 0) + right_w[j]) + 2
                segs.append("-" * cell_w)
            return "+" + "+".join(segs) + "+"

        out = [bar()]
        header = rows[0]
        out.append("|" + "|".join(fmt_cell(j, c, is_header=True) for j, c in enumerate(header)) + "|")
        out.append(bar())
        for r in rows[1:]:
            out.append("|" + "|".join(fmt_cell(j, (r[j] if j < len(r) else "")) for j in range(len(header))) + "|")
        out.append(bar())
        self.out.extend(out)
        self.out.append("")

    # --- tag handlers
    def handle_starttag(self, tag, attrs):
        if tag in ("h1","h2","h3"):
            self._flush_buf_as_paragraph()
        elif tag == "p":
            self._flush_buf_as_paragraph()
        elif tag == "li":
            self._flush_buf_as_paragraph()
            self._in_li = True
        elif tag == "ul" or tag == "ol":
            self._flush_buf_as_paragraph()
        elif tag == "table":
            self._flush_buf_as_paragraph()
            self._table = {"rows": [], "row": None, "cell": None, "header_done": False}
        elif tag == "tr" and self._table is not None:
            self._table["row"] = []
        elif tag in ("th","td") and self._table is not None:
            self._table["cell"] = ""
        elif tag in ("tr","th","td"):
            pass
        elif tag in ("pre","code"):
            self._flush_buf_as_paragraph()

    def handle_endtag(self, tag):
        if tag in ("h1","h2","h3"):
            title = self._buf.strip()
            self._buf = ""
            if title:
                self.out.append(title)
                underline = "-" * min(self.width, max(4, len(title)))
                self.out.append(underline)
                self.out.append("")
        elif tag == "p":
            self._flush_buf_as_paragraph()
        elif tag == "li":
            content = " ".join(self._buf.split())
            self._buf = ""; self._in_li = False
            if content:
                bullet = BULLET
                wrapped = _wrap(content, self.width - len(bullet))
                if wrapped:
                    self.out.append(bullet + wrapped[0])
                    for w in wrapped[1:]:
                        self.out.append(" " * len(bullet) + w)
                self.out.append("")
        elif tag == "ul" or tag == "ol":
            self.out.append("")
        elif tag in ("th","td") and self._table is not None:
            cell = " ".join(self._table["cell"].split())
            self._table["row"].append(cell)
            self._table["cell"] = None
        elif tag == "tr" and self._table is not None:
            if self._table["row"] is not None:
                self._table["rows"].append(self._table["row"])
            self._table["row"] = None
        elif tag == "thead" and self._table is not None:
            self._table["header_done"] = True
        elif tag == "table" and self._table is not None:
            self._flush_table_structured(self._table["rows"])
            self._table = None
        elif tag == "tr":
            pass
        elif tag in ("th","td"):
            pass
        elif tag in ("pre","code"):
            if self._buf:
                # fence code block; keep as-is but width-clamped by caller
                self.out.append(self._buf.rstrip())
                self.out.append("")
                self._buf = ""

    def handle_data(self, data):
        if self._table is not None and self._table["cell"] is not None:
            self._table["cell"] += data
        elif self._in_li:
            self._buf += data
        else:
            self._buf += data

def html_to_swiss_ascii(html: str, width: int = 60, ascii_only: bool = False, 
                       currency: str = "USD", thousands_sep: str = "thin_space", 
                       negatives: str = "parentheses") -> str:
    width = max(40, min(width, SWISS_MAX_LINE))
    p = _SwissHTML(width=width, ascii_only=ascii_only)
    p.feed(html)
    p._flush_buf_as_paragraph()
    return "\n".join(line[:width] for line in p.out)