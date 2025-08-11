# Swiss ASCII Kit - Next.js Demo

This demo showcases the Swiss ASCII Kit's capabilities with a fully functional Next.js application that can toggle between visual and ASCII modes seamlessly.

## Features Demonstrated

- **Swiss Typography Hierarchy** - Precise font scaling and spacing
- **Decimal-Aligned Tables** - Financial data with proper number formatting
- **Micro-Visualizations** - Sparklines and trends with ASCII fallbacks
- **Responsive Layout** - CSS Grid that collapses gracefully in ASCII mode
- **Accessibility** - WCAG AA compliance with keyboard shortcuts
- **Mode Switching** - One-click toggle between visual and text-only modes

## Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run start
```

Visit `http://localhost:3000` and use the toggle button or `Ctrl+Shift+A` to switch modes.

## Accessibility Testing

```bash
# Run accessibility audit
npm run test:accessibility

# Performance testing with Lighthouse
npm run test:performance
```

## Key Components Used

- `AsciiProvider` - Context provider for mode management
- `AsciiTable` - Self-aligning numeric tables
- `Spark` - Micro-sparklines with trend indicators
- `MetricSpark` - Combined metric displays

## CSS Architecture

- `tokens.css` - Swiss design system variables
- `utilities.css` - Typography and layout utilities  
- `ascii-mode.css` - Complete ASCII transformation styles

## Mode Switching Behavior

**Visual Mode:**
- Swiss typography with proper font families
- Unicode sparklines (▁▂▃▄▅▆▇█)
- CSS Grid layouts with precise gutters
- Color and contrast for hierarchy

**ASCII Mode:**
- Monospace font enforcement
- ASCII sparklines (.-=##=-.)
- Linear layout flow
- High contrast borders and underlines

Both modes maintain identical information architecture and semantic structure.