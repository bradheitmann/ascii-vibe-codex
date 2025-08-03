# Contributing to ASCII VIBE CODEX

Thank you for your interest in contributing to ASCII VIBE CODEX! This document provides guidelines for contributing to the project.

## 🎯 Core Principles

ASCII VIBE CODEX is built on these foundational principles:

1. **Mathematical Precision**: All visual elements must be mathematically precise with zero tolerance for alignment errors
2. **Japanese Aesthetics**: Design follows wa (harmony), ma (space), and kanso (simplicity) principles  
3. **Quality First**: Comprehensive validation and testing required for all contributions
4. **CLI Optimization**: All features must enhance the command-line experience

## 🚀 Getting Started

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/ascii-vibe-codex.git
cd ascii-vibe-codex

# Install dependencies
npm install

# Run tests to ensure everything works
npm test

# Start development mode
npm run demo
```

### Project Structure
```
ascii-vibe-codex/
├── src/
│   ├── engines/          # Core rendering engines
│   │   ├── BorderEngine.js     # Mathematical precision borders
│   │   ├── MotionEngine.js     # Terminal animations
│   │   └── QualityEngine.js    # Validation systems
│   └── personas/         # AI agent governance
├── hooks/                # Claude Code integration
├── test/                 # Test suites
├── cli.js               # Command-line interface
└── index.js             # Main entry point
```

## 📋 Contribution Types

### 🐛 Bug Reports
When reporting bugs, please include:
- **Precise reproduction steps**
- **Terminal environment** (macOS/Linux/Windows + terminal app)
- **Expected vs actual behavior**
- **Border integrity validation results** (if visual)
- **Quality metrics** from `npm run quality`

### ✨ Feature Requests
For new features, provide:
- **Use case description** - How does this enhance CLI experience?
- **Mathematical precision requirements** - Any alignment considerations?
- **Persona system impact** - Which personas would use this?
- **Quality gates** - How will we validate this works correctly?

### 🔧 Code Contributions

#### Before You Start
1. **Check existing issues** - Avoid duplicate work
2. **Discuss large changes** - Open an issue for major features
3. **Follow coding standards** - See style guide below

#### Pull Request Process
1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Write tests first**: All code requires comprehensive test coverage
3. **Implement with precision**: Follow mathematical precision requirements
4. **Validate quality**: Run full test suite and quality checks
5. **Document changes**: Update README and add code comments
6. **Submit PR**: Include clear description and testing results

## 🎨 Coding Standards

### Mathematical Precision Requirements
```javascript
// ✅ Good - Validates dimensions
function createBorder(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error('Dimensions must be precise integers');
  }
  // Implementation...
}

// ❌ Bad - No validation
function createBorder(width, height) {
  // Implementation without precision checks...
}
```

### Border Integrity Validation
All visual elements must include integrity validation:
```javascript
const border = createBorder(width, height, style);
const validation = qualityEngine.validateBorderIntegrity(border, width, height);
if (!validation.isValid) {
  throw new Error(`Border validation failed: ${validation.errors.join(', ')}`);
}
```

### Error Handling
```javascript
// ✅ Good - Comprehensive error handling with fallbacks
try {
  const result = riskyOperation();
  return enhanceResult(result);
} catch (error) {
  console.warn(`Enhancement failed: ${error.message}`);
  return fallbackResult();
}

// ❌ Bad - Silent failures
try {
  const result = riskyOperation();
  return enhanceResult(result);
} catch (error) {
  // Silent failure - user doesn't know what happened
}
```

### Documentation Requirements
All functions require JSDoc comments:
```javascript
/**
 * Creates mathematically precise border with validation
 * @param {number} width - Border width (must be integer >= 3)
 * @param {number} height - Border height (must be integer >= 3)  
 * @param {string} style - Border style (single|double|heavy)
 * @param {string} title - Optional title text
 * @returns {Array<string>} - Validated border lines
 * @throws {Error} - If dimensions are invalid or validation fails
 */
```

## 🧪 Testing Requirements

### Test Coverage
- **100% coverage** required for all rendering engines
- **Border integrity tests** for all visual components  
- **Performance benchmarks** must pass (<16ms render time)
- **Quality validation** tests for new features

### Running Tests
```bash
# Full test suite
npm test

