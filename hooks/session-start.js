#!/usr/bin/env node

/**
 * ASCII VIBE CODEX - Session Start Hook
 * Automatically initializes the mathematical precision interface when Claude Code starts
 * 
 * LEARNING NOTE: This is called a "hook script" - it runs automatically
 * when Claude Code starts, like an automatic welcome message.
 */

import ASCIIVibeCodex from '../index.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

class ClaudeCodeIntegration {
  constructor() {
    this.codex = new ASCIIVibeCodex();
    this.sessionId = Date.now().toString();
    this.isActive = false;
  }

  /**
   * Main hook entry point - Claude Code calls this function
   * LEARNING: This is like the "main" function - where everything starts
   */
  async initialize() {
    try {
      // Initialize ASCII VIBE CODEX in background
      await this.codex.initialize();
      
      // Create session welcome banner
      await this.showWelcomeBanner();
      
      // Start background monitoring
      this.startBackgroundService();
      
      // Auto-select persona based on project type
      await this.autoSelectPersona();
      
      this.isActive = true;
      
      // Return success message to Claude Code
      return {
        success: true,
        message: "ASCII VIBE CODEX mathematical precision interface activated",
        sessionId: this.sessionId
      };
      
    } catch (error) {
      return {
        success: false,
        message: `ASCII VIBE CODEX initialization failed: ${error.message}`,
        fallback: true
      };
    }
  }

  /**
   * Creates a beautiful welcome banner with mathematical precision
   * LEARNING: This function creates the fancy visual you'll see when Claude Code starts
   */
  async showWelcomeBanner() {
    console.clear();
    
    // Create mathematically precise welcome border
    const terminalWidth = process.stdout.columns || 80;
    const bannerWidth = Math.min(70, terminalWidth - 4);
    
    const welcomeBanner = this.codex.borderEngine.createBorder(
      bannerWidth, 
      12, 
      'double', 
      'ASCII VIBE CODEX ACTIVE'
    );
    
    // Validate banner integrity (this ensures perfect alignment)
    const validation = this.codex.qualityEngine.validateBorderIntegrity(
      welcomeBanner, 
      bannerWidth, 
      12
    );
    
    if (!validation.isValid) {
      console.log(chalk.yellow('⚠️  Fallback to simple banner (validation failed)'));
      console.log(chalk.cyan('ASCII VIBE CODEX - Mathematical Precision Active'));
      return;
    }

    // Display the perfect banner
    welcomeBanner.forEach(line => console.log(chalk.cyan(line)));
    
    // Add status information inside the banner area
    const statusLines = [
      '',
      chalk.green('🎯 Mathematical Precision: ACTIVE'),
      chalk.blue('🤖 Persona System: READY'),
      chalk.yellow('⚡ Motion Graphics: ENABLED'),
      chalk.magenta('🔍 Quality Gates: STRICT'),
      '',
      chalk.gray(`Session ID: ${this.sessionId}`),
      chalk.gray(`Terminal: ${terminalWidth}x${process.stdout.rows || 24}`),
      ''
    ];
    
    statusLines.forEach(line => console.log(`  ${line}`));
    
    // Create a smooth "loading" animation
    await this.showLoadingAnimation();
  }

  /**
   * Shows a mathematical precision loading sequence
   * LEARNING: This creates the animated dots you see during loading
   */
  async showLoadingAnimation() {
    const loadingSteps = [
      'Border Engine',
      'Motion Graphics', 
      'Quality Validation',
      'Persona Selection',
      'Interface Ready'
    ];

    for (let i = 0; i < loadingSteps.length; i++) {
      process.stdout.write(chalk.yellow(`  ⚡ ${loadingSteps[i]}`));
      
      // Animate loading dots
      for (let j = 0; j < 3; j++) {
        await this.delay(150);
        process.stdout.write(chalk.green('.'));
      }
      
      console.log(chalk.green(' ✓'));
    }
    
    console.log(chalk.cyan('\n🚀 ASCII VIBE CODEX ready for mathematical precision!\n'));
  }

  /**
   * Starts background service for real-time enhancements
   * LEARNING: This runs in the "background" - you won't see it, but it's working
   */
  startBackgroundService() {
    // Create a background process that monitors Claude Code activity
    const backgroundService = setInterval(() => {
      if (!this.isActive) {
        clearInterval(backgroundService);
        return;
      }
      
      // Update performance metrics
      this.updatePerformanceMetrics();
      
      // Check for quality issues
      this.performQualityCheck();
      
    }, 5000); // Check every 5 seconds

    // Store service reference for cleanup
    this.backgroundService = backgroundService;
  }

