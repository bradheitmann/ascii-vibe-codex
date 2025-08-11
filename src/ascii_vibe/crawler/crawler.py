# src/ascii_vibe/crawler/crawler.py
import os
import json
import time
import hashlib
import asyncio
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Set
from urllib.parse import urljoin, urlparse, quote
from pathlib import Path

try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Warning: Playwright not available. Install with: pip install playwright")

import aiohttp
import aiofiles
from bs4 import BeautifulSoup
import robots_txt_parser

@dataclass 
class CrawlResult:
    url: str
    status_code: int
    html: str
    title: str
    canonical_url: Optional[str]
    timestamp: float
    size_bytes: int
    crawl_time_ms: float
    error: Optional[str] = None

@dataclass
class CrawlConfig:
    seeds: List[str]
    include: List[str] = None
    exclude: List[str] = None
    concurrency: int = 4
    delay_ms: int = 300
    max_pages: int = 500
    timeout_ms: int = 30000
    user_agent: str = "Swiss ASCII Converter/1.0"
    respect_robots: bool = True
    sitemap: str = "auto"
    follow_redirects: bool = True
    max_redirects: int = 3
    output_dir: str = "dump"

class SwissASCIICrawler:
    def __init__(self, config: CrawlConfig):
        self.config = config
        self.visited: Set[str] = set()
        self.to_crawl: Set[str] = set(config.seeds)
        self.robots_cache: Dict[str, robots_txt_parser.RobotsTxtParser] = {}
        self.session: Optional[aiohttp.ClientSession] = None
        self.playwright = None
        self.browser = None
        
    async def __aenter__(self):
        # Setup aiohttp session
        timeout = aiohttp.ClientTimeout(total=self.config.timeout_ms / 1000)
        headers = {"User-Agent": self.config.user_agent}
        self.session = aiohttp.ClientSession(timeout=timeout, headers=headers)
        
        # Setup Playwright if available
        if PLAYWRIGHT_AVAILABLE:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch()
            
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
            
    def _should_crawl(self, url: str) -> bool:
        """Check if URL should be crawled based on include/exclude patterns"""
        parsed = urlparse(url)
        path = parsed.path
        
        # Check exclude patterns first
        if self.config.exclude:
            for pattern in self.config.exclude:
                if self._matches_pattern(path, pattern):
                    return False
                    
        # Check include patterns
        if self.config.include:
            for pattern in self.config.include:
                if self._matches_pattern(path, pattern):
                    return True
            return False
            
        return True
        
    def _matches_pattern(self, path: str, pattern: str) -> bool:
        """Simple glob-style pattern matching"""
        if pattern.endswith("/**"):
            return path.startswith(pattern[:-3])
        elif "**" in pattern:
            prefix, suffix = pattern.split("**", 1)
            return path.startswith(prefix) and path.endswith(suffix)
        else:
            return path == pattern or (pattern.endswith("*") and path.startswith(pattern[:-1]))
    
    async def _check_robots_txt(self, url: str) -> bool:
        """Check robots.txt permission for URL"""
        if not self.config.respect_robots:
            return True
            
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        
        if base_url not in self.robots_cache:
            robots_url = urljoin(base_url, "/robots.txt")
            try:
                async with self.session.get(robots_url) as response:
                    if response.status == 200:
                        robots_text = await response.text()
                        rp = robots_txt_parser.RobotsTxtParser()
                        rp.read_robotstxt(robots_text)
                        self.robots_cache[base_url] = rp
                    else:
                        # No robots.txt or error - assume allowed
                        self.robots_cache[base_url] = None
            except Exception:
                # Error fetching robots.txt - assume allowed
                self.robots_cache[base_url] = None
                
        robots_parser = self.robots_cache.get(base_url)
        if robots_parser:
            return robots_parser.can_crawl(url, self.config.user_agent)
        return True
    
    async def _discover_sitemap_urls(self, base_url: str) -> List[str]:
        """Discover URLs from sitemap.xml"""
        sitemap_urls = []
        if self.config.sitemap == "auto":
            sitemap_url = urljoin(base_url, "/sitemap.xml")
            try:
                async with self.session.get(sitemap_url) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'xml')
                        
                        # Handle sitemap index
                        sitemaps = soup.find_all('sitemap')
                        if sitemaps:
                            for sitemap in sitemaps:
                                loc = sitemap.find('loc')
                                if loc:
                                    # Recursively fetch individual sitemaps
                                    sub_urls = await self._discover_sitemap_urls(loc.get_text())
                                    sitemap_urls.extend(sub_urls)
                        else:
                            # Handle URL list
                            urls = soup.find_all('url')
                            for url in urls:
                                loc = url.find('loc')
                                if loc:
                                    sitemap_urls.append(loc.get_text())
                                    
            except Exception as e:
                print(f"Warning: Could not fetch sitemap from {sitemap_url}: {e}")
                
        return sitemap_urls
    
    async def _crawl_single_playwright(self, url: str) -> CrawlResult:
        """Crawl single URL using Playwright"""
        start_time = time.time()
        
        try:
            page = await self.browser.new_page()
            
            # Set user agent
            await page.set_extra_http_headers({"User-Agent": self.config.user_agent})
            
            # Navigate with timeout
            response = await page.goto(url, wait_until="networkidle", timeout=self.config.timeout_ms)
            
            if not response:
                raise Exception("No response received")
                
            # Wait for content to stabilize
            await page.wait_for_timeout(500)
            
            # Clean up the page
            await page.evaluate("""
                // Remove scripts, styles, and other non-content elements
                const selectors = ['script', 'style', 'noscript', 'iframe', 'object', 'embed'];
                for (const selector of selectors) {
                    for (const el of [...document.querySelectorAll(selector)]) {
                        el.remove();
                    }
                }
                
                // Remove common navigation and footer elements
                const nav_selectors = ['nav', 'header', 'footer', '.navigation', '.nav', '.header', '.footer'];
                for (const selector of nav_selectors) {
                    for (const el of [...document.querySelectorAll(selector)]) {
                        el.remove();
                    }
                }
                
                // Expand details elements
                for (const details of document.querySelectorAll('details')) {
                    details.setAttribute('open', 'true');
                }
            """)
            
            # Extract content
            title = await page.title()
            html = await page.content()
            canonical = await page.evaluate("document.querySelector('link[rel=canonical]')?.href")
            
            await page.close()
            
            crawl_time = (time.time() - start_time) * 1000
            
            return CrawlResult(
                url=url,
                status_code=response.status,
                html=html,
                title=title,
                canonical_url=canonical,
                timestamp=time.time(),
                size_bytes=len(html.encode('utf-8')),
                crawl_time_ms=crawl_time
            )
            
        except Exception as e:
            crawl_time = (time.time() - start_time) * 1000
            return CrawlResult(
                url=url,
                status_code=0,
                html="",
                title="",
                canonical_url=None,
                timestamp=time.time(),
                size_bytes=0,
                crawl_time_ms=crawl_time,
                error=str(e)
            )
    
    async def _crawl_single_http(self, url: str) -> CrawlResult:
        """Crawl single URL using aiohttp (fallback)"""
        start_time = time.time()
        
        try:
            async with self.session.get(url) as response:
                html = await response.text()
                
                # Extract title using BeautifulSoup
                soup = BeautifulSoup(html, 'html.parser')
                title_tag = soup.find('title')
                title = title_tag.get_text().strip() if title_tag else ""
                
                canonical_tag = soup.find('link', rel='canonical')
                canonical = canonical_tag.get('href') if canonical_tag else None
                
                crawl_time = (time.time() - start_time) * 1000
                
                return CrawlResult(
                    url=url,
                    status_code=response.status,
                    html=html,
                    title=title,
                    canonical_url=canonical,
                    timestamp=time.time(),
                    size_bytes=len(html.encode('utf-8')),
                    crawl_time_ms=crawl_time
                )
                
        except Exception as e:
            crawl_time = (time.time() - start_time) * 1000
            return CrawlResult(
                url=url,
                status_code=0,
                html="",
                title="",
                canonical_url=None,
                timestamp=time.time(),
                size_bytes=0,
                crawl_time_ms=crawl_time,
                error=str(e)
            )
    
    async def _crawl_single(self, url: str) -> CrawlResult:
        """Crawl single URL with best available method"""
        # Check robots.txt
        if not await self._check_robots_txt(url):
            return CrawlResult(
                url=url,
                status_code=403,
                html="",
                title="",
                canonical_url=None,
                timestamp=time.time(),
                size_bytes=0,
                crawl_time_ms=0,
                error="Blocked by robots.txt"
            )
        
        # Use Playwright if available, otherwise fallback to HTTP
        if self.browser:
            return await self._crawl_single_playwright(url)
        else:
            return await self._crawl_single_http(url)
    
    def _save_result(self, result: CrawlResult) -> str:
        """Save crawl result to disk and return filepath"""
        # Create safe filename from URL
        url_hash = hashlib.sha256(result.url.encode()).hexdigest()[:16]
        parsed = urlparse(result.url)
        safe_path = quote(parsed.path.strip('/'), safe='')[:50]
        filename = f"{parsed.netloc}_{safe_path}_{url_hash}.json"
        
        output_dir = Path(self.config.output_dir)
        output_dir.mkdir(exist_ok=True)
        
        filepath = output_dir / filename
        
        # Save as JSON
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(asdict(result), f, indent=2, ensure_ascii=False)
            
        return str(filepath)
    
    async def crawl(self) -> List[CrawlResult]:
        """Main crawl function"""
        print(f"Starting Swiss ASCII crawl with {len(self.to_crawl)} seed URLs")
        
        # Discover sitemap URLs for each seed
        for seed in list(self.to_crawl):
            parsed = urlparse(seed)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            sitemap_urls = await self._discover_sitemap_urls(base_url)
            for sitemap_url in sitemap_urls:
                if self._should_crawl(sitemap_url):
                    self.to_crawl.add(sitemap_url)
        
        results = []
        semaphore = asyncio.Semaphore(self.config.concurrency)
        
        async def crawl_with_semaphore(url: str):
            async with semaphore:
                if len(self.visited) >= self.config.max_pages:
                    return None
                    
                if url in self.visited:
                    return None
                    
                self.visited.add(url)
                print(f"Crawling [{len(self.visited)}/{min(len(self.to_crawl), self.config.max_pages)}]: {url}")
                
                result = await self._crawl_single(url)
                filepath = self._save_result(result)
                
                print(f"  → {result.status_code} | {result.size_bytes:,} bytes | {result.crawl_time_ms:.0f}ms | {filepath}")
                
                # Add delay between requests
                if self.config.delay_ms > 0:
                    await asyncio.sleep(self.config.delay_ms / 1000)
                    
                return result
        
        # Process URLs in batches
        urls_to_process = list(self.to_crawl)[:self.config.max_pages]
        
        tasks = [crawl_with_semaphore(url) for url in urls_to_process]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in batch_results:
            if isinstance(result, CrawlResult):
                results.append(result)
            elif isinstance(result, Exception):
                print(f"Crawl error: {result}")
        
        print(f"\nCrawl complete: {len(results)} pages crawled")
        return results

async def crawl_with_config(config_path: str = "avc.config.yaml") -> List[CrawlResult]:
    """Load config and run crawler"""
    import yaml
    
    with open(config_path, 'r') as f:
        config_dict = yaml.safe_load(f)
    
    config = CrawlConfig(**config_dict)
    
    async with SwissASCIICrawler(config) as crawler:
        return await crawler.crawl()

if __name__ == "__main__":
    import sys
    config_path = sys.argv[1] if len(sys.argv) > 1 else "avc.config.yaml"
    results = asyncio.run(crawl_with_config(config_path))
    print(f"Crawled {len(results)} pages successfully")