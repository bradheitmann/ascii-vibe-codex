# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASCII VIBE CODEX v2.0 - Swiss ASCII International Style Web Converter
**Live Site**: https://bradheitmann.github.io/ascii-vibe-codex/kik_ascii.html

### Primary Components
1. **kik_ascii.html** - Swiss ASCII Page Builder (main production app)
2. **ASCII VIBE CODEX CLI** - Mathematical precision text UI library 
3. **Width Engine v2.0** - Font consistency and alignment system
4. **Demo Files** - South Park, OKOA Capital examples

## Commands

### Web Application (Primary)
- Open `kik_ascii.html` in browser for Swiss ASCII page builder
- Live deployment at GitHub Pages automatically updates

### Development (CLI System)
- `npm start` or `node index.js` - Run the main demo/display system
- `npm test` or `node test/precision-test.js` - Run comprehensive mathematical precision tests
- `node activate.js` - Install/activate Claude Code integration hooks
- `node cli.js <command>` - Access CLI interface

### CLI Commands
- `node cli.js demo` - Run comprehensive system demonstration
- `node cli.js dashboard` - Create mathematical precision dashboard
- `node cli.js motion` - Demonstrate motion graphics capabilities
- `node cli.js personas` - Show persona system capabilities
- `node cli.js test-borders` - Run border integrity tests
- `node cli.js quality-report` - Generate quality validation report
- `node cli.js create-border --width 30 --height 10 --style single --title "Test"` - Create custom border
- `node cli.js activate-persona <persona-id>` - Activate specific persona (cli-architect|performance-monitor|quality-assurance)

### Testing
- `npm test` - Runs precision-test.js with comprehensive mathematical validation
- `node test/precision-test.js` - Direct test execution

## Architecture

### Core System Design
ASCII VIBE CODEX is a mathematical precision text-based UI library designed to enhance Claude Code with:

1. **Mathematical Precision Interface**: Zero-tolerance border alignment with strict validation
2. **Persona System**: AI agent governance with CLI-optimized personalities
3. **Real-time Quality Monitoring**: Comprehensive performance and integrity validation
4. **Claude Code Integration**: Automatic enhancement through hooks system

### Core Components

**Main Entry Points:**
- `index.js` - Main ASCIIVibeCodex class with demo system
- `cli.js` - Command-line interface using Commander.js
- `activate.js` - Claude Code integration installer

**Engine Architecture:**
- `src/engines/BorderEngine.js` - Mathematical precision border rendering with integrity validation
- `src/engines/MotionEngine.js` - Terminal-optimized animation and motion graphics (24fps)
- `src/engines/QualityEngine.js` - Real-time quality monitoring and validation
- `src/personas/PersonaEngine.js` - AI agent governance system

**Claude Code Integration:**
- `hooks/session-start.js` - Automatic initialization when Claude Code starts
- `hooks/prompt-enhancer.js` - Enhances user prompts with project context
- `hooks/response-enhancer.js` - Applies mathematical precision formatting to responses

### Key Architectural Patterns

**Mathematical Precision Validation:**
All visual elements undergo strict mathematical validation:
- Border dimensions must be integers ≥3
- Layout precision validation with collision detection  
- Real-time integrity monitoring with 95%+ accuracy thresholds

**Persona System:**
Three specialized personas with distinct traits and CLI preferences:
- **CLI Architect**: System design focus (precision: 95%, efficiency: 85%)
- **Performance Monitor**: Optimization specialist (efficiency: 95%, precision: 90%)
- **Quality Assurance**: Strict validation (precision: 100%, thoroughness: 95%)

**Quality Engine:**
Continuous monitoring of:
- Border integrity scores
- Render performance (target: <16ms for 60fps)
- Memory usage tracking
- Layout precision validation

### Dependencies
- `chalk` ^5.3.0 - Terminal color formatting
- `blessed` ^0.1.81 - Terminal UI components
- `commander` ^11.1.0 - CLI argument parsing

### Integration with Claude Code
The system automatically enhances Claude Code sessions through:
1. Session start hook displays welcome banner
2. Prompt enhancement adds project context
3. Response formatting applies mathematical precision borders
4. Background quality monitoring ensures system integrity
5. Auto-persona selection based on project analysis

### Performance Characteristics
- Render time: <16ms for 60fps smooth animations
- Memory usage: <10MB typical
- Border integrity: 99.9% accuracy target
- Test coverage: 7 comprehensive validation suites

### File Structure Logic
- Root level: Main executables and configuration
- `src/engines/`: Core rendering and quality systems
- `src/personas/`: AI agent governance
- `hooks/`: Claude Code integration scripts
- `test/`: Mathematical precision validation tests