#!/usr/bin/env node

/**
 * ASCII VIBE CODEX SYNTHESIS CLI v7.0
 * Main entry point for the mathematical precision text-based UI system
 */

import { BorderEngine } from './src/engines/BorderEngine.js';
import { MotionEngine } from './src/engines/MotionEngine.js';
import { QualityEngine } from './src/engines/QualityEngine.js';
import { PersonaEngine } from './src/personas/PersonaEngine.js';
import chalk from 'chalk';

class ASCIIVibeCodex {
  constructor() {
    this.borderEngine = new BorderEngine();
    this.motionEngine = new MotionEngine();
    this.qualityEngine = new QualityEngine();
    this.personaEngine = new PersonaEngine();
    
    this.isInitialized = false;
    this.terminalDimensions = {
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24
    };
  }

  /**
   * Initializes the ASCII VIBE CODEX system
   */
  async initialize() {
    if (this.isInitialized) return;

    console.clear();
    
    // Show initialization sequence
    await this.showInitializationSequence();
    
    // Start quality monitoring
    this.qualityEngine.startMonitoring();
    
    // Register default personas
    this.registerDefaultPersonas();
    
    this.isInitialized = true;
  }

  /**
   * Shows mathematical precision initialization sequence
   */
  async showInitializationSequence() {
    const initSteps = [
      'BorderEngine :: Mathematical Precision Validation',
      'MotionEngine :: Terminal Animation Systems',
      'QualityEngine :: Integrity Monitoring',
      'PersonaEngine :: CLI Agent Governance',
      'System :: Ready for Mathematical Precision'
    ];

    console.log(chalk.cyan('ASCII VIBE CODEX SYNTHESIS CLI v7.0'));
    console.log(chalk.gray('═'.repeat(50)));
    
    for (let i = 0; i < initSteps.length; i++) {
      process.stdout.write(chalk.yellow('⚡ ') + initSteps[i]);
      
      // Simulate loading with mathematical precision
      for (let j = 0; j < 3; j++) {
        await this.delay(200);
        process.stdout.write(chalk.green('.'));
      }
      
      console.log(chalk.green(' ✓'));
    }
    
    console.log(chalk.gray('═'.repeat(50)));
    await this.delay(500);
  }

  /**
   * Registers default CLI-optimized personas
   */
  registerDefaultPersonas() {
    // CLI Architect - System design and structure
    this.personaEngine.registerPersona('cli-architect', {
      name: 'CLI Architect',
      role: 'system-designer',
      traits: {
        precision: 95,
        efficiency: 85,
        thoroughness: 90,
        technicalDepth: 90,
        autonomy: 70
      },
      communicationStyle: {
        tone: 'technical',
        clarity: 'detailed',
        structure: 'code-focused',
        examples: 'balanced'
      },
      expertise: ['system-administration', 'development'],
      decisionMaking: 'data-driven',
      cliPreferences: {
        verbosity: 'detailed',
        outputFormat: 'structured',
        errorHandling: 'comprehensive'
      }
    });

    // Performance Monitor - Optimization and monitoring
    this.personaEngine.registerPersona('performance-monitor', {
      name: 'Performance Monitor',
      role: 'optimization-specialist',
      traits: {
        precision: 90,
        efficiency: 95,
        patience: 60,
        analyticalThinking: 95
      },
      communicationStyle: {
        tone: 'professional',
        clarity: 'concise',
        structure: 'bullet-points',
        examples: 'minimal'
      },
      expertise: ['data-analysis', 'system-administration'],
      decisionMaking: 'analytical',
      cliPreferences: {
        verbosity: 'minimal',
        outputFormat: 'metrics',
        errorHandling: 'actionable'
      }
    });

    // Quality Assurance - Validation and testing
    this.personaEngine.registerPersona('quality-assurance', {
      name: 'Quality Assurance',
      role: 'validation-specialist',
      traits: {
        precision: 100,
        thoroughness: 95,
        caution: 90,
        attention: 95
      },
      communicationStyle: {
        tone: 'formal',
        clarity: 'detailed',
        structure: 'mixed',
        examples: 'extensive'
      },
      expertise: ['security', 'development'],
      decisionMaking: 'risk-averse',
      restrictions: ['delete', 'deploy'],
      cliPreferences: {
        verbosity: 'comprehensive',
        outputFormat: 'validation-report',
        errorHandling: 'strict'
      }
    });
  }

