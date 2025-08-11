# src/ascii_vibe/charlib.py
from dataclasses import dataclass

# Core character sets (subset of Section 3 wired for runtime use)
FULL_BLOCK = "█"
PARTIALS = ["▏","▎","▍","▌","▋","▊","▉"]
SHADE = {"light": "░", "medium": "▒", "dark": "▓"}

UNICODE_BOX = {
    "single": dict(h="─", v="│", tl="┌", tr="┐", bl="└", br="┘"),
    "double": dict(h="═", v="║", tl="╔", tr="╗", bl="╚", br="╝"),
    "heavy":  dict(h="━", v="┃", tl="┏", tr="┓", bl="┗", br="┛"),
}
ASCII_BOX = {"simple": dict(h="-", v="|", tl="+", tr="+", bl="+", br="+")}
RULERS = {"pipe": "|", "dash": "-", "plus": "+"}

STYLE_PACKS = {
    "minimal_ascii": dict(frame=ASCII_BOX["simple"], fill="=", empty=" ", ruler=RULERS["pipe"]),
    "bold_unicode":  dict(frame=UNICODE_BOX["heavy"],  fill="█", empty="░", ruler=RULERS["pipe"]),
    "double_frame":  dict(frame=UNICODE_BOX["double"], fill="▓", empty="░", ruler=RULERS["plus"]),
    "hatch_fill":    dict(frame=UNICODE_BOX["single"], fill="║", empty=" ", ruler=RULERS["dash"]),
}

def get_style_pack(name: str) -> dict:
    return STYLE_PACKS.get(name, STYLE_PACKS["minimal_ascii"])