/**
 * Swiss Decimal Alignment Engine
 * Automatically formats numeric content with proper decimal alignment
 */

/**
 * Regular expression to match various numeric formats:
 * - Currency: $1,234.56, (€123.45), £1,000.00
 * - Percentages: 12.3%, -5.7%, +100%
 * - Plain numbers: 1,234.56, -123.45
 * - Parenthetical negatives: (123.45)
 */
const NUMERIC_PATTERN = /^(\(?[\-\+]?[$€£¥]?\s?)([\d\s,\u2009]+)(?:\.(\d+))?(\)?%?[a-zA-Z]*)$/;

/**
 * Detects if a string represents a numeric value
 * @param {string} text - The text to test
 * @returns {boolean} True if numeric-like
 */
export function isNumericLike(text) {
  if (!text || typeof text !== 'string') return false;
  return NUMERIC_PATTERN.test(text.trim());
}

/**
 * Splits a numeric string into components for decimal alignment
 * @param {string} text - The numeric text to split
 * @returns {{prefix: string, left: string, right: string, hasDecimal: boolean}}
 */
export function splitDecimal(text) {
  if (!text || typeof text !== 'string') {
    return { prefix: '', left: '', right: '', hasDecimal: false };
  }
  
  const trimmed = text.trim();
  const match = trimmed.match(NUMERIC_PATTERN);
  
  if (!match) {
    return { prefix: '', left: trimmed, right: '', hasDecimal: false };
  }
  
  const [, prefix = '', left = '', right = '', suffix = ''] = match;
  
  return {
    prefix: prefix,
    left: left.trim(),
    right: right + suffix,
    hasDecimal: Boolean(right || suffix.includes('.'))
  };
}

/**
 * Applies decimal alignment to numeric table cells
 * @param {HTMLElement|Document} root - Root element to search within
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoDetect - Automatically detect numeric columns
 * @param {string} options.selector - CSS selector for cells to process
 * @param {boolean} options.preserveOriginal - Keep original text as data attribute
 */
export function applyDecimalAlignment(root = document, options = {}) {
  const {
    autoDetect = true,
    selector = 'td.num, td[data-decimal], .decimal-align',
    preserveOriginal = true
  } = options;
  
  const cells = root.querySelectorAll(selector);
  
  for (const cell of cells) {
    // Skip if already processed
    if (cell.dataset.aligned === '1') continue;
    
    const originalText = (cell.textContent || '').trim();
    
    // Skip empty cells
    if (!originalText) {
      cell.dataset.aligned = '1';
      continue;
    }
    
    // Check if content is numeric-like
    if (!isNumericLike(originalText)) {
      cell.dataset.aligned = '1';
      continue;
    }
    
    const { prefix, left, right, hasDecimal } = splitDecimal(originalText);
    
    // Preserve original text if requested
    if (preserveOriginal) {
      cell.dataset.originalText = originalText;
    }
    
    // Create decimal alignment structure
    const decimalWrapper = document.createElement('span');
    decimalWrapper.className = 'decimal';
    
    const leftSpan = document.createElement('span');
    leftSpan.className = 'L';
    leftSpan.textContent = prefix + left;
    
    const rightSpan = document.createElement('span');
    rightSpan.className = 'R';
    rightSpan.textContent = right;
    
    // Only add explicit dot if there's a decimal part
    if (hasDecimal && right) {
      const dotSpan = document.createElement('span');
      dotSpan.className = 'dot';
      dotSpan.textContent = '.';
      
      decimalWrapper.appendChild(leftSpan);
      decimalWrapper.appendChild(dotSpan);
      decimalWrapper.appendChild(rightSpan);
    } else {
      // For integers, just use the left span
      decimalWrapper.appendChild(leftSpan);
      if (right) {
        decimalWrapper.appendChild(rightSpan);
      }
    }
    
    // Replace cell content
    cell.innerHTML = '';
    cell.appendChild(decimalWrapper);
    cell.dataset.aligned = '1';
  }
}

/**
 * Auto-detects numeric columns in tables and applies decimal alignment
 * @param {HTMLElement|Document} root - Root element to search within
 * @param {Object} options - Configuration options
 */
export function autoAlignTables(root = document, options = {}) {
  const tables = root.querySelectorAll('table.suisse, table[data-decimal-align]');
  
  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tbody tr, tr:not(:first-child)'));
    if (!rows.length) continue;
    
    // Analyze columns to detect which ones are primarily numeric
    const columnStats = new Map();
    
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      cells.forEach((cell, index) => {
        if (!columnStats.has(index)) {
          columnStats.set(index, { total: 0, numeric: 0 });
        }
        
        const stats = columnStats.get(index);
        stats.total++;
        
        const text = (cell.textContent || '').trim();
        if (isNumericLike(text)) {
          stats.numeric++;
        }
      });
    });
    
    // Mark columns as numeric if >50% of cells are numeric
    columnStats.forEach((stats, columnIndex) => {
      const numericRatio = stats.numeric / stats.total;
      if (numericRatio > 0.5) {
        rows.forEach(row => {
          const cell = row.children[columnIndex];
          if (cell) {
            cell.classList.add('num');
            cell.dataset.decimal = 'true';
          }
        });
      }
    });
    
    // Apply alignment to detected numeric columns
    applyDecimalAlignment(table, options);
  }
}

/**
 * Removes decimal alignment from cells, restoring original text
 * @param {HTMLElement|Document} root - Root element to search within
 */
export function removeDecimalAlignment(root = document) {
  const alignedCells = root.querySelectorAll('[data-aligned="1"]');
  
  for (const cell of alignedCells) {
    const originalText = cell.dataset.originalText;
    if (originalText) {
      cell.textContent = originalText;
      delete cell.dataset.originalText;
    }
    delete cell.dataset.aligned;
  }
}

/**
 * Initialize decimal alignment on DOM ready
 * @param {Object} options - Configuration options
 */
export function initDecimalAlignment(options = {}) {
  const init = () => {
    autoAlignTables(document, options);
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Re-run on dynamic content changes if requested
  if (options.observeChanges) {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        setTimeout(() => autoAlignTables(document, options), 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Auto-initialize if not in a module context
if (typeof window !== 'undefined' && !window.decimalAlignmentInitialized) {
  window.decimalAlignmentInitialized = true;
  initDecimalAlignment({ observeChanges: true });
}