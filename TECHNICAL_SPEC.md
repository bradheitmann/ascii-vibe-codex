# kik_ASCII Technical Specification

## System Overview

kik_ASCII Swiss ASCII Page Builder v2.0 is a web-based application that converts websites into Swiss ASCII International Style layouts using mathematical precision typography.

## Architecture Diagram

```
┌─ USER INPUT ─────────────────────────────────────────┐
│ URL: https://example.com                             │
└──────────────────┬───────────────────────────────────┘
                   │
┌─ PROCESSING PIPELINE ───────────────────────────────┐
│                  │                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐ │
│  │   CONTENT FETCH     │───▶│   CONTENT ANALYSIS  │ │
│  │ Domain recognition  │    │ Headers, nav, text  │ │
│  │ Site type detection │    │ Links, features     │ │
│  └─────────────────────┘    └─────────────────────┘ │
│                  │                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐ │
│  │  SWISS CONVERSION   │───▶│   WIDTH ENGINE v2.0 │ │
│  │ Typography mapping  │    │ Font probing        │ │
│  │ Layout generation   │    │ Character normalization │
│  └─────────────────────┘    └─────────────────────┘ │
└──────────────────┬───────────────────────────────────┘
                   │
┌─ OUTPUT RENDERING ───────────────────────────────────┐
│ Swiss ASCII Website Recreation                      │
│ - Mathematical precision layout                     │
│ - Responsive design (mobile/desktop)                │
│ - Download/copy/share functionality                 │
└─────────────────────────────────────────────────────┘
```

## Core Components

### 1. Width Engine v2.0

**Purpose**: Ensures mathematical precision in ASCII character alignment across all browsers and devices.

**Key Methods**:
```javascript
class WidthEngine {
    probeFontMetrics() {
        // Tests character width consistency
        // Returns: { isMonospace, baseWidth, widths, testChars }
    }
    
    enableFallbackMode() {
        // Activates ASCII-only mode for problematic fonts
        // Adds 'ascii-fallback' class to body
    }
    
    normalizeText(text) {
        // ASCII Legend System - replaces emoji with [01]-[08] indices
        // Unicode normalization (NFKC)
        // Whitespace standardization
    }
    
    getDisplayWidth(text) {
        // Precise character counting with grapheme segmentation
        // Intl.Segmenter support for proper Unicode handling
    }
}
```

**Font Probing Algorithm**:
1. Create hidden test container with CSS specifications
2. Test character widths: ['W', 'i', '─', '░', '█', '♦']
3. Compare all widths against baseline (tolerance: 0.5px)
4. Enable fallback mode if inconsistencies detected

### 2. Content Intelligence System

**Site Type Detection**:
```javascript
fetchWebsiteContent(url) {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('github')) return simulateGitHubContent(url);
    if (domain.includes('news') || domain.includes('blog')) return simulateNewsContent(url);
    if (domain.includes('shop') || domain.includes('store')) return simulateEcommerceContent(url);
    return simulateGenericContent(url);
}
```

**Content Structure**:
```javascript
{
    title: "Site Title",
    nav: ["Home", "About", "Services", "Contact"],
    headers: ["Welcome", "Our Mission", "What We Do"],
    paragraphs: ["Content text blocks..."],
    links: ["Learn More", "Get Started", "Contact Us"],
    features: ["Key benefits and capabilities"]
}
```

### 3. Swiss ASCII Rendering Engine

**Layout Generation**:
- `createSiteHeader()` - Title and domain display
- `createSiteNavigation()` - Menu conversion with brackets
- `createMainContent()` - Text flow with word wrapping
- `createFeatureSection()` - 2x2 grid layout for capabilities
- `createSiteFooter()` - Conversion metadata and attribution

**Typography Specifications**:
- **Box Drawing Characters**: Unicode U+2500-U+257F series
- **Character Width**: Strict 1ch CSS unit enforcement
- **Line Height**: 12px baseline with CSS variable system
- **Font Stack**: "Iosevka Fixed", "JetBrains Mono", "IBM Plex Mono", "Courier New", monospace

## CSS Architecture

### CSS Variables System
```css
:root {
    --baseline: 12px;              /* Mathematical base unit */
    --char-width: 1ch;             /* Character width enforcement */
    --cols: 86;                    /* Grid column count */
    --ascii-font: font-stack;      /* Monospace font hierarchy */
    --border-char: '─';            /* Unicode box drawing */
    --corner-char: '┌';            /* Corner character */
}
```

### Responsive Breakpoints
```css
/* Desktop: 86 columns */
@media (max-width: 768px) {
    :root { --cols: 72; }          /* Tablet: 72 columns */
}

@media (max-width: 480px) {
    :root { --cols: 58; }          /* Mobile: 58 columns */
}
```