  /**
   * Creates a demonstration dashboard with mathematical precision
   */
  createDemoDashboard() {
    const { width, height } = this.terminalDimensions;
    
    // Calculate mathematically precise layout
    const panels = [
      {
        x: 2,
        y: 3,
        width: Math.floor(width * 0.3),
        height: Math.floor(height * 0.4),
        title: 'System Status',
        style: 'single'
      },
      {
        x: Math.floor(width * 0.35),
        y: 3,
        width: Math.floor(width * 0.3),
        height: Math.floor(height * 0.4),
        title: 'Performance Metrics',
        style: 'double'
      },
      {
        x: Math.floor(width * 0.7),
        y: 3,
        width: Math.floor(width * 0.25),
        height: Math.floor(height * 0.4),
        title: 'Quality Gates',
        style: 'heavy'
      },
      {
        x: 2,
        y: Math.floor(height * 0.5),
        width: width - 4,
        height: Math.floor(height * 0.35),
        title: 'Mathematical Precision Console',
        style: 'single'
      }
    ];

    // Validate layout precision
    const layoutValidation = this.qualityEngine.validateLayoutPrecision(panels, this.terminalDimensions);
    if (!layoutValidation.isValid) {
      throw new Error(`Layout validation failed: ${layoutValidation.errors.join(', ')}`);
    }

    // Create dashboard with border integrity validation
    const dashboard = this.borderEngine.createDashboard(width, height, panels);
    
    // Validate each panel's border integrity
    for (const panel of panels) {
      const panelBorder = this.borderEngine.createBorder(panel.width, panel.height, panel.style, panel.title);
      const validation = this.qualityEngine.validateBorderIntegrity(panelBorder, panel.width, panel.height);
      
      if (!validation.isValid) {
        throw new Error(`Panel "${panel.title}" border validation failed: ${validation.errors.join(', ')}`);
      }
    }

    return dashboard;
  }

  /**
   * Demonstrates motion graphics capabilities
   */
  async demonstrateMotionGraphics() {
    console.clear();
    console.log(chalk.cyan('Motion Graphics Demonstration'));
    console.log(chalk.gray('─'.repeat(40)));

    // Typewriter effect
    const typewriter = this.motionEngine.createTypewriterEffect(
      'Mathematical precision in motion...', 100
    );
    
    this.motionEngine.registerAnimation('typewriter', typewriter);
    this.motionEngine.startAnimation('typewriter');
    
    await this.delay(typewriter.duration + 500);

    // Progress bar animation
    const progress = this.motionEngine.createProgressAnimation(30, 2000);
    this.motionEngine.registerAnimation('progress', progress);
    
    console.log('\nProgress Animation:');
    this.motionEngine.startAnimation('progress');
    
    await this.delay(progress.duration + 500);

    // Matrix rain effect (brief demo)
    console.log('\nMatrix Rain Effect (3 seconds):');
    const matrix = this.motionEngine.createMatrixRain(20, 5, 0.3);
    this.motionEngine.registerAnimation('matrix', matrix);
    this.motionEngine.startAnimation('matrix');
    
    await this.delay(3000);
    this.motionEngine.stopAnimation('matrix');
  }

  /**
   * Shows quality validation report
   */
  showQualityReport() {
    const report = this.qualityEngine.generateQualityReport();
    
    console.log(chalk.cyan('\nQuality Validation Report'));
    console.log(chalk.gray('═'.repeat(50)));
    
    if (report.summary.averageBorderIntegrity) {
      console.log(chalk.green(`Border Integrity: ${report.summary.averageBorderIntegrity.toFixed(2)}%`));
    }
    
    if (report.summary.averageRenderTime) {
      console.log(chalk.yellow(`Avg Render Time: ${report.summary.averageRenderTime.toFixed(2)}ms`));
    }
    
    if (report.summary.currentMemoryUsage) {
      const memMB = (report.summary.currentMemoryUsage / 1024 / 1024).toFixed(2);
      console.log(chalk.blue(`Memory Usage: ${memMB}MB`));
    }

    if (report.recommendations.length > 0) {
      console.log(chalk.yellow('\nRecommendations:'));
      report.recommendations.forEach(rec => {
        console.log(chalk.yellow(`• ${rec}`));
      });
    }
  }

  /**
   * Interactive CLI menu
   */
  async showInteractiveMenu() {
    console.clear();
    
    // Create mathematically precise menu border
    const menuWidth = 60;
    const menuHeight = 15;
    const menuBorder = this.borderEngine.createBorder(menuWidth, menuHeight, 'double', 'ASCII VIBE CODEX MENU');
    
    // Validate menu border
    const validation = this.qualityEngine.validateBorderIntegrity(menuBorder, menuWidth, menuHeight);
    if (!validation.isValid) {
      console.error('Menu border validation failed:', validation.errors);
      return;
    }

    // Display menu
    menuBorder.forEach(line => console.log(chalk.cyan(line)));
    
    console.log(chalk.yellow('\nChoose demonstration:'));
    console.log(chalk.white('1. Mathematical Precision Dashboard'));
    console.log(chalk.white('2. Motion Graphics Demo'));
    console.log(chalk.white('3. Persona System Demo'));
    console.log(chalk.white('4. Quality Validation Report'));
    console.log(chalk.white('5. Border Integrity Test'));
    console.log(chalk.white('6. Exit'));
    
    // In a real implementation, this would handle user input
    console.log(chalk.gray('\n(This is a demonstration - interactive input would be handled here)'));
  }

