/**
 * ASCII VIBE CODEX - QualityEngine
 * Comprehensive quality validation and performance monitoring
 */

export class QualityEngine {
  constructor() {
    this.metrics = {
      renderTime: [],
      memoryUsage: [],
      borderIntegrity: [],
      alignmentErrors: [],
      performanceWarnings: []
    };
    
    this.thresholds = {
      maxRenderTime: 16.67, // 60fps target
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      minBorderIntegrity: 99.9, // 99.9% accuracy
      maxAlignmentError: 0 // Zero tolerance for alignment errors
    };

    this.isMonitoring = false;
  }

  /**
   * Starts quality monitoring
   */
  startMonitoring() {
    this.isMonitoring = true;
    this.startPerformanceMonitoring();
  }

  /**
   * Stops quality monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
  }

  /**
   * Validates border integrity with mathematical precision
   * @param {Array<string>} lines - Border lines to validate
   * @param {number} expectedWidth - Expected width
   * @param {number} expectedHeight - Expected height
   * @returns {Object} - Validation result
   */
  validateBorderIntegrity(lines, expectedWidth, expectedHeight) {
    const startTime = performance.now();
    const result = {
      isValid: true,
      errors: [],
      score: 100,
      details: {}
    };

    // Dimension validation
    if (lines.length !== expectedHeight) {
      result.isValid = false;
      result.errors.push(`Height mismatch: expected ${expectedHeight}, got ${lines.length}`);
      result.score -= 25;
    }

    // Width validation for each line
    let widthErrors = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length !== expectedWidth) {
        widthErrors++;
        result.errors.push(`Line ${i} width mismatch: expected ${expectedWidth}, got ${lines[i].length}`);
      }
    }

    if (widthErrors > 0) {
      result.isValid = false;
      result.score -= (widthErrors / lines.length) * 50;
    }

    // Corner validation
    if (lines.length > 0) {
      const cornerValidation = this.validateCorners(lines);
      if (!cornerValidation.isValid) {
        result.isValid = false;
        result.errors.push(...cornerValidation.errors);
        result.score -= 15;
      }
    }

    // Edge continuity validation
    const edgeValidation = this.validateEdgeContinuity(lines);
    if (!edgeValidation.isValid) {
      result.isValid = false;
      result.errors.push(...edgeValidation.errors);
      result.score -= 10;
    }

    const endTime = performance.now();
    result.details.validationTime = endTime - startTime;
    
    // Record metrics
    this.metrics.borderIntegrity.push(result.score);
    this.metrics.renderTime.push(result.details.validationTime);

    return result;
  }

  /**
   * Validates corner characters
   */
  validateCorners(lines) {
    const result = { isValid: true, errors: [] };
    
    if (lines.length < 2) return result;

    const topLine = lines[0];
    const bottomLine = lines[lines.length - 1];
    
    // Valid corner characters
    const validCorners = ['┌', '┐', '└', '┘', '╔', '╗', '╚', '╝', '┏', '┓', '┗', '┛'];
    
    // Check top corners
    if (!validCorners.includes(topLine[0])) {
      result.isValid = false;
      result.errors.push(`Invalid top-left corner: ${topLine[0]}`);
    }
    
    if (!validCorners.includes(topLine[topLine.length - 1])) {
      result.isValid = false;
      result.errors.push(`Invalid top-right corner: ${topLine[topLine.length - 1]}`);
    }

    // Check bottom corners
    if (!validCorners.includes(bottomLine[0])) {
      result.isValid = false;
      result.errors.push(`Invalid bottom-left corner: ${bottomLine[0]}`);
    }
    
    if (!validCorners.includes(bottomLine[bottomLine.length - 1])) {
      result.isValid = false;
      result.errors.push(`Invalid bottom-right corner: ${bottomLine[bottomLine.length - 1]}`);
    }

    return result;
  }

  /**
   * Validates edge continuity
   */
  validateEdgeContinuity(lines) {
    const result = { isValid: true, errors: [] };
    
    if (lines.length < 3) return result;

    const validVertical = ['│', '║', '┃'];
    const validHorizontal = ['─', '═', '━'];

    // Check vertical edges
    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i];
      
      // Left edge
      if (!validVertical.includes(line[0])) {
        result.isValid = false;
        result.errors.push(`Invalid left edge at line ${i}: ${line[0]}`);
      }
      
      // Right edge
      if (!validVertical.includes(line[line.length - 1])) {
        result.isValid = false;
        result.errors.push(`Invalid right edge at line ${i}: ${line[line.length - 1]}`);
      }
    }

    // Check horizontal edges (skip title validation for now)
    if (lines.length >= 2) {
      const bottomLine = lines[lines.length - 1];
      
      // Only validate bottom edge for strict horizontal continuity
      for (let i = 1; i < bottomLine.length - 1; i++) {
        if (!validHorizontal.includes(bottomLine[i])) {
          result.isValid = false;
          result.errors.push(`Invalid bottom edge at position ${i}: ${bottomLine[i]}`);
        }
      }
    }

    return result;
  }

  /**
   * Validates layout mathematical precision
   */
  validateLayoutPrecision(layout, terminalDimensions) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };

    const { width: termWidth, height: termHeight } = terminalDimensions;

    // Check for overflow
    for (const element of layout) {
      const { x, y, width, height } = element;
      
      if (x + width > termWidth) {
        result.isValid = false;
        result.errors.push(`Element overflows horizontally: ${x + width} > ${termWidth}`);
        result.score -= 20;
      }
      
      if (y + height > termHeight) {
        result.isValid = false;
        result.errors.push(`Element overflows vertically: ${y + height} > ${termHeight}`);
        result.score -= 20;
      }

      // Check for non-integer coordinates
      if (!Number.isInteger(x) || !Number.isInteger(y)) {
        result.warnings.push(`Non-integer coordinates: x=${x}, y=${y}`);
        result.score -= 5;
      }
    }

    // Check for overlaps
    const overlaps = this.detectOverlaps(layout);
    if (overlaps.length > 0) {
      result.isValid = false;
      result.errors.push(`${overlaps.length} element overlaps detected`);
      result.score -= overlaps.length * 20;
    }

    return result;
  }

  /**
   * Detects overlapping elements
   */
  detectOverlaps(layout) {
    const overlaps = [];
    
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const elem1 = layout[i];
        const elem2 = layout[j];
        
        if (this.elementsOverlap(elem1, elem2)) {
          overlaps.push({ element1: i, element2: j });
        }
      }
    }
    
    return overlaps;
  }

  /**
   * Checks if two elements overlap
   */
  elementsOverlap(elem1, elem2) {
    return !(
      elem1.x + elem1.width <= elem2.x ||
      elem2.x + elem2.width <= elem1.x ||
      elem1.y + elem1.height <= elem2.y ||
      elem2.y + elem2.height <= elem1.y
    );
  }

  /**
   * Starts performance monitoring
   */
  startPerformanceMonitoring() {
    if (!this.isMonitoring) return;

    const monitorInterval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(monitorInterval);
        return;
      }

      // Memory usage monitoring
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage.push(memUsage.heapUsed);

      // Check thresholds
      if (memUsage.heapUsed > this.thresholds.maxMemoryUsage) {
        this.metrics.performanceWarnings.push({
          type: 'memory',
          value: memUsage.heapUsed,
          threshold: this.thresholds.maxMemoryUsage,
          timestamp: Date.now()
        });
      }

    }, 1000); // Monitor every second
  }

  /**
   * Generates quality report
   */
  generateQualityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {},
      details: {},
      recommendations: []
    };

    // Border integrity analysis
    if (this.metrics.borderIntegrity.length > 0) {
      const avgIntegrity = this.metrics.borderIntegrity.reduce((a, b) => a + b, 0) / this.metrics.borderIntegrity.length;
      report.summary.averageBorderIntegrity = avgIntegrity;
      
      if (avgIntegrity < this.thresholds.minBorderIntegrity) {
        report.recommendations.push('Border integrity below threshold - check alignment algorithms');
      }
    }

    // Performance analysis
    if (this.metrics.renderTime.length > 0) {
      const avgRenderTime = this.metrics.renderTime.reduce((a, b) => a + b, 0) / this.metrics.renderTime.length;
      report.summary.averageRenderTime = avgRenderTime;
      
      if (avgRenderTime > this.thresholds.maxRenderTime) {
        report.recommendations.push('Render time exceeds 60fps target - optimize rendering pipeline');
      }
    }

    // Memory analysis
    if (this.metrics.memoryUsage.length > 0) {
      const currentMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const maxMemory = Math.max(...this.metrics.memoryUsage);
      
      report.summary.currentMemoryUsage = currentMemory;
      report.summary.peakMemoryUsage = maxMemory;
      
      if (maxMemory > this.thresholds.maxMemoryUsage) {
        report.recommendations.push('Memory usage exceeds threshold - implement memory optimization');
      }
    }

    // Performance warnings
    report.details.performanceWarnings = this.metrics.performanceWarnings;

    return report;
  }

  /**
   * Clears all metrics
   */
  clearMetrics() {
    for (const key in this.metrics) {
      this.metrics[key] = [];
    }
  }

  /**
   * Sets custom quality thresholds
   */
  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}