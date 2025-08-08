#!/usr/bin/env python3
import os, sys, yaml

# --- Config
BAR_WIDTH = 30
DATA = [40, 28, 10]
LABELS = ["API", "DB", "CACHE"]

def make_rows(values, labels, width=BAR_WIDTH):
    m = max(values) if values else 1
    rows = []
    for i, v in enumerate(values):
        n = round(v / m * width)
        label = (labels[i] if i < len(labels) else f"A{i+1}")[:6].ljust(6)
        rows.append(f'[{label}] ' + ('█' * n).ljust(width))
    return rows

def check_equal_width(rows):
    lens = list(map(len, rows))
    return (len(set(lens)) == 1, lens)

def check_proportions(values, rows, width=BAR_WIDTH):
    m = max(values) if values else 1
    ok, details = True, []
    for v, r in zip(values, rows):
        expected = round(v / m * width)
        actual = r.count("█")
        details.append((expected, actual))
        if expected != actual:
            ok = False
    return ok, details

def load_all_yaml_specs(spec_dir="specs"):
    loaded = []
    if not os.path.isdir(spec_dir):
        return loaded
    for name in sorted(os.listdir(spec_dir)):
        if name.endswith(".yaml") or name.endswith(".yml"):
            path = os.path.join(spec_dir, name)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    yaml.safe_load(f)
                loaded.append(path)
            except Exception as e:
                print(f"YAML PARSE ERROR in {path}: {e}")
                sys.exit(2)
    return loaded

def main():
    specs = load_all_yaml_specs()
    if specs:
        print("Loaded YAML specs:")
        for p in specs:
            print("  -", p)
    else:
        print("No YAML specs found (that’s OK for this smoke test).")

    rows = make_rows(DATA, LABELS, BAR_WIDTH)
    for r in rows:
        print(r)

    ok_w, lens = check_equal_width(rows)
    ok_p, details = check_proportions(DATA, rows, BAR_WIDTH)

    if not ok_w:
        print("FAIL: Row widths differ:", lens)
        sys.exit(1)
    if not ok_p:
        print("FAIL: Proportions wrong (expected, actual):", details)
        sys.exit(1)

    print("SMOKE TEST PASSED ✓")
    sys.exit(0)

if __name__ == "__main__":
    main()
