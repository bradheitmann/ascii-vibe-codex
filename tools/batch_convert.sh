#!/usr/bin/env bash
# Batch HTML to Swiss ASCII converter
# Usage: ./tools/batch_convert.sh [urls_file] [output_dir] [options...]

set -euo pipefail

URLS_FILE="${1:-urls.txt}"
OUTPUT_DIR="${2:-output}"
shift 2 || true
OPTIONS="$*"

if [[ ! -f "$URLS_FILE" ]]; then
    echo "Error: URLs file '$URLS_FILE' not found"
    echo "Create a file with one URL per line, e.g.:"
    echo "  https://example.com"
    echo "  https://news.ycombinator.com"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Batch converting URLs from $URLS_FILE to Swiss ASCII..."
echo "Output directory: $OUTPUT_DIR"
echo "Transform options: $OPTIONS"
echo "---"

line_num=0
while IFS= read -r url; do
    # Skip empty lines and comments
    [[ -z "$url" || "$url" == "#"* ]] && continue
    
    line_num=$((line_num + 1))
    
    # Generate safe filename from URL
    filename=$(echo "$url" | sed 's|https\?://||g' | sed 's|[^a-zA-Z0-9._-]|_|g' | cut -c1-50)
    output_file="$OUTPUT_DIR/${line_num}_${filename}.txt"
    
    echo "[$line_num] $url -> $output_file"
    
    # Use DOM dumper if available, fallback to curl
    if command -v node >/dev/null && [[ -f "tools/dom_dump.js" ]]; then
        if timeout 60 node tools/dom_dump.js "$url" | ./cli/avc transform $OPTIONS > "$output_file" 2>/dev/null; then
            echo "  ✓ Success ($(wc -l < "$output_file") lines)"
        else
            echo "  ✗ Failed with DOM dumper, trying curl fallback..."
            if timeout 30 curl -s -L "$url" | ./cli/avc transform $OPTIONS > "$output_file" 2>/dev/null; then
                echo "  ✓ Success with curl ($(wc -l < "$output_file") lines)"
            else
                echo "  ✗ Failed completely"
                echo "Error: Failed to fetch $url" > "$output_file"
            fi
        fi
    else
        # Fallback to curl
        if timeout 30 curl -s -L "$url" | ./cli/avc transform $OPTIONS > "$output_file" 2>/dev/null; then
            echo "  ✓ Success with curl ($(wc -l < "$output_file") lines)"
        else
            echo "  ✗ Failed"
            echo "Error: Failed to fetch $url" > "$output_file"
        fi
    fi
    
    # Brief pause to be respectful
    sleep 1
    
done < "$URLS_FILE"

echo "---"
echo "Batch conversion complete. Check $OUTPUT_DIR for results."