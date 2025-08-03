#!/usr/bin/env node

/**
 * ASCII VIBE CODEX - Prompt Enhancer Hook
 * Automatically enhances user prompts with context and precision guidance
 * 
 * LEARNING NOTE: This script runs when you type something to Claude,
 * adding helpful context so Claude gives you better answers.
 */

import ASCIIVibeCodex from '../index.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

class PromptEnhancer {
  constructor() {
    this.codex = new ASCIIVibeCodex();
    this.contextCache = new Map();
  }

  /**
   * Main enhancement function - called before your prompt reaches Claude
   * LEARNING: This takes what you type and adds helpful context automatically
   */
  async enhancePrompt(userPrompt, context = {}) {
    try {
      // Analyze the user's intent
      const intent = this.analyzeUserIntent(userPrompt);
      
      // Gather relevant context
      const projectContext = await this.gatherProjectContext();
      
      // Get active persona preferences
      const personaContext = this.getPersonaContext();
      
      // Create enhanced prompt with mathematical precision guidance
      const enhancedPrompt = this.buildEnhancedPrompt(
        userPrompt, 
        intent, 
        projectContext, 
        personaContext
      );
      
      // Show enhancement preview to user
      this.showEnhancementPreview(userPrompt, enhancedPrompt);
      
      return {
        success: true,
        originalPrompt: userPrompt,
        enhancedPrompt: enhancedPrompt,
        context: {
          intent,
          projectContext,
          personaContext
        }
      };
      
    } catch (error) {
      return {
        success: false,
        originalPrompt: userPrompt,
        enhancedPrompt: userPrompt, // Fallback to original
        error: error.message
      };
    }
  }

  /**
   * Analyzes what the user is trying to accomplish
   * LEARNING: This "reads" your request to understand what type of help you need
   */
  analyzeUserIntent(prompt) {
    const intent = {
      type: 'general',
      confidence: 0,
      keywords: [],
      complexity: 'medium',
      requiresPrecision: false
    };

    const promptLower = prompt.toLowerCase();

    // Detect intent types
    if (this.matchesPattern(promptLower, ['fix', 'debug', 'error', 'bug', 'broken'])) {
      intent.type = 'debugging';
      intent.requiresPrecision = true;
      intent.confidence = 0.9;
    } else if (this.matchesPattern(promptLower, ['create', 'make', 'build', 'generate'])) {
      intent.type = 'creation';
      intent.requiresPrecision = true;
      intent.confidence = 0.8;
    } else if (this.matchesPattern(promptLower, ['explain', 'how', 'what', 'why', 'understand'])) {
      intent.type = 'explanation';
      intent.confidence = 0.7;
    } else if (this.matchesPattern(promptLower, ['optimize', 'improve', 'performance', 'faster'])) {
      intent.type = 'optimization';
      intent.requiresPrecision = true;
      intent.confidence = 0.8;
    } else if (this.matchesPattern(promptLower, ['test', 'validate', 'check', 'verify'])) {
      intent.type = 'validation';
      intent.requiresPrecision = true;
      intent.confidence = 0.9;
    }

    // Detect complexity
    if (prompt.length > 200 || promptLower.includes('complex') || promptLower.includes('advanced')) {
      intent.complexity = 'high';
    } else if (prompt.length < 50 || promptLower.includes('simple') || promptLower.includes('quick')) {
      intent.complexity = 'low';
    }

    // Extract keywords
    intent.keywords = this.extractTechnicalKeywords(prompt);

    return intent;
  }

  /**
   * Checks if prompt matches certain patterns
   * LEARNING: This looks for specific words that tell us what you want to do
   */
  matchesPattern(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Extracts technical keywords from the prompt
   * LEARNING: This finds important technical words in your request
   */
  extractTechnicalKeywords(prompt) {
    const techKeywords = [
      'javascript', 'python', 'rust', 'go', 'typescript', 'node', 'react', 'vue',
      'docker', 'kubernetes', 'api', 'database', 'sql', 'json', 'yaml',
      'function', 'class', 'component', 'module', 'package', 'import',
      'git', 'github', 'npm', 'yarn', 'webpack', 'babel', 'eslint'
    ];

    const found = [];
    const promptLower = prompt.toLowerCase();
    
    for (const keyword of techKeywords) {
      if (promptLower.includes(keyword)) {
        found.push(keyword);
      }
    }
    
    return found;
  }

  /**
   * Gathers context about the current project
   * LEARNING: This looks at your project files to understand what you're working on
   */
  async gatherProjectContext() {
    const context = {
      projectType: 'unknown',
      language: 'unknown',
      framework: 'unknown',
      hasTests: false,
      hasConfig: false,
      recentFiles: [],
      structure: {}
    };

    try {
      const currentDir = process.cwd();
      const files = fs.readdirSync(currentDir);

      // Detect project type and language
      if (files.includes('package.json')) {
        context.projectType = 'node';
        context.language = 'javascript';
        
        // Read package.json for more details
        try {
          const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          if (packageJson.dependencies) {
            if (packageJson.dependencies.react) context.framework = 'react';
            if (packageJson.dependencies.vue) context.framework = 'vue';
            if (packageJson.dependencies.next) context.framework = 'nextjs';
            if (packageJson.dependencies.express) context.framework = 'express';
          }
        } catch (e) {
          // Ignore package.json parsing errors
        }
      } else if (files.includes('Cargo.toml')) {
        context.projectType = 'rust';
        context.language = 'rust';
      } else if (files.includes('go.mod')) {
        context.projectType = 'go';
        context.language = 'go';
      } else if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
        context.projectType = 'python';
        context.language = 'python';
      }

      // Check for tests
      context.hasTests = files.some(file => 
        file.includes('test') || 
        file.includes('spec') || 
        file === '__tests__'
      );

      // Check for config files
      context.hasConfig = files.some(file =>
        file.includes('config') ||
        file.includes('.env') ||
        file === 'tsconfig.json' ||
        file === 'webpack.config.js'
      );

      // Get recent files (helpful for context)
      context.recentFiles = files.slice(0, 10);

    } catch (error) {
      // Silently handle directory reading errors
    }

    return context;
  }

