# src/ascii_vibe/validators.py
import re
import difflib
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class ValidationResult:
    check_name: str
    passed: bool
    score: float  # 0.0 to 1.0
    message: str
    details: Dict = None

class ValidationError(Exception):
    pass

def validate_row_widths(lines: List[str], allow_empty: bool = True) -> ValidationResult:
    """Validate that all non-empty lines have equal width"""
    if not lines:
        return ValidationResult("row_widths", True, 1.0, "No lines to validate")
    
    # Filter lines based on policy
    filtered_lines = []
    for line in lines:
        if allow_empty:
            if line.strip():  # Only non-empty lines
                filtered_lines.append(line)
        else:
            filtered_lines.append(line)
    
    if not filtered_lines:
        return ValidationResult("row_widths", True, 1.0, "No applicable lines")
    
    widths = [len(line) for line in filtered_lines]
    unique_widths = set(widths)
    
    if len(unique_widths) == 1:
        return ValidationResult(
            "row_widths", True, 1.0, 
            f"All {len(filtered_lines)} lines have equal width ({widths[0]} chars)"
        )
    else:
        min_width, max_width = min(widths), max(widths)
        return ValidationResult(
            "row_widths", False, 0.0,
            f"Width mismatch: {len(unique_widths)} different widths (min: {min_width}, max: {max_width})",
            {"widths": widths, "unique_widths": list(unique_widths)}
        )

def validate_line_length(lines: List[str], min_chars: int = 45, max_chars: int = 72) -> ValidationResult:
    """Validate that lines fall within Swiss typography length guidelines"""
    if not lines:
        return ValidationResult("line_length", True, 1.0, "No lines to validate")
    
    violations = []
    too_short = 0
    too_long = 0
    
    for i, line in enumerate(lines):
        line_len = len(line.strip())
        if line_len == 0:  # Skip empty lines
            continue
            
        if line_len < min_chars:
            too_short += 1
            violations.append(f"Line {i+1}: {line_len} chars (too short)")
        elif line_len > max_chars:
            too_long += 1
            violations.append(f"Line {i+1}: {line_len} chars (too long)")
    
    total_violations = too_short + too_long
    content_lines = len([l for l in lines if l.strip()])
    
    if total_violations == 0:
        return ValidationResult(
            "line_length", True, 1.0,
            f"All {content_lines} lines within {min_chars}-{max_chars} char range"
        )
    else:
        score = max(0.0, 1.0 - (total_violations / content_lines))
        return ValidationResult(
            "line_length", score >= 0.9, score,
            f"{total_violations}/{content_lines} lines outside range ({too_short} short, {too_long} long)",
            {"violations": violations[:10], "total_violations": total_violations}
        )

def validate_accent_budget(text: str, max_accents_per_line: int = 3, max_total_ratio: float = 0.05) -> ValidationResult:
    """Validate Swiss accent budget - minimal decorative characters"""
    # Define accent/decorative characters (Swiss prefers minimal)
    accent_chars = set("!@#$%^&*()_+=[]{}|\\:;\"'<>?/~`")
    decorative_unicode = set("▁▂▃▄▅▆▇█▏▎▍▌▋▊▉╱╲─━═│┃║┌┐└┘┏┓┗┛╔╗╚╝")
    
    all_accents = accent_chars.union(decorative_unicode)
    
    lines = text.splitlines()
    violations = []
    total_accents = 0
    total_chars = 0
    
    for i, line in enumerate(lines):
        if not line.strip():
            continue
            
        line_accents = sum(1 for char in line if char in all_accents)
        total_accents += line_accents
        total_chars += len(line)
        
        if line_accents > max_accents_per_line:
            violations.append(f"Line {i+1}: {line_accents} accents (>{max_accents_per_line})")
    
    # Calculate overall ratio
    accent_ratio = total_accents / total_chars if total_chars > 0 else 0
    
    line_violations = len(violations)
    ratio_violation = accent_ratio > max_total_ratio
    
    if line_violations == 0 and not ratio_violation:
        return ValidationResult(
            "accent_budget", True, 1.0,
            f"Accent budget OK: {accent_ratio:.3f} ratio, max {max_accents_per_line}/line"
        )
    else:
        score = max(0.0, 1.0 - (line_violations / len(lines)) - (accent_ratio / max_total_ratio * 0.5))
        issues = []
        if line_violations > 0:
            issues.append(f"{line_violations} lines exceed {max_accents_per_line} accents")
        if ratio_violation:
            issues.append(f"Overall ratio {accent_ratio:.3f} > {max_total_ratio}")
            
        return ValidationResult(
            "accent_budget", False, score,
            "; ".join(issues),
            {"violations": violations[:5], "accent_ratio": accent_ratio}
        )