### Font Feature Settings
```css
body {
    font-feature-settings: "tnum" 1, "liga" 0;  /* Tabular numbers, no ligatures */
    font-variant-numeric: tabular-nums;          /* Consistent number width */
    text-rendering: geometricPrecision;          /* Precise rendering */
}
```

## Character Set Management

### ASCII Legend System
Emoji and special characters converted to indexed labels:
```javascript
const asciiLegend = {
    '🔥': '[01]',    // Fire
    '🦖': '[02]',    // Dinosaur  
    '💩': '[03]',    // Waste
    '🤖': '[04]',    // Robot
    '🚀': '[05]',    // Rocket
    '⚡': '[06]',    // Lightning
    '💡': '[07]',    // Light
    '🎯': '[08]'     // Target
};
```

### Single Character Set Policy
- **Strict Mode**: Only ASCII characters (0x00-0x7F) in fallback
- **Unicode Mode**: Box drawing characters + ASCII text content
- **No Mixing**: Consistent character sets prevent alignment issues

## Performance Specifications

### Target Metrics
- **Conversion Time**: <2.3 seconds average
- **Character Accuracy**: 99.7% precision target
- **Font Consistency**: 100% monospace validation
- **Memory Usage**: <10MB typical browser footprint
- **Render Performance**: 60fps smooth animations

### Optimization Techniques
- **CSS Grid**: Hardware-accelerated layout
- **Variable Fonts**: Single font file with multiple weights
- **Lazy Loading**: Defer non-critical resources
- **Minimal DOM**: Efficient element structure

## Error Handling

### Font Fallback Chain
1. **Iosevka Fixed** - Preferred monospace font
2. **JetBrains Mono** - Developer-focused alternative
3. **IBM Plex Mono** - Corporate design system
4. **Courier New** - Universal system fallback
5. **monospace** - Browser default generic

### Degradation Strategy
- **Font Issues**: Automatic fallback mode activation
- **Network Errors**: Graceful error messages with retry options
- **Content Parsing**: Intelligent defaults for missing content
- **Browser Compatibility**: Progressive enhancement approach

## Security Considerations

### CORS Limitations
- **Issue**: Direct website fetching blocked by browser security
- **Solution**: Intelligent content simulation based on domain analysis
- **Future**: Server-side proxy for real content fetching

### XSS Prevention
- **Input Sanitization**: URL validation and normalization
- **Content Filtering**: Safe ASCII character set enforcement
- **DOM Safety**: No direct HTML injection, text content only

## Testing Strategy

### Unit Tests
- Font probing accuracy validation
- Character normalization correctness
- Layout dimension calculations
- Responsive breakpoint behavior

### Integration Tests
- End-to-end conversion workflows
- Cross-browser compatibility testing
- Device-specific responsive validation
- Performance benchmarking

### Manual QA
- Visual regression testing
- Accessibility compliance verification
- User experience flow validation
- Edge case scenario testing

## Deployment Architecture

### GitHub Pages Hosting
- **Repository**: https://github.com/bradheitmann/ascii-vibe-codex
- **Live URL**: https://bradheitmann.github.io/ascii-vibe-codex/kik_ascii.html
- **Auto-deployment**: Push to main branch triggers rebuild
- **CDN**: GitHub's global content delivery network

### File Structure
```
├── kik_ascii.html           # Main application (production)
├── CLAUDE.md               # Claude Code integration guide
├── PRD.md                  # Product requirements document
├── TECHNICAL_SPEC.md       # This technical specification
├── CONVERSATION_CONTEXT.md # Development history context
├── README.md              # Project overview and usage
├── src/ascii_vibe/        # CLI system components
├── hooks/                 # Claude Code integration hooks
└── examples/              # Demo implementations
```

## Future Technical Enhancements

### Phase 1: Intelligence Improvements
- **CSS Parser**: Extract actual stylesheets from target sites
- **Image OCR**: Convert images to ASCII art representations
- **JavaScript Analysis**: Detect interactive elements for conversion

### Phase 2: Performance Optimization
- **WebAssembly**: High-performance character processing
- **Service Worker**: Offline functionality and caching
- **Streaming**: Progressive rendering for large conversions

### Phase 3: Platform Integration
- **Chrome Extension**: Browser integration with content script injection
- **REST API**: Programmatic access with rate limiting
- **WebRTC**: Real-time collaborative editing capabilities

## Conclusion

The kik_ASCII technical architecture provides a robust foundation for Swiss ASCII website conversion with mathematical precision. The Width Engine v2.0 addresses fundamental alignment challenges while the Swiss design system maintains aesthetic authenticity. The modular JavaScript architecture enables future enhancements while preserving core functionality reliability.