# Border integrity tests
node cli.js test-borders

# Performance benchmarks
npm run performance

# Quality validation
npm run quality
```

### Writing Tests
```javascript
// Example test structure
describe('BorderEngine', () => {
  it('should create mathematically precise borders', () => {
    const border = borderEngine.createBorder(20, 10, 'single');
    const validation = qualityEngine.validateBorderIntegrity(border, 20, 10);
    
    expect(validation.isValid).toBe(true);
    expect(validation.score).toBe(100);
    expect(border.length).toBe(10);
    expect(border[0].length).toBe(20);
  });
});
```

## 🎭 Persona System Guidelines

When contributing persona-related features:

### Persona Design Principles
- **CLI-Optimized**: Designed for command-line environments
- **Trait-Based**: Use numerical traits (0-100 scale)
- **Governance-Aware**: Include appropriate restrictions and permissions
- **Performance-Tracked**: Include metrics and analytics

### Adding New Personas
```javascript
personaEngine.registerPersona('my-persona', {
  name: 'My Persona',
  role: 'specialized-function',
  traits: {
    precision: 90,        // Mathematical accuracy preference
    efficiency: 75,       // Speed vs thoroughness balance
    verbosity: 60,        // Communication detail level
    autonomy: 80          // Independent decision making
  },
  communicationStyle: {
    tone: 'professional', // professional|friendly|formal|technical
    clarity: 'balanced',  // concise|detailed|balanced
    structure: 'mixed'    // bullet-points|paragraphs|mixed|code-focused
  },
  expertise: ['domain1', 'domain2'],
  restrictions: ['dangerous-operation'],
  cliPreferences: {
    verbosity: 'balanced',
    outputFormat: 'structured',
    errorHandling: 'comprehensive'
  }
});
```

## 🏗️ Architecture Guidelines

### Engine Design
Each engine should be:
- **Self-contained**: Minimal dependencies on other engines
- **Validated**: Include comprehensive input validation
- **Testable**: Clear interfaces for unit testing
- **Performant**: Meet performance benchmarks

### Hook Integration
Claude Code hooks must:
- **Fail gracefully**: Always provide fallback behavior
- **Validate input**: Check all parameters before processing
- **Return structured data**: Use consistent JSON response format
- **Handle errors**: Log issues without breaking Claude Code

## 📊 Performance Standards

All contributions must meet these benchmarks:

### Rendering Performance
- **Border creation**: <5ms for standard sizes
- **Validation**: <10ms for comprehensive checks
- **Animation frames**: 16.67ms max (60fps target)
- **Memory usage**: <50MB typical operation

### Quality Metrics
- **Border integrity**: 99.9% accuracy minimum
- **Test coverage**: 100% for critical paths
- **Code quality**: ESLint compliance with zero warnings

## 🔄 Release Process

### Version Numbering
We follow semantic versioning:
- **Major** (7.x.x): Breaking changes, new core engines
- **Minor** (x.1.x): New features, persona additions
- **Patch** (x.x.1): Bug fixes, performance improvements

### Release Checklist
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Quality validation complete
- [ ] Border integrity verified
- [ ] Claude Code integration tested

## 🌟 Recognition

Contributors are recognized in:
- **README.md** - Major contributors section
- **Release notes** - Feature attribution
- **GitHub contributors** - Automatic recognition
- **Community Discord** - Contributor badges

## 📞 Getting Help

- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: Design discussions and feature ideas  
- **Discord Community**: Real-time collaboration and support
- **Code Review**: Maintainers provide detailed feedback on PRs

## 🤝 Code of Conduct

### Our Standards
- **Respectful communication** - Professional and inclusive language
- **Quality focus** - Mathematical precision and excellence
- **Collaborative spirit** - Help others learn and grow
- **Constructive feedback** - Specific, actionable suggestions

### Enforcement
Project maintainers are responsible for clarifying standards and will take appropriate action in response to unacceptable behavior.

---

Thank you for contributing to ASCII VIBE CODEX! Together we're building the future of mathematically precise CLI interfaces. ✨