def validate_bar_proportions(lines: List[str], data: Dict, width: int) -> ValidationResult:
    """Validate that bar chart proportions match expected mathematical ratios"""
    if not data:
        return ValidationResult("bar_proportions", True, 1.0, "No data to validate against")
    
    # Find bar lines (lines that start with [label] pattern)
    bar_lines = []
    bar_pattern = re.compile(r'^\[([^\]]+)\]')
    
    for line in lines:
        if bar_pattern.match(line.strip()):
            bar_lines.append(line)
    
    if not bar_lines:
        return ValidationResult("bar_proportions", True, 1.0, "No bar lines found")
    
    values = list(data.values())
    max_val = max(values) if values else 1
    
    discrepancies = []
    for i, line in enumerate(bar_lines):
        if i >= len(values):
            break
            
        expected_chars = round(values[i] / max_val * width)
        
        # Count fill characters (both Unicode and ASCII)
        actual_chars = line.count("█") + line.count("=") + line.count("#")
        
        if expected_chars != actual_chars:
            discrepancies.append({
                "line": i + 1,
                "expected": expected_chars,
                "actual": actual_chars,
                "diff": abs(expected_chars - actual_chars)
            })
    
    if not discrepancies:
        return ValidationResult(
            "bar_proportions", True, 1.0,
            f"All {len(bar_lines)} bar proportions mathematically accurate"
        )
    else:
        total_error = sum(d["diff"] for d in discrepancies)
        max_possible_error = len(bar_lines) * width
        score = max(0.0, 1.0 - (total_error / max_possible_error))
        
        return ValidationResult(
            "bar_proportions", score >= 0.95, score,
            f"{len(discrepancies)}/{len(bar_lines)} bars have proportion errors",
            {"discrepancies": discrepancies[:5]}
        )

def validate_border_integrity(lines: List[str]) -> ValidationResult:
    """Validate that borders/frames have consistent characters and proper joins"""
    if not lines:
        return ValidationResult("border_integrity", True, 1.0, "No lines to validate")
    
    # Define border character sets
    unicode_sets = {
        "single": set("─│┌┐└┘"),
        "heavy": set("━┃┏┓┗┛"), 
        "double": set("═║╔╗╚╝"),
    }
    ascii_set = set("-|+")
    
    border_lines = []
    detected_style = None
    mixed_styles = False
    
    for i, line in enumerate(lines):
        # Check if line contains border characters
        line_border_chars = set()
        for char in line:
            if char in ascii_set:
                line_border_chars.add(char)
            else:
                for style, chars in unicode_sets.items():
                    if char in chars:
                        line_border_chars.add(char)
                        if detected_style is None:
                            detected_style = style
                        elif detected_style != style:
                            mixed_styles = True
        
        if line_border_chars:
            border_lines.append((i + 1, line_border_chars))
    
    if not border_lines:
        return ValidationResult("border_integrity", True, 1.0, "No border characters found")
    
    issues = []
    
    if mixed_styles:
        issues.append("Mixed border styles detected")
    
    # Check for proper corner/edge consistency in tables
    table_lines = [line for line in lines if "|" in line or "│" in line or "║" in line]
    if len(table_lines) >= 3:  # Minimum for header + separator + data
        # Basic table structure validation
        widths = [len(line) for line in table_lines]
        if len(set(widths)) > 2:  # Allow for separator lines to be slightly different
            issues.append("Inconsistent table row widths")
    
    if not issues:
        return ValidationResult(
            "border_integrity", True, 1.0,
            f"Border integrity OK: {len(border_lines)} border lines, style: {detected_style or 'ASCII'}"
        )
    else:
        return ValidationResult(
            "border_integrity", False, 0.5,
            "; ".join(issues),
            {"detected_style": detected_style, "border_line_count": len(border_lines)}
        )

