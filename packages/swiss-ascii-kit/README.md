# Swiss ASCII Kit

A complete frontend toolkit for implementing Swiss International Style with seamless ASCII mode switching.

## Overview

Swiss ASCII Kit provides:
- **Swiss typography system** with precise scaling and spacing
- **One-toggle ASCII mode** that transforms entire pages to text-only
- **Decimal-aligned tables** with tabular numerals 
- **Deterministic micro-visualizations** (sparklines, trends)
- **React components** and vanilla JavaScript modules
- **WCAG AA accessibility** compliance

## Quick Start

### Installation

```bash
npm install @swiss-ascii/kit
```

### Basic Setup

```javascript
// Import CSS
import '@swiss-ascii/kit/css/tokens.css';
import '@swiss-ascii/kit/css/utilities.css'; 
import '@swiss-ascii/kit/css/ascii-mode.css';

// React setup
import AsciiProvider from '@swiss-ascii/kit/react/AsciiProvider';

function App() {
  return (
    <AsciiProvider>
      <YourContent />
    </AsciiProvider>
  );
}
```

### HTML Data Attribute

```html
<!-- Toggle ASCII mode -->
<html data-mode="ascii">
<!-- Your content transforms automatically -->
</html>
```

## Components

### AsciiProvider

Context provider for managing ASCII/visual mode state.

```jsx
import { useAscii } from '@swiss-ascii/kit/react/AsciiProvider';

function Toggle() {
  const { ascii, toggleAscii } = useAscii();
  return (
    <button onClick={toggleAscii}>
      {ascii ? 'Visual' : 'ASCII'} Mode
    </button>
  );
}
```

### AsciiTable

Self-aligning tables with decimal alignment.

```jsx
import { AsciiTable } from '@swiss-ascii/kit/react/AsciiTable';

<AsciiTable 
  headers={['Product', 'Revenue', 'Growth']}
  rows={[
    ['Product A', '$1,234.56', '+15.7%'],
    ['Product B', '($123.45)', '-2.3%']
  ]}
  decimalAlign={true}
/>
```

### Spark (Sparklines)

Deterministic micro-visualizations with ASCII fallback.

```jsx
import Spark from '@swiss-ascii/kit/react/Spark';

<Spark values={[1, 4, 6, 9, 8, 6, 4, 1]} />
// Visual: ▁▄▅█▇▅▄▁
// ASCII:  .-=##=-. 
```

## JavaScript Modules

### Decimal Alignment

```javascript
import { applyDecimalAlignment } from '@swiss-ascii/kit/js/decimal-align';

// Auto-detect and align numeric columns
applyDecimalAlignment(document);
```

### Sparklines

```javascript
import { spark } from '@swiss-ascii/kit/js/sparkline';

const values = [1, 4, 6, 9, 8, 6, 4, 1];
spark(values, { ascii: false }); // ▁▄▅█▇▅▄▁
spark(values, { ascii: true });  // .-=##=-.
```

## CSS Architecture

### Design Tokens
- Swiss typography scale (1.778 ratio)
- 12px baseline grid system  
- High contrast color palette
- Tabular numeral support

### Utilities
- Responsive grid (12-column)
- Swiss typography classes
- Decimal alignment helpers
- Accessibility utilities

### ASCII Mode
- Complete style reset with `data-mode="ascii"`
- Monospace font enforcement
- ASCII table borders
- Layout stability (zero CLS)

## Accessibility

- **WCAG AA** contrast ratios
- **Keyboard navigation** (Ctrl+Shift+A to toggle)
- **Screen reader** compatibility
- **Reduced motion** support
- **High contrast** mode support

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers with CSS Grid support

## Examples

See the [Next.js demo](../examples/nextjs-demo/) for a complete implementation showing:
- Financial data tables with decimal alignment
- Responsive sparkline charts
- Typography hierarchy
- Mode switching UX patterns

## Testing

```bash
# Run decimal alignment tests
npm test

# Accessibility audit (requires demo app)
npm run test:accessibility

# Performance testing
npm run test:performance
```

## Philosophy

Swiss ASCII Kit embodies Swiss International Style principles:
- **Function over form** - Every element serves the content
- **Mathematical precision** - Consistent spacing and alignment
- **Information hierarchy** - Clear visual relationships  
- **Universal accessibility** - Content works for everyone
- **Timeless design** - Avoid trends, embrace fundamentals

The ASCII mode isn't just a fallback—it's a first-class presentation that maintains the same information architecture and design principles as the visual mode.