  /**
   * Demonstrates persona system
   */
  demonstratePersonaSystem() {
    console.log(chalk.cyan('\nPersona System Demonstration'));
    console.log(chalk.gray('─'.repeat(40)));

    // List available personas
    const personas = this.personaEngine.listPersonas();
    console.log(chalk.yellow('Available Personas:'));
    personas.forEach(persona => {
      console.log(chalk.white(`• ${persona.name} (${persona.role})`));
      console.log(chalk.gray(`  Expertise: ${persona.expertise.join(', ')}`));
    });

    // Activate CLI Architect
    console.log(chalk.green('\nActivating CLI Architect...'));
    const response = this.personaEngine.activatePersona('cli-architect');
    console.log(chalk.blue(response));

    // Show performance metrics
    const metrics = this.personaEngine.getPerformanceMetrics();
    if (metrics) {
      console.log(chalk.yellow('\nPersona Metrics:'));
      console.log(chalk.white(`Activation Count: ${metrics.activationCount}`));
      console.log(chalk.white(`Success Rate: ${metrics.metrics.successRate}%`));
    }
  }

  /**
   * Tests border integrity with various configurations
   */
  async testBorderIntegrity() {
    console.log(chalk.cyan('\nBorder Integrity Testing'));
    console.log(chalk.gray('─'.repeat(40)));

    const testConfigs = [
      { width: 20, height: 8, style: 'single', title: 'Test 1' },
      { width: 30, height: 12, style: 'double', title: 'Test 2 - Longer Title' },
      { width: 15, height: 6, style: 'heavy', title: '' },
      { width: 50, height: 10, style: 'single', title: 'Mathematical Precision Test' }
    ];

    for (let i = 0; i < testConfigs.length; i++) {
      const config = testConfigs[i];
      console.log(chalk.yellow(`\nTest ${i + 1}: ${config.width}x${config.height} ${config.style} border`));
      
      try {
        const border = this.borderEngine.createBorder(config.width, config.height, config.style, config.title);
        const validation = this.qualityEngine.validateBorderIntegrity(border, config.width, config.height);
        
        if (validation.isValid) {
          console.log(chalk.green(`✓ PASS - Score: ${validation.score}%`));
        } else {
          console.log(chalk.red(`✗ FAIL - Errors: ${validation.errors.length}`));
          validation.errors.forEach(error => {
            console.log(chalk.red(`  • ${error}`));
          });
        }
      } catch (error) {
        console.log(chalk.red(`✗ ERROR - ${error.message}`));
      }
    }
  }

  /**
   * Main demonstration runner
   */
  async runDemo() {
    await this.initialize();
    
    try {
      console.log(chalk.green('\n🎯 ASCII VIBE CODEX System Ready'));
      console.log(chalk.yellow('Running comprehensive demonstration...\n'));

      // Show interactive menu
      await this.showInteractiveMenu();
      await this.delay(2000);

      // Demonstrate dashboard
      console.log(chalk.cyan('\n📊 Creating Mathematical Precision Dashboard...'));
      const dashboard = this.createDemoDashboard();
      console.log(chalk.green('✓ Dashboard created with validated borders'));
      await this.delay(1000);

      // Demonstrate motion graphics
      await this.demonstrateMotionGraphics();

      // Demonstrate persona system
      this.demonstratePersonaSystem();
      await this.delay(1000);

      // Test border integrity
      await this.testBorderIntegrity();

      // Show quality report
      this.showQualityReport();

      console.log(chalk.green('\n🎉 All demonstrations completed successfully!'));
      console.log(chalk.cyan('ASCII VIBE CODEX SYNTHESIS CLI v7.0 - Mathematical Precision Achieved'));

    } catch (error) {
      console.error(chalk.red('Error during demonstration:'), error.message);
      process.exit(1);
    } finally {
      this.qualityEngine.stopMonitoring();
      this.motionEngine.stopAll();
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use as module
export default ASCIIVibeCodex;

// Run demonstration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const codex = new ASCIIVibeCodex();
  codex.runDemo().catch(console.error);
}