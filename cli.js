#!/usr/bin/env node

/**
 * ASCII VIBE CODEX CLI Interface
 * Command-line interface for the mathematical precision text-based UI system
 */

import { Command } from 'commander';
import ASCIIVibeCodex from './index.js';
import chalk from 'chalk';

const program = new Command();
const codex = new ASCIIVibeCodex();

program
  .name('ascii-vibe')
  .description('ASCII VIBE CODEX SYNTHESIS CLI v7.0 - Mathematical precision text-based UI')
  .version('7.0.0');

program
  .command('demo')
  .description('Run comprehensive system demonstration')
  .action(async () => {
    await codex.runDemo();
  });

program
  .command('dashboard')
  .description('Create mathematical precision dashboard')
  .option('-w, --width <number>', 'Terminal width', process.stdout.columns || 80)
  .option('-h, --height <number>', 'Terminal height', process.stdout.rows || 24)
  .action(async (options) => {
    await codex.initialize();
    
    codex.terminalDimensions = {
      width: parseInt(options.width),
      height: parseInt(options.height)
    };
    
    try {
      const dashboard = codex.createDemoDashboard();
      dashboard.forEach(line => console.log(line));
      console.log(chalk.green('\n✓ Dashboard created with mathematical precision'));
    } catch (error) {
      console.error(chalk.red('Dashboard creation failed:'), error.message);
    }
  });

program
  .command('motion')
  .description('Demonstrate motion graphics capabilities')
  .action(async () => {
    await codex.initialize();
    await codex.demonstrateMotionGraphics();
  });

program
  .command('personas')
  .description('Show persona system capabilities')
  .action(async () => {
    await codex.initialize();
    codex.demonstratePersonaSystem();
  });

program
  .command('test-borders')
  .description('Run border integrity tests')
  .action(async () => {
    await codex.initialize();
    await codex.testBorderIntegrity();
  });

program
  .command('quality-report')
  .description('Generate quality validation report')
  .action(async () => {
    await codex.initialize();
    codex.showQualityReport();
  });

program
  .command('create-border')
  .description('Create a single border with mathematical precision')
  .option('-w, --width <number>', 'Border width', '30')
  .option('-h, --height <number>', 'Border height', '10')
  .option('-s, --style <style>', 'Border style (single|double|heavy)', 'single')
  .option('-t, --title <title>', 'Border title', '')
  .action(async (options) => {
    await codex.initialize();
    
    try {
      const width = parseInt(options.width);
      const height = parseInt(options.height);
      
      const border = codex.borderEngine.createBorder(width, height, options.style, options.title);
      const validation = codex.qualityEngine.validateBorderIntegrity(border, width, height);
      
      border.forEach(line => console.log(chalk.cyan(line)));
      
      if (validation.isValid) {
        console.log(chalk.green(`\n✓ Border validation passed - Score: ${validation.score}%`));
      } else {
        console.log(chalk.red(`\n✗ Border validation failed:`));
        validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
      }
    } catch (error) {
      console.error(chalk.red('Border creation failed:'), error.message);
    }
  });

program
  .command('activate-persona')
  .description('Activate a specific persona')
  .argument('<persona-id>', 'Persona identifier (cli-architect|performance-monitor|quality-assurance)')
  .action(async (personaId) => {
    await codex.initialize();
    
    try {
      const response = codex.personaEngine.activatePersona(personaId);
      console.log(chalk.blue(response));
      
      const metrics = codex.personaEngine.getPerformanceMetrics();
      if (metrics) {
        console.log(chalk.yellow('\nPersona Metrics:'));
        console.log(chalk.white(`Activation Count: ${metrics.activationCount}`));
        console.log(chalk.white(`Success Rate: ${metrics.metrics.successRate}%`));
      }
    } catch (error) {
      console.error(chalk.red('Persona activation failed:'), error.message);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Invalid command. Use --help for available commands.'));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan('\nQuick start: ascii-vibe demo'));
}