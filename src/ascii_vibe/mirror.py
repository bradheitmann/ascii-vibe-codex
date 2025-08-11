# src/ascii_vibe/mirror.py
import os
import json
import hashlib
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse, quote

from .transformers.html2ascii import html_to_swiss_ascii
from .qc import qc_block, qc_footer
from .numbers import normalize_number

@dataclass
class MirrorResult:
    url: str
    source_file: str
    output_txt: str
    output_html: Optional[str]
    title: str
    word_count: int
    line_count: int
    size_bytes: int
    transform_time_ms: float
    qc_results: Dict
    seed: str
    error: Optional[str] = None

@dataclass  
class MirrorConfig:
    input_dir: str = "dump"
    output_dir: str = "mirror"
    formats: List[str] = None  # ["txt", "prehtml", "both"]
    ascii_mode: bool = True
    width: int = 72
    style_pack: str = "minimal_ascii"
    seed: int = 1337
    cjk_index_legend: bool = True
    thousands_sep: str = "thin_space"
    negatives: str = "parentheses" 
    currency: str = "USD"
    add_qc_footer: bool = True
    preserve_structure: bool = True

class SwissASCIIMirror:
    def __init__(self, config: MirrorConfig):
        self.config = config
        if self.config.formats is None:
            self.config.formats = ["txt", "prehtml"]
            
    def _load_crawl_results(self) -> List[Dict]:
        """Load all crawled HTML files from input directory"""
        input_path = Path(self.config.input_dir)
        if not input_path.exists():
            raise FileNotFoundError(f"Input directory {self.config.input_dir} does not exist")
            
        results = []
        for json_file in input_path.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data.get('html') and data.get('status_code') == 200:
                        results.append(data)
            except Exception as e:
                print(f"Warning: Could not load {json_file}: {e}")
                
        print(f"Loaded {len(results)} crawl results for mirroring")
        return results
    
    def _create_safe_path(self, url: str) -> str:
        """Create filesystem-safe path from URL"""
        parsed = urlparse(url)
        
        # Create directory structure: host/path/
        host = parsed.netloc.replace(':', '_')
        path = parsed.path.strip('/')
        
        # Handle empty paths (homepage)
        if not path:
            path = "index"
        
        # Make path filesystem-safe
        safe_path = quote(path, safe='/')
        
        # Combine host and path
        return f"{host}/{safe_path}"
    
    def _transform_html(self, html: str, url: str) -> Tuple[str, Dict, float]:
        """Transform HTML to Swiss ASCII with QC validation"""
        import time
        start_time = time.time()
        
        try:
            # Transform HTML using our existing pipeline
            ascii_text = html_to_swiss_ascii(
                html, 
                width=self.config.width,
                ascii_only=self.config.ascii_mode,
                currency=self.config.currency,
                thousands_sep=self.config.thousands_sep,
                negatives=self.config.negatives
            )
            
            # Run QC validation
            qc_results = qc_block(ascii_text)
            
            # Add QC footer if requested
            if self.config.add_qc_footer:
                lines = ascii_text.splitlines()
                expected = max((len(l) for l in lines), default=0)
                widths = [len(l) for l in lines if l]
                footer = qc_footer(qc_results, expected, widths, str(self.config.seed))
                ascii_text += "\n\n" + footer
            
            transform_time = (time.time() - start_time) * 1000
            return ascii_text, qc_results, transform_time
            
        except Exception as e:
            transform_time = (time.time() - start_time) * 1000
            return "", {"error": str(e)}, transform_time
    
    def _create_prehtml(self, ascii_text: str, title: str, url: str) -> str:
        """Wrap ASCII text in HTML for web viewing"""
        html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Swiss ASCII Mirror</title>
    <meta name="description" content="Swiss ASCII mirror of {url}">
    <meta name="generator" content="ASCII Vibe Codex">
    <style>
        body {{
            font-family: "SF Mono", "Consolas", "Monaco", "Courier New", monospace;
            font-size: 12px;
            line-height: 1.3;
            max-width: {self.config.width + 4}ch;
            margin: 0 auto;
            padding: 16px;
            background: #ffffff;
            color: #000000;
        }}
        pre {{
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            font-family: inherit;
        }}
        .mirror-header {{
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 16px;
            font-size: 10px;
            color: #666;
        }}
        .mirror-footer {{
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 16px;
            font-size: 10px;
            color: #666;
        }}
        @media (max-width: 768px) {{
            body {{ padding: 8px; font-size: 11px; }}
        }}
    </style>
