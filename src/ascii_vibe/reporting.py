# src/ascii_vibe/reporting.py
import json
import csv
import os
import time
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any
from datetime import datetime

from .validators import validation_summary

@dataclass
class ReportConfig:
    output_dir: str = "reports"
    formats: List[str] = None  # ["json", "csv", "html"]
    include_screenshots: bool = True
    wcag_level: str = "AA"
    
    def __post_init__(self):
        if self.formats is None:
            self.formats = ["json", "csv", "html"]

@dataclass
class PageReport:
    url: str
    title: str
    status: str  # success, failed, warning
    crawl_time_ms: float
    transform_time_ms: float
    word_count: int
    line_count: int
    size_bytes: int
    qc_results: Dict
    validation_results: Dict
    accessibility_score: Optional[float] = None
    performance_score: Optional[float] = None
    error: Optional[str] = None

@dataclass 
class SummaryStats:
    total_pages: int
    successful_pages: int
    failed_pages: int
    warning_pages: int
    success_rate: float
    average_crawl_time: float
    average_transform_time: float
    total_words: int
    total_size_bytes: int
    qc_pass_rate: float
    validation_pass_rate: float

class SwissASCIIReporter:
    def __init__(self, config: ReportConfig):
        self.config = config
        
    def _calculate_summary_stats(self, pages: List[PageReport]) -> SummaryStats:
        """Calculate aggregate statistics"""
        if not pages:
            return SummaryStats(0, 0, 0, 0, 0.0, 0.0, 0.0, 0, 0, 0.0, 0.0)
        
        successful = [p for p in pages if p.status == "success"]
        failed = [p for p in pages if p.status == "failed"]
        warning = [p for p in pages if p.status == "warning"]
        
        # QC pass rate - pages where all critical QC checks passed
        qc_passes = sum(1 for p in pages 
                       if p.qc_results.get('width_ok', False) and 
                          p.qc_results.get('borders_ok', False))
        
        # Validation pass rate - pages where validation grade is PASS
        validation_passes = sum(1 for p in pages 
                               if p.validation_results.get('overall_grade') == 'PASS')
        
        return SummaryStats(
            total_pages=len(pages),
            successful_pages=len(successful),
            failed_pages=len(failed),
            warning_pages=len(warning),
            success_rate=len(successful) / len(pages),
            average_crawl_time=sum(p.crawl_time_ms for p in pages) / len(pages),
            average_transform_time=sum(p.transform_time_ms for p in pages) / len(pages),
            total_words=sum(p.word_count for p in pages),
            total_size_bytes=sum(p.size_bytes for p in pages),
            qc_pass_rate=qc_passes / len(pages),
            validation_pass_rate=validation_passes / len(pages)
        )
    
    def _load_mirror_data(self, mirror_dir: str = "mirror") -> List[PageReport]:
        """Load mirror results and convert to page reports"""
        mirror_path = Path(mirror_dir)
        
        # Try to load master index
        index_file = mirror_path / "index.json"
        if not index_file.exists():
            print(f"Warning: No mirror index found at {index_file}")
            return []
        
        with open(index_file, 'r', encoding='utf-8') as f:
            mirror_data = json.load(f)
        
        pages = []
        for page_data in mirror_data.get('pages', []):
            # Determine status
            if page_data.get('error'):
                status = "failed"
            elif page_data.get('qc_results', {}).get('width_ok', False):
                status = "success"
            else:
                status = "warning"
            
            # Create validation summary from QC results
            qc_results = page_data.get('qc_results', {})
            validation_results = {
                'overall_grade': 'PASS' if qc_results.get('width_ok', False) else 'FAIL',
                'pass_rate': 1.0 if qc_results.get('width_ok', False) else 0.5,
                'total_checks': len(qc_results),
                'passed': sum(1 for v in qc_results.values() if v is True),
                'failed': sum(1 for v in qc_results.values() if v is False)
            }
            
            page_report = PageReport(
                url=page_data['url'],
                title=page_data.get('title', 'Untitled'),
                status=status,
                crawl_time_ms=page_data.get('crawl_time_ms', 0),
                transform_time_ms=page_data.get('transform_time_ms', 0),
                word_count=page_data.get('word_count', 0),
                line_count=page_data.get('line_count', 0),
                size_bytes=page_data.get('size_bytes', 0),
                qc_results=qc_results,
                validation_results=validation_results,
                error=page_data.get('error')
            )
            pages.append(page_report)
        
        return pages
    
    def _load_lighthouse_data(self, lighthouse_dir: str = ".") -> Dict[str, Dict]:
        """Load Lighthouse performance data if available"""
        lighthouse_files = list(Path(lighthouse_dir).glob("lighthouse-*.json"))
        lighthouse_data = {}
        
        for file_path in lighthouse_files:
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                # Extract key metrics
                perf_score = data['categories']['performance']['score'] * 100
                a11y_score = data['categories']['accessibility']['score'] * 100
                lcp = data['audits']['largest-contentful-paint']['numericValue']
                cls = data['audits']['cumulative-layout-shift']['numericValue']
                
                lighthouse_data[str(file_path)] = {
                    'performance_score': perf_score,
                    'accessibility_score': a11y_score,
                    'lcp_ms': lcp,
                    'cls': cls
                }
            except Exception as e:
                print(f"Warning: Could not load Lighthouse data from {file_path}: {e}")
        
        return lighthouse_data
    
    def _write_json_report(self, pages: List[PageReport], stats: SummaryStats, 
                          lighthouse_data: Dict, output_path: Path) -> str:
        """Generate JSON report"""
        report = {
            "metadata": {
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "generator": "ASCII Vibe Codex Reporter",
                "version": "1.0.0"
            },
            "summary": asdict(stats),
            "performance_data": lighthouse_data,
            "pages": [asdict(page) for page in pages]
        }
        
        json_file = output_path / "swiss-ascii-report.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return str(json_file)
    
    def _write_csv_report(self, pages: List[PageReport], output_path: Path) -> str:
        """Generate CSV report"""
        csv_file = output_path / "swiss-ascii-report.csv"
        
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header row
            writer.writerow([
                "URL", "Title", "Status", "Crawl Time (ms)", "Transform Time (ms)",
                "Word Count", "Line Count", "Size (bytes)", 
                "QC Width OK", "QC Borders OK", "Validation Grade",
                "Validation Pass Rate", "Error"
            ])
            
            # Data rows
            for page in pages:
                writer.writerow([
                    page.url,
                    page.title,
                    page.status,
                    f"{page.crawl_time_ms:.0f}",
                    f"{page.transform_time_ms:.0f}",
                    page.word_count,
                    page.line_count,
                    page.size_bytes,
                    page.qc_results.get('width_ok', 'N/A'),
                    page.qc_results.get('borders_ok', 'N/A'),
                    page.validation_results.get('overall_grade', 'N/A'),
                    f"{page.validation_results.get('pass_rate', 0):.2f}",
                    page.error or ""
                ])
        
        return str(csv_file)
    
    def _write_html_report(self, pages: List[PageReport], stats: SummaryStats,
                          lighthouse_data: Dict, output_path: Path) -> str:
        """Generate HTML report"""
        
        # Build page rows
        page_rows = []
        for page in pages:
            status_icon = {"success": "✅", "warning": "⚠️", "failed": "❌"}[page.status]
            
            page_rows.append(f"""
                <tr class="{page.status}">
                    <td>{status_icon}</td>
                    <td><a href="{page.url}" target="_blank">{page.title or 'Untitled'}</a></td>
                    <td class="url-cell">{page.url}</td>
                    <td>{page.word_count:,}</td>
                    <td>{page.line_count:,}</td>
                    <td>{page.size_bytes:,}</td>
                    <td>{page.crawl_time_ms:.0f}ms</td>
                    <td>{page.transform_time_ms:.0f}ms</td>
                    <td>{'✅' if page.qc_results.get('width_ok') else '❌'}</td>
                    <td>{page.validation_results.get('overall_grade', 'N/A')}</td>
                    <td class="error-cell">{page.error[:50] + '...' if page.error and len(page.error) > 50 else (page.error or '')}</td>
                </tr>
            """)
        
        # Build performance summary if available
        perf_summary = ""
        if lighthouse_data:
            avg_perf = sum(d.get('performance_score', 0) for d in lighthouse_data.values()) / len(lighthouse_data)
            avg_a11y = sum(d.get('accessibility_score', 0) for d in lighthouse_data.values()) / len(lighthouse_data)
            perf_summary = f"""
                <div class="performance-summary">
                    <h3>Performance Summary</h3>
                    <p><strong>Average Performance Score:</strong> {avg_perf:.1f}/100</p>
                    <p><strong>Average Accessibility Score:</strong> {avg_a11y:.1f}/100</p>
                    <p><em>Based on {len(lighthouse_data)} Lighthouse audit(s)</em></p>
                </div>
            """
        
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Swiss ASCII Conversion Report</title>
    <style>
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            margin: 0;
            padding: 20px;
            background: #fafafa;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        
        .header h1 {{
            margin: 0 0 10px 0;
            font-size: 2.5em;
            font-weight: 300;
        }}
        
        .header p {{
            margin: 0;
            opacity: 0.9;
            font-size: 1.1em;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1px;
            background: #e5e7eb;
            margin: 0;
        }}
        
        .stat-card {{
            background: white;
            padding: 20px;
            text-align: center;
        }}
        
        .stat-value {{
            font-size: 2em;
            font-weight: bold;
            color: #1e3a8a;
        }}
        
        .stat-label {{
            color: #6b7280;
            font-size: 0.9em;
            margin-top: 5px;
        }}
        
        .performance-summary {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
            margin: 20px;
        }}
        
        .performance-summary h3 {{
            margin-top: 0;
            color: #1e293b;
        }}
        
        .table-container {{
            padding: 20px;
            overflow-x: auto;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }}
        
        th, td {{
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }}
        
        th {{
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            position: sticky;
            top: 0;
            z-index: 10;
        }}
        
        tr:hover {{
            background: #f9fafb;
        }}
        
        .success {{ color: #059669; }}
        .warning {{ color: #d97706; }}
        .failed {{ color: #dc2626; }}
        
        .url-cell {{
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: 'SF Mono', Consolas, monospace;
            font-size: 12px;
        }}
        
        .error-cell {{
            max-width: 200px;
            font-size: 11px;
            color: #6b7280;
        }}
        
        .footer {{
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }}
        
        @media (max-width: 768px) {{
            .stats-grid {{ grid-template-columns: repeat(2, 1fr); }}
            .container {{ margin: 0; border-radius: 0; }}
            body {{ padding: 0; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Swiss ASCII Conversion Report</h1>
            <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{stats.total_pages:,}</div>
                <div class="stat-label">Total Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.success_rate:.1%}</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.qc_pass_rate:.1%}</div>
                <div class="stat-label">QC Pass Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.average_transform_time:.0f}ms</div>
                <div class="stat-label">Avg Transform Time</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.total_words:,}</div>
                <div class="stat-label">Total Words</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.total_size_bytes / 1024:.0f}KB</div>
                <div class="stat-label">Total Size</div>
            </div>
        </div>
        
        {perf_summary}
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Title</th>
                        <th>URL</th>
                        <th>Words</th>
                        <th>Lines</th>
                        <th>Size</th>
                        <th>Crawl</th>
                        <th>Transform</th>
                        <th>QC Width</th>
                        <th>Validation</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(page_rows)}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            Generated by <strong>ASCII Vibe Codex</strong> • 
            Swiss International Style Typography • 
            <a href="https://github.com/anthropics/claude-code">GitHub</a>
        </div>
    </div>
</body>
</html>"""
        
        html_file = output_path / "swiss-ascii-report.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return str(html_file)
    
    def generate_report(self, mirror_dir: str = "mirror", 
                       lighthouse_dir: str = ".") -> List[str]:
        """Generate comprehensive report from mirror and performance data"""
        
        print("Generating Swiss ASCII conversion reports...")
        
        # Create output directory
        output_path = Path(self.config.output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Load data
        pages = self._load_mirror_data(mirror_dir)
        lighthouse_data = self._load_lighthouse_data(lighthouse_dir)
        stats = self._calculate_summary_stats(pages)
        
        print(f"Loaded {len(pages)} page reports")
        print(f"Found {len(lighthouse_data)} Lighthouse reports")
        
        # Generate reports in requested formats
        output_files = []
        
        if "json" in self.config.formats:
            json_file = self._write_json_report(pages, stats, lighthouse_data, output_path)
            output_files.append(json_file)
            print(f"✅ JSON report: {json_file}")
        
        if "csv" in self.config.formats:
            csv_file = self._write_csv_report(pages, output_path)
            output_files.append(csv_file)
            print(f"✅ CSV report: {csv_file}")
        
        if "html" in self.config.formats:
            html_file = self._write_html_report(pages, stats, lighthouse_data, output_path)
            output_files.append(html_file)
            print(f"✅ HTML report: {html_file}")
        
        # Print summary
        print(f"\n📊 Report Summary:")
        print(f"   Total pages: {stats.total_pages}")
        print(f"   Success rate: {stats.success_rate:.1%}")
        print(f"   QC pass rate: {stats.qc_pass_rate:.1%}")
        print(f"   Average transform: {stats.average_transform_time:.0f}ms")
        
        return output_files

def generate_report_with_config(config_path: str = "avc.config.yaml", 
                               mirror_dir: str = "mirror",
                               lighthouse_dir: str = ".") -> List[str]:
    """Load config and generate reports"""
    import yaml
    
    with open(config_path, 'r') as f:
        config_dict = yaml.safe_load(f)
    
    # Extract reporting config
    report_dict = config_dict.get('reports', {})
    
    config = ReportConfig(**report_dict)
    reporter = SwissASCIIReporter(config)
    
    return reporter.generate_report(mirror_dir, lighthouse_dir)

if __name__ == "__main__":
    import sys
    config_path = sys.argv[1] if len(sys.argv) > 1 else "avc.config.yaml"
    
    output_files = generate_report_with_config(config_path)
    print(f"\nReporting complete: {len(output_files)} files generated")