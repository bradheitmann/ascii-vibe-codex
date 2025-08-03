/**
 * ASCII VIBE CODEX - BorderEngine
 * Mathematical precision border rendering with integrity validation
 */

export class BorderEngine {
  constructor() {
    this.charset = {
      // Single line borders
      horizontal: '─',
      vertical: '│',
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      cross: '┼',
      teeUp: '┴',
      teeDown: '┬',
      teeLeft: '┤',
      teeRight: '├',
      
      // Double line borders
      doubleHorizontal: '═',
      doubleVertical: '║',
      doubleTopLeft: '╔',
      doubleTopRight: '╗',
      doubleBottomLeft: '╚',
      doubleBottomRight: '╝',
      
      // Heavy borders
      heavyHorizontal: '━',
      heavyVertical: '┃',
      heavyTopLeft: '┏',
      heavyTopRight: '┓',
      heavyBottomLeft: '┗',
      heavyBottomRight: '┛'
    };
  }

  /**
   * Validates border mathematical precision
   * @param {Object} dimensions - {width, height, x, y}
   * @returns {boolean} - true if mathematically precise
   */
  validatePrecision(dimensions) {
    const { width, height, x, y } = dimensions;
    
    // Mathematical validation rules
    if (width < 3 || height < 3) return false;
    if (x < 0 || y < 0) return false;
    if (!Number.isInteger(width) || !Number.isInteger(height)) return false;
    if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
    
    return true;
  }

  /**
   * Creates a mathematically precise border
   * @param {number} width - Border width
   * @param {number} height - Border height
   * @param {string} style - Border style (single, double, heavy)
   * @param {string} title - Optional title
   * @returns {Array<string>} - Array of border lines
   */
  createBorder(width, height, style = 'single', title = '') {
    if (!this.validatePrecision({ width, height, x: 0, y: 0 })) {
      throw new Error('Border dimensions must be mathematically precise integers >= 3');
    }

    const chars = this.getCharSet(style);
    const lines = [];
    
    // Top border with title integration
    const topLine = this.createTopBorder(width, chars, title);
    lines.push(topLine);
    
    // Middle lines
    for (let i = 1; i < height - 1; i++) {
      const middleLine = chars.vertical + ' '.repeat(width - 2) + chars.vertical;
      lines.push(middleLine);
    }
    
    // Bottom border
    const bottomLine = chars.bottomLeft + chars.horizontal.repeat(width - 2) + chars.bottomRight;
    lines.push(bottomLine);
    
    // Validate final dimensions
    this.validateBorderIntegrity(lines, width, height);
    
    return lines;
  }

  /**
   * Creates top border with optional title
   */
  createTopBorder(width, chars, title) {
    if (!title) {
      return chars.topLeft + chars.horizontal.repeat(width - 2) + chars.topRight;
    }
    
    // Title integration with mathematical precision
    const titleLength = title.length;
    const availableSpace = width - 4; // Account for corners and padding
    
    if (titleLength > availableSpace) {
      title = title.substring(0, availableSpace - 3) + '...';
    }
    
    const leftPadding = Math.floor((availableSpace - title.length) / 2);
    const rightPadding = availableSpace - title.length - leftPadding;
    
    return chars.topLeft + 
           chars.horizontal.repeat(leftPadding) + 
           ' ' + title + ' ' + 
           chars.horizontal.repeat(rightPadding) + 
           chars.topRight;
  }

  /**
   * Validates border structural integrity
   */
  validateBorderIntegrity(lines, expectedWidth, expectedHeight) {
    if (lines.length !== expectedHeight) {
      throw new Error(`Border height mismatch: expected ${expectedHeight}, got ${lines.length}`);
    }
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length !== expectedWidth) {
        throw new Error(`Border width mismatch at line ${i}: expected ${expectedWidth}, got ${lines[i].length}`);
      }
    }
    
    return true;
  }

  /**
   * Gets character set for border style
   */
  getCharSet(style) {
    switch (style) {
      case 'double':
        return {
          horizontal: this.charset.doubleHorizontal,
          vertical: this.charset.doubleVertical,
          topLeft: this.charset.doubleTopLeft,
          topRight: this.charset.doubleTopRight,
          bottomLeft: this.charset.doubleBottomLeft,
          bottomRight: this.charset.doubleBottomRight
        };
      case 'heavy':
        return {
          horizontal: this.charset.heavyHorizontal,
          vertical: this.charset.heavyVertical,
          topLeft: this.charset.heavyTopLeft,
          topRight: this.charset.heavyTopRight,
          bottomLeft: this.charset.heavyBottomLeft,
          bottomRight: this.charset.heavyBottomRight
        };
      default: // single
        return {
          horizontal: this.charset.horizontal,
          vertical: this.charset.vertical,
          topLeft: this.charset.topLeft,
          topRight: this.charset.topRight,
          bottomLeft: this.charset.bottomLeft,
          bottomRight: this.charset.bottomRight
        };
    }
  }

  /**
   * Creates complex dashboard layout with mathematical precision
   */
  createDashboard(terminalWidth, terminalHeight, panels) {
    const dashboard = Array(terminalHeight).fill().map(() => ' '.repeat(terminalWidth));
    
    for (const panel of panels) {
      this.renderPanel(dashboard, panel);
    }
    
    return dashboard;
  }

  /**
   * Renders a single panel into dashboard
   */
  renderPanel(dashboard, panel) {
    const { x, y, width, height, title, style = 'single' } = panel;
    
    if (!this.validatePrecision({ width, height, x, y })) {
      throw new Error(`Panel ${title} has invalid dimensions`);
    }
    
    const border = this.createBorder(width, height, style, title);
    
    for (let i = 0; i < border.length; i++) {
      if (y + i < dashboard.length && x + border[i].length <= dashboard[y + i].length) {
        const line = dashboard[y + i];
        dashboard[y + i] = line.substring(0, x) + border[i] + line.substring(x + border[i].length);
      }
    }
  }
}