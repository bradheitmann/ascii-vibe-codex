#!/usr/bin/env node
// DOM dumper using Playwright for headless HTML extraction
// Requires: npm install playwright
// Usage: node tools/dom_dump.js <url>

import fs from "node:fs";

const url = process.argv[2];
if (!url) { 
    console.error("Usage: node dom_dump.js <url>"); 
    process.exit(1); 
}

// Dynamic import to handle environments where playwright might not be installed
let chromium;
try {
    const playwright = await import("playwright");
    chromium = playwright.chromium;
} catch (error) {
    console.error("Playwright not found. Install with: npm install playwright");
    console.error("Or use the fallback curl method:");
    console.error(`curl -s "${url}" | ./cli/avc transform 72 true`);
    process.exit(1);
}

try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set a reasonable timeout and user agent
    await page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (compatible; Swiss ASCII Transformer/1.0)');
    
    await page.goto(url, { waitUntil: "networkidle" });

    // Strip scripts/styles; serialize main content
    const html = await page.evaluate(() => {
        // Remove non-content elements
        for (const selector of ["script", "style", "noscript", "iframe", "object", "embed"]) {
            for (const el of [...document.querySelectorAll(selector)]) {
                el.remove();
            }
        }
        
        // Remove common navigation and footer elements
        for (const selector of ["nav", "header", "footer", ".navigation", ".nav", ".header", ".footer"]) {
            for (const el of [...document.querySelectorAll(selector)]) {
                el.remove();
            }
        }
        
        // Expand details elements for better text extraction
        for (const details of document.querySelectorAll("details")) {
            details.setAttribute("open", "true");
        }
        
        // Try to find main content area, fallback to body
        const main = document.querySelector("main") || 
                    document.querySelector("[role='main']") || 
                    document.querySelector(".content") || 
                    document.querySelector(".main-content") ||
                    document.body;
        
        return main ? main.innerHTML : document.body.innerHTML;
    });
    
    await browser.close();
    
    // Output to stdout for piping to transform
    process.stdout.write(html);
    
} catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    process.exit(1);
}