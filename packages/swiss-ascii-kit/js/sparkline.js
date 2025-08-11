/**
 * Swiss Sparkline Generator
 * Deterministic micro-visualizations with ASCII fallback
 */

// Character sets for different rendering modes
const SPARK_UNICODE = ["▁","▂","▃","▄","▅","▆","▇","█"];
const SPARK_ASCII = [".","-","=","#"];

/**
 * Simple xorshift32 PRNG for deterministic variations
 * @param {number} seed - 32-bit seed value
 * @returns {number} Next random value
 */
function xorshift32(seed) {
  let x = seed >>> 0; // Ensure 32-bit unsigned
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0; // Ensure 32-bit unsigned
}

/**
 * Generates a sparkline from an array of values
 * @param {number[]} values - Array of numeric values
 * @param {Object} options - Configuration options
 * @param {boolean} options.ascii - Use ASCII characters instead of Unicode
 * @param {number} options.seed - Seed for deterministic variations (optional)
 * @param {number} options.variation - Variation strength 0-1 (default: 0)
 * @returns {string} Sparkline string
 */
export function spark(values, options = {}) {
  const {
    ascii = false,
    seed = null,
    variation = 0
  } = options;
  
  if (!values || !Array.isArray(values) || values.length === 0) {
    return "";
  }
  
  // Convert all values to numbers and filter out non-numeric
  const numValues = values.map(v => Number(v)).filter(v => !isNaN(v));
  
  if (numValues.length === 0) {
    return "";
  }
  
  const palette = ascii ? SPARK_ASCII : SPARK_UNICODE;
  const min = Math.min(...numValues);
  const max = Math.max(...numValues);
  
  // If all values are the same, return minimum character
  if (max === min) {
    return palette[0].repeat(numValues.length);
  }
  
  const range = max - min;
  let rngState = seed || 42;
  
  return numValues.map((value, index) => {
    // Normalize value to 0-1 range
    const normalized = (value - min) / range;
    
    // Map to palette index
    let paletteIndex = Math.round(normalized * (palette.length - 1));
    
    // Apply seeded variation if requested
    if (variation > 0 && seed !== null) {
      rngState = xorshift32(rngState + index * 1337);
      const variationChance = (rngState % 100) / 100;
      
      if (variationChance < variation) {
        // Small random adjustment to palette index
        rngState = xorshift32(rngState);
        const adjustment = ((rngState % 3) - 1); // -1, 0, or 1
        paletteIndex = Math.max(0, Math.min(palette.length - 1, paletteIndex + adjustment));
      }
    }
    
    return palette[paletteIndex];
  }).join("");
}

/**
 * Generates a decorative braided separator
 * @param {number} width - Width in characters
 * @param {Object} options - Configuration options
 * @param {boolean} options.ascii - Use ASCII characters
 * @param {number} options.seed - Seed for variations
 * @returns {string} Braided separator
 */
export function braid(width, options = {}) {
  const {
    ascii = false,
    seed = null
  } = options;
  
  if (width <= 0) return "";
  
  const chars = ascii ? ["/", "\\"] : ["╱", "╲"];
  
  if (seed === null) {
    // Simple alternating pattern
    return Array.from({length: width}, (_, i) => chars[i % 2]).join("");
  }
  
  // Seeded variation with occasional pattern breaks
  let rngState = seed;
  const result = [];
  
  for (let i = 0; i < width; i++) {
    rngState = xorshift32(rngState);
    
    // 95% normal alternating, 5% variation
    if ((rngState % 20) === 0) {
      // Reverse expected pattern
      result.push(chars[(i + 1) % 2]);
    } else {
      // Normal alternating
      result.push(chars[i % 2]);
    }
  }
  
  return result.join("");
}

/**
 * Creates a sparkline with automatic ASCII mode detection
 * @param {number[]} values - Values to visualize
 * @param {Object} options - Options (will auto-detect ASCII mode from DOM)
 * @returns {string} Sparkline string
 */
export function autoSpark(values, options = {}) {
  // Auto-detect ASCII mode from document
  const isAsciiMode = typeof document !== 'undefined' && 
    document.documentElement.getAttribute('data-mode') === 'ascii';
  
  return spark(values, {
    ascii: isAsciiMode,
    ...options
  });
}

/**
 * Processes all sparkline elements in the DOM
 * @param {HTMLElement|Document} root - Root element to search
 */
export function processSparklines(root = document) {
  const sparkElements = root.querySelectorAll('[data-spark], .sparkline');
  
  for (const element of sparkElements) {
    try {
      let values = [];
      
      // Get values from data attribute or content
      if (element.dataset.spark) {
        values = element.dataset.spark.split(',').map(v => parseFloat(v.trim()));
      } else {
        // Try to parse from text content
        const text = element.textContent || '';
        const nums = text.match(/[\d.-]+/g);
        if (nums) {
          values = nums.map(n => parseFloat(n)).filter(n => !isNaN(n));
        }
      }
      
      if (values.length > 0) {
        const options = {
          ascii: element.dataset.ascii === 'true' || 
                 document.documentElement.getAttribute('data-mode') === 'ascii',
          seed: element.dataset.seed ? parseInt(element.dataset.seed) : null,
          variation: element.dataset.variation ? parseFloat(element.dataset.variation) : 0
        };
        
        const sparkline = spark(values, options);
        
        // Store ASCII version for mode switching
        element.dataset.asciiSpark = spark(values, {...options, ascii: true});
        element.dataset.unicodeSpark = spark(values, {...options, ascii: false});
        
        // Update content based on current mode
        if (options.ascii) {
          element.textContent = element.dataset.asciiSpark;
        } else {
          element.textContent = element.dataset.unicodeSpark;
        }
        
        // Add CSS class for styling
        element.classList.add('spark');
      }
    } catch (error) {
      console.warn('Error processing sparkline:', element, error);
    }
  }
}

/**
 * Initialize sparkline processing
 */
export function initSparklines() {
  // Process existing sparklines
  if (typeof document !== 'undefined') {
    processSparklines();
    
    // Watch for ASCII mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'data-mode' &&
            mutation.target === document.documentElement) {
          
          // Re-process sparklines when mode changes
          processSparklines();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode']
    });
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSparklines);
  } else {
    initSparklines();
  }
}