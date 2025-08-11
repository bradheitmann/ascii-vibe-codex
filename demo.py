#!/usr/bin/env python3
"""
ASCII VIBE CODEX v1.0.0-rc.1 LIVE DEMO
Swiss International Style Typography - Mathematical Precision
"""

import sys
import os
sys.path.insert(0, '.')

from src.ascii_vibe.renderer import render_bar_chart_ascii
from src.ascii_vibe.numbers import format_currency, format_percent
from src.ascii_vibe.procgen import sparkline
from src.ascii_vibe.qc import qc_block, qc_footer

def demo_header():
    print("═" * 72)
    print("ASCII VIBE CODEX v1.0.0-rc.1 - SWISS INTERNATIONAL STYLE".center(72))
    print("Mathematical Precision Typography for the Web".center(72))
    print("═" * 72)
    print()

def demo_bar_chart():
    print("📊 BAR CHART - Mathematical Precision")
    print("─" * 45)
    
    # Sales data with precise proportions
    data = {
        "Q1 Sales": 125000,
        "Q2 Sales": 89000, 
        "Q3 Sales": 156000,
        "Q4 Sales": 134000
    }
    
    chart = render_bar_chart_ascii(
        title="Quarterly Revenue",
        series=data,
        width=60,
        style_pack="minimal_ascii", 
        ascii_only=True
    )
    
    print(chart)
    
    # QC validation
    qc_results = qc_block(chart, data, 60)
    print(f"QC: Width={qc_results['width_ok']} | Math={qc_results['proportions_ok']} | Borders={qc_results['borders_ok']}")
    print()

def demo_decimal_alignment():
    print("💰 DECIMAL ALIGNMENT - Swiss Number Formatting")
    print("─" * 50)
    
    financial_data = [
        ("Revenue", 1234567.89),
        ("Expenses", -456789.12),
        ("Profit", 777778.77),
        ("Tax", -155555.55),
        ("Net", 622223.22)
    ]
    
    # Calculate column widths for perfect alignment
    labels = [row[0] for row in financial_data]
    values = [format_currency(row[1], ascii_only=True) for row in financial_data]
    
    label_width = max(len(label) for label in labels)
    value_width = max(len(value) for value in values)
    
    # Build table with perfect alignment
    separator = "+" + "─" * (label_width + 2) + "+" + "─" * (value_width + 2) + "+"
    print(separator)
    
    for i, (label, _) in enumerate(financial_data):
        formatted_value = f" {values[i]:>{value_width}} "
        print(f"| {label:<{label_width}} |{formatted_value}|")
    
    print(separator)
    print()

def demo_sparklines():
    print("✨ SPARKLINES - Deterministic Micro-Visualizations")
    print("─" * 55)
    
    datasets = [
        ("Server CPU %", [45, 52, 48, 61, 59, 67, 72, 68, 74, 71]),
        ("Memory GB", [12.1, 12.8, 13.2, 14.1, 13.9, 15.2, 16.8, 15.9, 17.1, 16.4]),
        ("Response ms", [120, 95, 110, 85, 92, 78, 105, 88, 76, 82])
    ]
    
    for name, data in datasets:
        spark = sparkline(data, ascii_only=True, seed=1337)
        print(f"{name:<12} │{spark}│ {data[-1]}")
    
    print()
    print("🎯 Same seed = same output (deterministic)")
    
    # Prove determinism
    spark1 = sparkline([1,3,2,5,4], ascii_only=True, seed=42)
    spark2 = sparkline([1,3,2,5,4], ascii_only=True, seed=42)  
    spark3 = sparkline([1,3,2,5,4], ascii_only=True, seed=99)
    
    print(f"Seed 42:  {spark1}")
    print(f"Seed 42:  {spark2}  (identical)")
    print(f"Seed 99:  {spark3}  (different)")
    print()

def demo_html_transform():
    print("🌐 HTML → SWISS ASCII TRANSFORM")
    print("─" * 40)
    
    html_input = """
    <h1>Financial Report</h1>
    <p>Quarterly performance analysis with key metrics.</p>
    <ul>
        <li>Revenue increased 23% year-over-year</li>
        <li>Operating margins improved to 18.5%</li>
        <li>Customer acquisition up 45%</li>
    </ul>
    """
    
    # Simple transform (using our existing system)
    from src.ascii_vibe.transformers.html2ascii import html_to_swiss_ascii
    
    ascii_output = html_to_swiss_ascii(html_input, width=60, ascii_only=True)
    
    print("INPUT HTML:")
    print(html_input.strip())
    print()
    print("OUTPUT (Swiss ASCII):")
    print("┌" + "─" * 58 + "┐")
    for line in ascii_output.split('\n'):
        print(f"│ {line:<56} │")
    print("└" + "─" * 58 + "┘")
    print()

def demo_qc_validation():
    print("🔍 QUALITY CONTROL - Mathematical Validation")
    print("─" * 50)
    
    # Create test content with perfect width
    test_lines = [
        "┌─────────────────────────────────────────────────────┐",
        "│ Swiss International Style Typography Standard       │",
        "│ Mathematical precision in every character           │", 
        "│ Zero tolerance for misalignment                     │",
        "└─────────────────────────────────────────────────────┘"
    ]
    
    test_content = "\n".join(test_lines)
    
    # Run QC validation
    qc_results = qc_block(test_content)
    widths = [len(line) for line in test_lines]
    
    print("Test content (borders should align perfectly):")
    print(test_content)
    print()
    
    print("QC Results:")
    print(f"✅ Width consistency: {qc_results['width_ok']}")
    print(f"✅ Border integrity: {qc_results['borders_ok']}")  
    print(f"📏 Line widths: {widths}")
    print(f"📊 Unique widths: {len(set(widths))} (should be 1)")
    
    # QC Footer
    footer = qc_footer(qc_results, max(widths), widths, "1337")
    print()
    print("QC Footer:")
    print(footer)
    print()

def demo_footer():
    print("═" * 72)
    print("🚀 ASCII VIBE CODEX v1.0.0-rc.1 - READY FOR THE WEB")
    print()
    print("Features demonstrated:")
    print("• Mathematical precision bar charts with QC validation")  
    print("• Swiss decimal alignment in financial tables")
    print("• Deterministic sparklines with seeded generation")
    print("• HTML to Swiss ASCII transformation pipeline")
    print("• Zero-tolerance quality control validation")
    print()
    print("Install: pip install ascii-vibe")
    print("Docs:    https://docs.ascii-vibe.dev") 
    print("Demo:    Try it now in your browser!")
    print("═" * 72)

def main():
    """Run the complete ASCII VIBE CODEX demo"""
    
    demo_header()
    
    # Mark current demo as in progress
    print("🔄 Running live demo...")
    print()
    
    demo_bar_chart()
    demo_decimal_alignment()
    demo_sparklines() 
    demo_html_transform()
    demo_qc_validation()
    demo_footer()
    
    print("✅ Demo complete! Swiss International Style is ready for the web.")

if __name__ == "__main__":
    main()