  /**
   * Auto-selects the best persona based on your project
   * LEARNING: This is like having different "personalities" for different types of work
   */
  async autoSelectPersona() {
    try {
      // Analyze current directory to determine project type
      const currentDir = process.cwd();
      const projectType = await this.analyzeProjectType(currentDir);
      
      let selectedPersona = 'cli-architect'; // Default
      
      // Smart persona selection based on project
      if (projectType.hasTests) {
        selectedPersona = 'quality-assurance';
      } else if (projectType.hasPerformanceFiles) {
        selectedPersona = 'performance-monitor';
      } else if (projectType.hasComplexArchitecture) {
        selectedPersona = 'cli-architect';
      }
      
      // Activate the selected persona
      const response = this.codex.personaEngine.activatePersona(selectedPersona);
      console.log(chalk.blue(`🎭 ${response}`));
      
    } catch (error) {
      console.log(chalk.yellow('⚠️  Using default CLI Architect persona'));
      this.codex.personaEngine.activatePersona('cli-architect');
    }
  }

  /**
   * Analyzes your project to understand what type of work you're doing
   * LEARNING: This "reads" your project files to understand what you're working on
   */
  async analyzeProjectType(directory) {
    const analysis = {
      hasTests: false,
      hasPerformanceFiles: false,
      hasComplexArchitecture: false,
      language: 'unknown'
    };

    try {
      const files = fs.readdirSync(directory);
      
      // Check for test files
      analysis.hasTests = files.some(file => 
        file.includes('test') || 
        file.includes('spec') || 
        file === 'jest.config.js'
      );
      
      // Check for performance-related files
      analysis.hasPerformanceFiles = files.some(file =>
        file.includes('benchmark') ||
        file.includes('performance') ||
        file === 'webpack.config.js'
      );
      
      // Check for complex architecture
      analysis.hasComplexArchitecture = files.some(file =>
        file === 'docker-compose.yml' ||
        file === 'kubernetes' ||
        file.includes('microservice')
      );
      
      // Determine primary language
      if (files.includes('package.json')) analysis.language = 'javascript';
      if (files.includes('Cargo.toml')) analysis.language = 'rust';
      if (files.includes('go.mod')) analysis.language = 'go';
      if (files.includes('requirements.txt')) analysis.language = 'python';
      
    } catch (error) {
      // Silently handle errors - use defaults
    }

    return analysis;
  }

  /**
   * Updates performance metrics in real-time
   * LEARNING: This tracks how well everything is working
   */
  updatePerformanceMetrics() {
    const memoryUsage = process.memoryUsage();
    
    // Log performance data (this gets stored for the quality report)
    this.codex.qualityEngine.metrics.memoryUsage.push(memoryUsage.heapUsed);
    
    // If memory usage is too high, show a warning
    if (memoryUsage.heapUsed > 50 * 1024 * 1024) { // 50MB threshold
      console.log(chalk.yellow('⚠️  High memory usage detected - optimizing...'));
    }
  }

  /**
   * Performs background quality checks
   * LEARNING: This makes sure everything is working perfectly
   */
  performQualityCheck() {
    // Generate quality report
    const report = this.codex.qualityEngine.generateQualityReport();
    
    // If quality drops below threshold, alert
    if (report.summary.averageBorderIntegrity && 
        report.summary.averageBorderIntegrity < 95) {
      console.log(chalk.red('🚨 Quality alert: Border integrity below 95%'));
    }
  }

  /**
   * Utility function for creating delays
   * LEARNING: This makes the computer "wait" for a specified time
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup function when Claude Code session ends
   * LEARNING: This "cleans up" when you're done, like washing dishes
   */
  cleanup() {
    this.isActive = false;
    if (this.backgroundService) {
      clearInterval(this.backgroundService);
    }
    this.codex.qualityEngine.stopMonitoring();
    this.codex.motionEngine.stopAll();
  }
}

// LEARNING: This is the "entry point" - where Claude Code starts our script
async function main() {
  const integration = new ClaudeCodeIntegration();
  const result = await integration.initialize();
  
  // Return result to Claude Code in the format it expects
  console.log(JSON.stringify(result, null, 2));
}

// LEARNING: This checks if our script is being run directly (vs imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.log(JSON.stringify({
      success: false,
      message: error.message,
      fallback: true
    }, null, 2));
  });
}