def calculate_levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein distance between two strings"""
    if len(s1) < len(s2):
        return calculate_levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

def validate_parity(dom_output: str, cli_output: str, threshold: float = 0.01) -> ValidationResult:
    """Validate parity between DOM extraction and CLI transform"""
    if not dom_output or not cli_output:
        return ValidationResult(
            "parity", False, 0.0,
            "Cannot compare empty outputs",
            {"dom_len": len(dom_output), "cli_len": len(cli_output)}
        )
    
    # Normalize whitespace for comparison
    dom_normalized = re.sub(r'\s+', ' ', dom_output.strip())
    cli_normalized = re.sub(r'\s+', ' ', cli_output.strip())
    
    # Calculate Levenshtein distance
    distance = calculate_levenshtein_distance(dom_normalized, cli_normalized)
    max_len = max(len(dom_normalized), len(cli_normalized))
    
    # Calculate similarity ratio
    similarity = 1.0 - (distance / max_len) if max_len > 0 else 1.0
    diff_ratio = 1.0 - similarity
    
    passed = diff_ratio <= threshold
    
    # Generate diff sample for debugging
    diff_lines = list(difflib.unified_diff(
        dom_normalized.splitlines(keepends=True)[:10],
        cli_normalized.splitlines(keepends=True)[:10],
        fromfile='dom_output',
        tofile='cli_output',
        n=3
    ))
    
    return ValidationResult(
        "parity",
        passed,
        similarity,
        f"Diff ratio: {diff_ratio:.4f} ({'PASS' if passed else 'FAIL'} threshold {threshold})",
        {
            "levenshtein_distance": distance,
            "similarity": similarity,
            "diff_ratio": diff_ratio,
            "threshold": threshold,
            "diff_sample": ''.join(diff_lines) if diff_lines else "No differences in first 10 lines"
        }
    )

def run_full_validation(text: str, data: Optional[Dict] = None, width: Optional[int] = None,
                       dom_output: Optional[str] = None, cli_output: Optional[str] = None,
                       config: Optional[Dict] = None) -> List[ValidationResult]:
    """Run complete validation suite"""
    if config is None:
        config = {}
    
    lines = text.splitlines()
    results = []
    
    # Always run basic validations
    results.append(validate_row_widths(lines))
    results.append(validate_line_length(
        lines, 
        config.get('min_chars', 45), 
        config.get('max_chars', 72)
    ))
    results.append(validate_accent_budget(text))
    results.append(validate_border_integrity(lines))
    
    # Conditional validations
    if data is not None and width is not None:
        results.append(validate_bar_proportions(lines, data, width))
    
    if dom_output is not None and cli_output is not None:
        results.append(validate_parity(
            dom_output, cli_output, 
            config.get('parity_threshold', 0.01)
        ))
    
    return results

def validation_summary(results: List[ValidationResult]) -> Dict:
    """Generate summary of validation results"""
    total_checks = len(results)
    passed_checks = len([r for r in results if r.passed])
    failed_checks = total_checks - passed_checks
    
    average_score = sum(r.score for r in results) / total_checks if total_checks > 0 else 0.0
    
    return {
        "total_checks": total_checks,
        "passed": passed_checks,
        "failed": failed_checks,
        "pass_rate": passed_checks / total_checks if total_checks > 0 else 0.0,
        "average_score": average_score,
        "overall_grade": "PASS" if passed_checks == total_checks else "FAIL",
        "checks": [
            {
                "name": r.check_name,
                "passed": r.passed,
                "score": r.score,
                "message": r.message
            }
            for r in results
        ]
    }