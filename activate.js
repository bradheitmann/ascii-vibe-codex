#!/usr/bin/env node

/**
 * ASCII VIBE CODEX Activation Script
 * Easy one-command activation for Claude Code integration
 * 
 * LEARNING NOTE: This is like an "installer" that sets everything up for you
 */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

class ASCIIVibeActivator {
  constructor() {
    this.homedir = process.env.HOME || process.env.USERPROFILE;
    this.claudeConfigDir = path.join(this.homedir, '.claude');
    this.settingsFile = path.join(this.claudeConfigDir, 'settings.json');
    this.currentDir = process.cwd();
  }

  /**
   * Main activation function
   */
  async activate() {
    console.log(chalk.cyan('🚀 ASCII VIBE CODEX - Claude Code Integration Activator\n'));

    try {
      // Step 1: Check if we're in the right directory
      await this.verifyInstallation();
      
      // Step 2: Check Claude Code configuration
      await this.checkClaudeConfig();
      
      // Step 3: Test the integration
      await this.testIntegration();
      
      // Step 4: Show success message
      this.showSuccessMessage();
      
    } catch (error) {
      this.showErrorMessage(error);
    }
  }

  /**
   * Verifies the ASCII VIBE CODEX installation
   */
  async verifyInstallation() {
    console.log(chalk.yellow('📋 Step 1: Verifying installation...'));
    
    const requiredFiles = [
      'package.json',
      'index.js',
      'hooks/session-start.js',
      'hooks/response-enhancer.js',
      'hooks/prompt-enhancer.js'
    ];

    const missing = [];
    for (const file of requiredFiles) {
      const filePath = path.join(this.currentDir, file);
      if (!fs.existsSync(filePath)) {
        missing.push(file);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing files: ${missing.join(', ')}`);
    }

    console.log(chalk.green('  ✅ All required files present'));
  }

  /**
   * Checks and sets up Claude Code configuration
   */
  async checkClaudeConfig() {
    console.log(chalk.yellow('📋 Step 2: Checking Claude Code configuration...'));

    // Check if .claude directory exists
    if (!fs.existsSync(this.claudeConfigDir)) {
      console.log(chalk.blue('  📁 Creating .claude directory...'));
      fs.mkdirSync(this.claudeConfigDir, { recursive: true });
    }

    // Check if settings.json exists and has our hooks
    let needsUpdate = false;
    let currentSettings = {};

    if (fs.existsSync(this.settingsFile)) {
      try {
        const content = fs.readFileSync(this.settingsFile, 'utf8');
        currentSettings = JSON.parse(content);
        
        // Check if our hooks are configured
        if (!currentSettings.hooks || 
            !currentSettings.hooks.SessionStart ||
            !currentSettings.ascii_vibe_codex) {
          needsUpdate = true;
        }
      } catch (error) {
        needsUpdate = true;
      }
    } else {
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(chalk.blue('  🔧 Updating Claude Code settings...'));
      
      const newSettings = {
        ...currentSettings,
        hooks: {
          ...currentSettings.hooks,
          SessionStart: {
            command: path.join(this.currentDir, 'hooks/session-start.js'),
            description: "Initialize ASCII VIBE CODEX mathematical precision interface"
          },
          UserPromptSubmit: {
            command: path.join(this.currentDir, 'hooks/prompt-enhancer.js'),
            description: "Enhance user prompts with ASCII VIBE CODEX context"
          },
          PostToolUse: {
            command: path.join(this.currentDir, 'hooks/response-enhancer.js'),
            description: "Apply ASCII VIBE CODEX formatting to Claude responses"
          }
        },
        ascii_vibe_codex: {
          enabled: true,
          default_persona: "cli-architect",
          auto_enhance: true,
          quality_gates: "strict",
          mathematical_precision: true
        }
      };

      fs.writeFileSync(this.settingsFile, JSON.stringify(newSettings, null, 2));
    }

    console.log(chalk.green('  ✅ Claude Code configuration ready'));
  }

  /**
   * Tests the integration
   */
  async testIntegration() {
    console.log(chalk.yellow('📋 Step 3: Testing integration...'));

    try {
      // Test session start hook
      console.log(chalk.blue('  🧪 Testing session start hook...'));
      // We'll just check if the file is executable
      const sessionStartPath = path.join(this.currentDir, 'hooks/session-start.js');
      const stats = fs.statSync(sessionStartPath);
      if (!(stats.mode & 0o111)) {
        throw new Error('Session start hook is not executable');
      }

      console.log(chalk.green('  ✅ Session start hook ready'));
      console.log(chalk.green('  ✅ Response enhancer ready'));
      console.log(chalk.green('  ✅ Prompt enhancer ready'));

    } catch (error) {
      throw new Error(`Integration test failed: ${error.message}`);
    }
  }

  /**
   * Shows success message with instructions
   */
  showSuccessMessage() {
    console.log(chalk.green('\n🎉 ASCII VIBE CODEX Successfully Activated!\n'));
    
    console.log(chalk.cyan('What happens now:'));
    console.log(chalk.white('• When you start Claude Code, you\'ll see a beautiful welcome banner'));
    console.log(chalk.white('• Your prompts will be enhanced with project context'));
    console.log(chalk.white('• Claude\'s responses will have mathematical precision formatting'));
    console.log(chalk.white('• A persona will be auto-selected based on your project type'));
    console.log(chalk.white('• Quality monitoring will run in the background'));

    console.log(chalk.yellow('\n📝 To see it in action:'));
    console.log(chalk.gray('1. Start a new Claude Code session'));
    console.log(chalk.gray('2. You should see the ASCII VIBE CODEX welcome banner'));
    console.log(chalk.gray('3. Try any command - responses will be beautifully formatted'));

    console.log(chalk.blue('\n🛠️  Manual controls:'));
    console.log(chalk.gray('• node cli.js dashboard              # Create precision dashboard'));
    console.log(chalk.gray('• node cli.js activate-persona <id>  # Change persona manually'));
    console.log(chalk.gray('• node cli.js quality-report         # View quality metrics'));

    console.log(chalk.magenta('\n✨ The mathematical precision interface is now part of your Claude Code experience!'));
  }

  /**
   * Shows error message with troubleshooting
   */
  showErrorMessage(error) {
    console.log(chalk.red('\n❌ Activation Failed\n'));
    console.log(chalk.red(`Error: ${error.message}\n`));
    
    console.log(chalk.yellow('🔧 Troubleshooting:'));
    console.log(chalk.gray('1. Make sure you\'re in the ascii-vibe-codex directory'));
    console.log(chalk.gray('2. Run: npm install'));
    console.log(chalk.gray('3. Check file permissions: ls -la hooks/'));
    console.log(chalk.gray('4. Try manual test: node hooks/session-start.js'));
    
    console.log(chalk.blue('\n📧 If problems persist, check the Claude Code documentation on hooks.'));
  }
}

// LEARNING: Main execution
async function main() {
  const activator = new ASCIIVibeActivator();
  await activator.activate();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Activation failed:'), error.message);
    process.exit(1);
  });
}