</head>
<body>
    <div class="mirror-header">
        Swiss ASCII Mirror | Source: <a href="{url}">{url}</a> | Generated: {import time; time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}
    </div>
    <pre>{ascii_text}</pre>
    <div class="mirror-footer">
        Mirror generated by <a href="https://github.com/anthropics/claude-code">ASCII Vibe Codex</a>
    </div>
</body>
</html>"""
        return html_template
    
    def _write_outputs(self, result: MirrorResult) -> List[str]:
        """Write mirror outputs to filesystem"""
        output_paths = []
        
        # Create output directory structure
        output_base = Path(self.config.output_dir)
        if self.config.preserve_structure:
            safe_path = self._create_safe_path(result.url)
            output_dir = output_base / safe_path
        else:
            # Flat structure with URL hash
            url_hash = hashlib.sha256(result.url.encode()).hexdigest()[:16]
            output_dir = output_base / url_hash
            
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Write text output
        if "txt" in self.config.formats or "both" in self.config.formats:
            txt_file = output_dir / "index.txt"
            with open(txt_file, 'w', encoding='utf-8') as f:
                f.write(result.output_txt)
            output_paths.append(str(txt_file))
        
        # Write pre-wrapped HTML output  
        if "prehtml" in self.config.formats or "both" in self.config.formats:
            if result.output_html:
                html_file = output_dir / "index.html"
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(result.output_html)
                output_paths.append(str(html_file))
        
        # Write metadata
        meta_file = output_dir / "meta.json"
        with open(meta_file, 'w', encoding='utf-8') as f:
            json.dump({
                "url": result.url,
                "title": result.title,
                "word_count": result.word_count,
                "line_count": result.line_count,
                "size_bytes": result.size_bytes,
                "transform_time_ms": result.transform_time_ms,
                "qc_results": result.qc_results,
                "seed": result.seed,
                "generated_at": import time; time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
                "config": asdict(self.config)
            }, f, indent=2)
        output_paths.append(str(meta_file))
        
        return output_paths
    
    def mirror_single(self, crawl_result: Dict) -> MirrorResult:
        """Mirror a single crawled page"""
        url = crawl_result['url']
        html = crawl_result['html']
        title = crawl_result.get('title', 'Untitled')
        
        # Transform to ASCII
        ascii_text, qc_results, transform_time = self._transform_html(html, url)
        
        # Create pre-wrapped HTML if requested
        prehtml = None
        if "prehtml" in self.config.formats or "both" in self.config.formats:
            prehtml = self._create_prehtml(ascii_text, title, url)
        
        # Calculate metrics
        word_count = len(ascii_text.split()) if ascii_text else 0
        line_count = len(ascii_text.splitlines()) if ascii_text else 0
        size_bytes = len(ascii_text.encode('utf-8')) if ascii_text else 0
        
        result = MirrorResult(
            url=url,
            source_file=crawl_result.get('source_file', ''),
            output_txt=ascii_text,
            output_html=prehtml,
            title=title,
            word_count=word_count,
            line_count=line_count,
            size_bytes=size_bytes,
            transform_time_ms=transform_time,
            qc_results=qc_results,
            seed=str(self.config.seed),
            error=qc_results.get('error')
        )
        
        # Write outputs to filesystem
        output_paths = self._write_outputs(result)
        
        print(f"Mirrored: {url}")
        print(f"  → {word_count:,} words, {line_count:,} lines, {size_bytes:,} bytes")
        print(f"  → Transform: {transform_time:.0f}ms")
        print(f"  → QC: width_ok={qc_results.get('width_ok', False)}")
        for path in output_paths:
            print(f"  → {path}")
        
        return result
    
    def mirror_all(self) -> List[MirrorResult]:
        """Mirror all crawled pages"""
        crawl_results = self._load_crawl_results()
        mirror_results = []
        
        print(f"Starting mirror generation for {len(crawl_results)} pages")
        
        for i, crawl_result in enumerate(crawl_results, 1):
            try:
                print(f"\n[{i}/{len(crawl_results)}] Processing {crawl_result['url']}")
                result = self.mirror_single(crawl_result)
                mirror_results.append(result)
            except Exception as e:
                print(f"Error mirroring {crawl_result['url']}: {e}")
                # Create error result
                error_result = MirrorResult(
                    url=crawl_result['url'],
                    source_file='',
                    output_txt='',
                    output_html=None,
                    title=crawl_result.get('title', ''),
                    word_count=0,
                    line_count=0,
                    size_bytes=0,
                    transform_time_ms=0,
                    qc_results={"error": str(e)},
                    seed=str(self.config.seed),
                    error=str(e)
                )
                mirror_results.append(error_result)
        
        self._write_index(mirror_results)
        
        print(f"\nMirror complete: {len(mirror_results)} pages processed")
        successful = len([r for r in mirror_results if not r.error])
        print(f"Success rate: {successful}/{len(mirror_results)} ({successful/len(mirror_results)*100:.1f}%)")
        
        return mirror_results
    
    def _write_index(self, results: List[MirrorResult]) -> None:
        """Write master index file"""
        output_dir = Path(self.config.output_dir)
        
        # JSON index
        index_data = {
            "generated_at": import time; time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
            "total_pages": len(results),
            "successful_pages": len([r for r in results if not r.error]),
            "config": asdict(self.config),
            "pages": [asdict(r) for r in results]
        }
        
        with open(output_dir / "index.json", 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
        
        # HTML index for browsing
        html_index = self._create_html_index(results)
        with open(output_dir / "index.html", 'w', encoding='utf-8') as f:
            f.write(html_index)
        
        print(f"Created index files: {output_dir / 'index.json'}, {output_dir / 'index.html'}")
    
    def _create_html_index(self, results: List[MirrorResult]) -> str:
        """Create HTML index for browsing mirrors"""
        successful = [r for r in results if not r.error]
        failed = [r for r in results if r.error]
        
        rows = []
        for result in results:
            status = "✅" if not result.error else "❌"
            safe_path = self._create_safe_path(result.url)
            link = f"{safe_path}/index.html" if not result.error else "#"
            
            rows.append(f"""
                <tr>
                    <td>{status}</td>
                    <td><a href="{link}" target="_blank">{result.title or 'Untitled'}</a></td>
                    <td><a href="{result.url}" target="_blank">{result.url}</a></td>
                    <td>{result.word_count:,}</td>
                    <td>{result.line_count:,}</td>
                    <td>{result.size_bytes:,}</td>
                    <td>{result.transform_time_ms:.0f}ms</td>
                </tr>
            """)
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swiss ASCII Mirror Index</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 40px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ padding: 8px 12px; border: 1px solid #ddd; text-align: left; }}
        th {{ background: #f5f5f5; font-weight: 600; }}
        .stats {{ background: #f9f9f9; padding: 16px; border-radius: 4px; margin-bottom: 24px; }}
    </style>
</head>
<body>
    <h1>Swiss ASCII Mirror Index</h1>
    
    <div class="stats">
        <strong>Mirror Statistics:</strong><br>
        Total pages: {len(results)} |
        Successful: {len(successful)} |
        Failed: {len(failed)} |
        Success rate: {len(successful)/len(results)*100:.1f}%
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Source URL</th>
                <th>Words</th>
                <th>Lines</th>
                <th>Bytes</th>
                <th>Transform Time</th>
            </tr>
        </thead>
        <tbody>
            {''.join(rows)}
        </tbody>
    </table>
    
    <footer style="margin-top: 40px; font-size: 12px; color: #666;">
        Generated by <a href="https://github.com/anthropics/claude-code">ASCII Vibe Codex</a>
    </footer>
</body>
</html>"""

def mirror_with_config(config_path: str = "avc.config.yaml") -> List[MirrorResult]:
    """Load config and run mirror pipeline"""
    import yaml
    
    with open(config_path, 'r') as f:
        config_dict = yaml.safe_load(f)
    
    # Extract mirror-specific config
    mirror_dict = config_dict.get('mirror', {})
    ascii_dict = config_dict.get('ascii', {})
    
    config = MirrorConfig(
        input_dir=config_dict.get('output_dir', 'dump'),
        output_dir=mirror_dict.get('output_dir', 'mirror'),
        formats=config_dict.get('formats', ['txt', 'prehtml']),
        width=ascii_dict.get('width', 72),
        seed=ascii_dict.get('seed', 1337),
        **ascii_dict,
        **mirror_dict
    )
    
    mirror = SwissASCIIMirror(config)
    return mirror.mirror_all()

if __name__ == "__main__":
    import sys
    config_path = sys.argv[1] if len(sys.argv) > 1 else "avc.config.yaml"
    results = mirror_with_config(config_path)
    print(f"Mirror complete: {len(results)} pages processed")