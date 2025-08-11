#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

def run(cmd_args):
    """Run CLI command and return (exit_code, stdout, stderr)"""
    try:
        result = subprocess.run([sys.executable, "-m", "src.ascii_vibe.renderer"] + cmd_args, 
                              capture_output=True, text=True, cwd=Path(__file__).parent.parent)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return 1, "", str(e)

def test_cjk_labels_indexing_width():
    """Test that CJK labels trigger legend indexing and maintain equal width"""
    data = {"温度": 40, "DB": 25, "CACHE": 5}
    
    # Test via Python import directly since CLI wrapper needs adjustment
    try:
        from src.ascii_vibe.renderer import render_bar_chart_ascii
        output = render_bar_chart_ascii("Temperature Chart", data, 30, style_pack="bold_unicode")
        
        # Ensure legend present and bar lines use [1], [2], etc.
        assert "Labels:" in output, "Legend should be present for CJK labels"
        assert "[1]" in output and "[2]" in output and "[3]" in output, "Index markers should appear in bars"
        
        # Check width consistency
        lines = output.split("\n")
        bar_lines = [line for line in lines if line.startswith("[")]
        if bar_lines:
            widths = [len(line) for line in bar_lines]
            assert len(set(widths)) == 1, f"Bar lines should have equal width, got: {widths}"
        
        print("✓ CJK indexing test passed")
        return True
        
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False
    except AssertionError as e:
        print(f"✗ Assertion failed: {e}")
        return False

def test_style_pack_functionality():
    """Test that different style packs produce different output"""
    try:
        from src.ascii_vibe.renderer import render_bar_chart_ascii
        data = {"A": 30, "B": 20, "C": 10}
        
        ascii_output = render_bar_chart_ascii("Test", data, 20, style_pack="minimal_ascii")
        unicode_output = render_bar_chart_ascii("Test", data, 20, style_pack="bold_unicode")
        
        # ASCII should use = fill, Unicode should use █ fill
        assert "=" in ascii_output or "|" in ascii_output, "ASCII style should use simple characters"
        assert "█" in unicode_output, "Unicode style should use block characters"
        
        print("✓ Style pack test passed")
        return True
        
    except Exception as e:
        print(f"✗ Style pack test failed: {e}")
        return False

def test_equal_width_validation():
    """Test that all bar rows have equal width"""
    try:
        from src.ascii_vibe.renderer import render_bar_chart_ascii
        data = {"SHORT": 10, "VERY_LONG_LABEL": 50, "MED": 25}
        
        output = render_bar_chart_ascii("Width Test", data, 25)
        lines = output.split("\n")
        bar_lines = [line for line in lines if line.startswith("[")]
        
        if bar_lines:
            widths = [len(line) for line in bar_lines]
            assert len(set(widths)) == 1, f"All bar lines must have equal width, got: {widths}"
        
        print("✓ Equal width test passed")
        return True
        
    except Exception as e:
        print(f"✗ Equal width test failed: {e}")
        return False

def main():
    print("Running validation tests...")
    
    tests = [
        test_cjk_labels_indexing_width,
        test_style_pack_functionality, 
        test_equal_width_validation
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n{passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All validation tests passed!")
        sys.exit(0)
    else:
        print("⚠️ Some tests failed")
        sys.exit(1)

if __name__ == "__main__":
    main()