  /**
   * Gets context from the active persona
   * LEARNING: This checks what "personality" is currently active to adjust the response style
   */
  getPersonaContext() {
    try {
      const metrics = this.codex.personaEngine.getPerformanceMetrics();
      
      if (metrics) {
        return {
          activePersona: metrics.personaId,
          personaName: metrics.name,
          activationCount: metrics.activationCount,
          preferences: {
            verbosity: 'detailed', // From persona settings
            technicalDepth: 'high',
            qualityFocus: 'strict'
          }
        };
      }
    } catch (error) {
      // Fallback if persona system not available
    }

    return {
      activePersona: 'cli-architect',
      personaName: 'CLI Architect',
      preferences: {
        verbosity: 'balanced',
        technicalDepth: 'medium',
        qualityFocus: 'standard'
      }
    };
  }

  /**
   * Builds the enhanced prompt with all context
   * LEARNING: This combines your original request with helpful context for Claude
   */
  buildEnhancedPrompt(originalPrompt, intent, projectContext, personaContext) {
    let enhanced = '';

    // Add ASCII VIBE CODEX context header
    enhanced += '# ASCII VIBE CODEX CONTEXT\n';
    enhanced += '**Mathematical Precision Required**: ';
    enhanced += intent.requiresPrecision ? 'YES - Apply strict validation\n' : 'STANDARD\n';
    enhanced += `**Intent**: ${intent.type} (confidence: ${Math.round(intent.confidence * 100)}%)\n`;
    enhanced += `**Complexity**: ${intent.complexity}\n`;
    enhanced += `**Active Persona**: ${personaContext.personaName}\n`;

    // Add project context if relevant
    if (projectContext.projectType !== 'unknown') {
      enhanced += '\n## Project Context\n';
      enhanced += `**Type**: ${projectContext.projectType}\n`;
      enhanced += `**Language**: ${projectContext.language}\n`;
      if (projectContext.framework !== 'unknown') {
        enhanced += `**Framework**: ${projectContext.framework}\n`;
      }
      enhanced += `**Has Tests**: ${projectContext.hasTests ? 'Yes' : 'No'}\n`;
      enhanced += `**Has Config**: ${projectContext.hasConfig ? 'Yes' : 'No'}\n`;
    }

    // Add technical keywords if found
    if (intent.keywords.length > 0) {
      enhanced += '\n## Technical Keywords Detected\n';
      enhanced += intent.keywords.map(k => `- ${k}`).join('\n') + '\n';
    }

    // Add persona-specific guidance
    enhanced += '\n## Response Guidelines\n';
    enhanced += `**Verbosity**: ${personaContext.preferences.verbosity}\n`;
    enhanced += `**Technical Depth**: ${personaContext.preferences.technicalDepth}\n`;
    enhanced += `**Quality Focus**: ${personaContext.preferences.qualityFocus}\n`;

    // Add mathematical precision requirements for specific intents
    if (intent.requiresPrecision) {
      enhanced += '\n## ASCII VIBE CODEX Requirements\n';
      enhanced += '- Apply mathematical precision to all outputs\n';
      enhanced += '- Validate all border integrity\n';
      enhanced += '- Use persona-appropriate communication style\n';
      enhanced += '- Include quality metrics when relevant\n';
    }

    // Add the original prompt
    enhanced += '\n## User Request\n';
    enhanced += originalPrompt;

    return enhanced;
  }

  /**
   * Shows a preview of the enhancement to the user
   * LEARNING: This shows you what context was added to help Claude understand better
   */
  showEnhancementPreview(original, enhanced) {
    const terminalWidth = process.stdout.columns || 80;
    const previewWidth = Math.min(60, terminalWidth - 4);

    // Create preview border
    const border = this.codex.borderEngine.createBorder(
      previewWidth, 
      8, 
      'single', 
      'PROMPT ENHANCED'
    );

    console.log(chalk.blue('\n📝 ASCII VIBE CODEX - Prompt Enhancement'));
    border.forEach(line => console.log(chalk.gray(line)));
    
    console.log(chalk.yellow('  🎯 Added context for better precision'));
    console.log(chalk.green('  ✅ Persona preferences applied'));
    console.log(chalk.blue('  📊 Project context included'));
    console.log(chalk.gray('  🚀 Sending enhanced prompt to Claude...\n'));
  }
}

// LEARNING: Main function that Claude Code calls
async function main() {
  // Get the user prompt from Claude Code
  const userPrompt = process.argv[2] || '';
  const contextString = process.argv[3] || '{}';
  
  try {
    const context = JSON.parse(contextString);
    const enhancer = new PromptEnhancer();
    const result = await enhancer.enhancePrompt(userPrompt, context);
    
    // Output the result for Claude Code
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    // Fallback to original prompt
    console.log(JSON.stringify({
      success: false,
      originalPrompt: userPrompt,
      enhancedPrompt: userPrompt,
      error: error.message
    }, null, 2));
  }
}

// LEARNING: Run the enhancer if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red(`Prompt enhancement error: ${error.message}`));
    process.exit(1);
  });
}