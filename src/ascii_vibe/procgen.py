# src/ascii_vibe/procgen.py
from typing import List, Union

def xorshift32(seed: int) -> int:
    """Deterministic PRNG using xorshift32 algorithm"""
    x = seed & 0xFFFFFFFF
    x ^= (x << 13) & 0xFFFFFFFF
    x ^= (x >> 17)
    x ^= (x << 5) & 0xFFFFFFFF
    return x & 0xFFFFFFFF

def rand_sequence(seed: int, count: int) -> List[int]:
    """Generate deterministic sequence of random values"""
    state = seed
    values = []
    for _ in range(count):
        state = xorshift32(state)
        values.append(state)
    return values

SPARK_UNI = ["▁","▂","▃","▄","▅","▆","▇","█"]
SPARK_ASC = [".","-","=","#"]

def sparkline(vals: List[Union[float, int]], ascii_only: bool = False, seed: int = None) -> str:
    """Generate deterministic sparkline from values with optional seeded variations"""
    if not vals: 
        return ""
    
    # Convert to floats
    float_vals = [float(v) for v in vals]
    
    lo, hi = min(float_vals), max(float_vals)
    if hi == lo: 
        # All values equal - use minimum spark character
        palette = SPARK_ASC if ascii_only else SPARK_UNI
        return palette[0] * len(vals)
    
    palette = SPARK_ASC if ascii_only else SPARK_UNI
    out = []
    
    for i, v in enumerate(float_vals):
        # Map value to palette index
        normalized = (v - lo) / (hi - lo)  # 0.0 to 1.0
        idx = round(normalized * (len(palette) - 1))
        idx = max(0, min(len(palette) - 1, idx))
        
        # Optional seeded variation (for procedural texture)
        if seed is not None:
            variation_seed = seed + i * 1337  # deterministic per-position seed
            if xorshift32(variation_seed) % 10 == 0:  # 10% chance of variation
                # Slight variation in character selection
                variation = (xorshift32(variation_seed * 2) % 3) - 1  # -1, 0, 1
                idx = max(0, min(len(palette) - 1, idx + variation))
        
        out.append(palette[idx])
    
    return "".join(out)

def braid(width: int, ascii_only: bool = False, seed: int = None) -> str:
    """Generate decorative braided separator line"""
    if width <= 0:
        return ""
    
    a, b = ("/","\\") if ascii_only else ("╱","╲")
    
    if seed is None:
        # Simple alternating pattern
        return "".join(a if i % 2 == 0 else b for i in range(width))
    else:
        # Seeded variation with occasional pattern breaks
        out = []
        state = seed
        for i in range(width):
            state = xorshift32(state)
            # Mostly alternating with occasional random variations
            if state % 20 == 0:  # 5% chance of variation
                char = b if i % 2 == 0 else a  # reverse expected
            else:
                char = a if i % 2 == 0 else b  # normal alternating
            out.append(char)
        return "".join(out)

def density_field(width: int, height: int, density: float = 0.3, ascii_only: bool = False, seed: int = 42) -> List[str]:
    """Generate a rectangular field with seeded density patterns"""
    if width <= 0 or height <= 0:
        return []
    
    fill_char = "#" if ascii_only else "▓"
    empty_char = " "
    
    # Clamp density
    density = max(0.0, min(1.0, density))
    threshold = int(density * 0xFFFFFFFF)
    
    lines = []
    state = seed
    
    for y in range(height):
        line = []
        for x in range(width):
            state = xorshift32(state)
            char = fill_char if state < threshold else empty_char
            line.append(char)
        lines.append("".join(line))
    
    return lines

def procedural_border(width: int, height: int, style: str = "rough", ascii_only: bool = False, seed: int = 42) -> List[str]:
    """Generate procedurally varied border with controlled roughness"""
    if width < 3 or height < 3:
        return []
    
    if ascii_only:
        chars = {"h": "-", "v": "|", "corner": "+", "rough": "~"}
    else:
        chars = {"h": "─", "v": "│", "corner": "┌", "rough": "≈"}
    
    lines = []
    state = seed
    
    for y in range(height):
        line = []
        for x in range(width):
            if y == 0 or y == height - 1:  # top/bottom
                if x == 0 or x == width - 1:  # corners
                    char = chars["corner"]
                else:  # horizontal edges
                    state = xorshift32(state)
                    if style == "rough" and state % 10 == 0:  # 10% roughness
                        char = chars["rough"]
                    else:
                        char = chars["h"]
            elif x == 0 or x == width - 1:  # left/right edges
                char = chars["v"]
            else:  # interior
                char = " "
            line.append(char)
        lines.append("".join(line))
    
    return lines