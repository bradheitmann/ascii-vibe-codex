#!/usr/bin/env node

/**
 * ASCII VIBE CODEX - Precision Tests
 * Comprehensive mathematical precision validation tests
 */

import { BorderEngine } from '../src/engines/BorderEngine.js';
import { QualityEngine } from '../src/engines/QualityEngine.js';
import chalk from 'chalk';

class PrecisionTester {
  constructor() {
    this.borderEngine = new BorderEngine();
    this.qualityEngine = new QualityEngine();
    this.testResults = [];
  }

  /**
   * Runs comprehensive precision tests
   */
  async runAllTests() {
    console.log(chalk.cyan('ASCII VIBE CODEX - Mathematical Precision Tests'));
    console.log(chalk.gray('═'.repeat(60)));

    const tests = [
      { name: 'Basic Border Validation', test: () => this.testBasicBorders() },
      { name: 'Edge Case Dimensions', test: () => this.testEdgeCases() },
      { name: 'Title Integration', test: () => this.testTitleIntegration() },
      { name: 'Style Consistency', test: () => this.testStyleConsistency() },
      { name: 'Layout Precision', test: () => this.testLayoutPrecision() },
      { name: 'Performance Thresholds', test: () => this.testPerformance() },
      { name: 'Error Handling', test: () => this.testErrorHandling() }
    ];

    for (const { name, test } of tests) {
      console.log(chalk.yellow(`\n🧪 Testing: ${name}`));
      
      try {
        const result = await test();
        this.testResults.push({ name, ...result });
        
        if (result.passed) {
          console.log(chalk.green(`✓ PASS - ${result.message || 'All validations successful'}`));
        } else {
          console.log(chalk.red(`✗ FAIL - ${result.message}`));
          if (result.details) {
            result.details.forEach(detail => {
              console.log(chalk.red(`  • ${detail}`));
            });
          }
        }
      } catch (error) {
        this.testResults.push({ name, passed: false, message: error.message });
        console.log(chalk.red(`✗ ERROR - ${error.message}`));
      }
    }

    this.printSummary();
  }

  /**
   * Tests basic border creation and validation
   */
  testBasicBorders() {
    const testCases = [
      { width: 10, height: 5, style: 'single' },
      { width: 20, height: 8, style: 'double' },
      { width: 15, height: 6, style: 'heavy' },
      { width: 50, height: 15, style: 'single' }
    ];

    const failures = [];

    for (const testCase of testCases) {
      try {
        const border = this.borderEngine.createBorder(testCase.width, testCase.height, testCase.style);
        const validation = this.qualityEngine.validateBorderIntegrity(border, testCase.width, testCase.height);
        
        if (!validation.isValid) {
          failures.push(`${testCase.width}x${testCase.height} ${testCase.style}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        failures.push(`${testCase.width}x${testCase.height} ${testCase.style}: ${error.message}`);
      }
    }

    return {
      passed: failures.length === 0,
      message: failures.length === 0 ? `${testCases.length} border configurations validated` : `${failures.length} failures detected`,
      details: failures
    };
  }

  /**
   * Tests edge case dimensions
   */
  testEdgeCases() {
    const edgeCases = [
      { width: 3, height: 3, expectValid: true },
      { width: 2, height: 3, expectValid: false },
      { width: 3, height: 2, expectValid: false },
      { width: 100, height: 50, expectValid: true },
      { width: 3.5, height: 5, expectValid: false },
      { width: 5, height: 3.7, expectValid: false }
    ];

    const failures = [];

    for (const testCase of edgeCases) {
      try {
        const border = this.borderEngine.createBorder(testCase.width, testCase.height, 'single');
        
        if (!testCase.expectValid) {
          failures.push(`Expected failure for ${testCase.width}x${testCase.height} but border was created`);
        }
      } catch (error) {
        if (testCase.expectValid) {
          failures.push(`Unexpected failure for ${testCase.width}x${testCase.height}: ${error.message}`);
        }
      }
    }

    return {
      passed: failures.length === 0,
      message: failures.length === 0 ? 'All edge cases handled correctly' : 'Edge case validation failed',
      details: failures
    };
  }

  /**
   * Tests title integration precision
   */
  testTitleIntegration() {
    const titleTests = [
      { width: 20, height: 5, title: 'Test', expectValid: true },
      { width: 10, height: 5, title: 'Short', expectValid: true },
      { width: 15, height: 5, title: 'This is a very long title that should be truncated', expectValid: true },
      { width: 8, height: 5, title: 'Overflow', expectValid: true }
    ];

    const failures = [];

    for (const testCase of titleTests) {
      try {
        const border = this.borderEngine.createBorder(testCase.width, testCase.height, 'single', testCase.title);
        const validation = this.qualityEngine.validateBorderIntegrity(border, testCase.width, testCase.height);
        
        if (!validation.isValid) {
          failures.push(`Title "${testCase.title}" in ${testCase.width}x${testCase.height}: ${validation.errors.join(', ')}`);
        }

        // Check that title doesn't break border width
        if (border[0].length !== testCase.width) {
          failures.push(`Title "${testCase.title}" broke width constraint: expected ${testCase.width}, got ${border[0].length}`);
        }
      } catch (error) {
        failures.push(`Title "${testCase.title}": ${error.message}`);
      }
    }

    return {
      passed: failures.length === 0,
      message: failures.length === 0 ? 'Title integration maintains mathematical precision' : 'Title integration failed',
      details: failures
    };
  }

  /**
   * Tests style consistency across all border types
   */
  testStyleConsistency() {
    const styles = ['single', 'double', 'heavy'];
    const dimensions = { width: 15, height: 8 };
    const failures = [];

    for (const style of styles) {
      try {
        const border = this.borderEngine.createBorder(dimensions.width, dimensions.height, style);
        const validation = this.qualityEngine.validateBorderIntegrity(border, dimensions.width, dimensions.height);
        
        if (!validation.isValid) {
          failures.push(`Style "${style}": ${validation.errors.join(', ')}`);
        }

        // Verify style-specific characters are used
        const topLine = border[0];
        const charset = this.borderEngine.getCharSet(style);
        
        if (!topLine.includes(charset.topLeft) || !topLine.includes(charset.topRight)) {
          failures.push(`Style "${style}" not using correct corner characters`);
        }
      } catch (error) {
        failures.push(`Style "${style}": ${error.message}`);
      }
    }

    return {
      passed: failures.length === 0,
      message: failures.length === 0 ? 'All border styles maintain consistency' : 'Style consistency failed',
      details: failures
    };
  }

  /**
   * Tests layout mathematical precision
   */
  testLayoutPrecision() {
    const terminalDimensions = { width: 80, height: 24 };
    
    const layouts = [
      // Valid layout
      [
        { x: 0, y: 0, width: 20, height: 10 },
        { x: 25, y: 0, width: 20, height: 10 },
        { x: 50, y: 0, width: 20, height: 10 }
      ],
      // Overlapping layout
      [
        { x: 0, y: 0, width: 20, height: 10 },
        { x: 15, y: 5, width: 20, height: 10 }
      ],
      // Overflow layout
      [
        { x: 70, y: 0, width: 20, height: 10 }
      ]
    ];

    const results = layouts.map((layout, index) => {
      const validation = this.qualityEngine.validateLayoutPrecision(layout, terminalDimensions);
      return {
        layout: index + 1,
        isValid: validation.isValid,
        score: validation.score,
        errors: validation.errors,
        warnings: validation.warnings
      };
    });

    const expectedResults = [true, false, false]; // Valid, overlapping, overflow
    const failures = [];

    results.forEach((result, index) => {
      if (result.isValid !== expectedResults[index]) {
        failures.push(`Layout ${index + 1}: expected ${expectedResults[index] ? 'valid' : 'invalid'}, got ${result.isValid ? 'valid' : 'invalid'}`);
      }
    });

    return {
      passed: failures.length === 0,
      message: failures.length === 0 ? 'Layout precision validation accurate' : 'Layout precision validation failed',
      details: failures
    };
  }

  /**
   * Tests performance thresholds
   */
  testPerformance() {
    const performanceTests = [];
    const startTime = performance.now();

    // Test large border creation
    for (let i = 0; i < 100; i++) {
      const border = this.borderEngine.createBorder(20, 10, 'single');
      this.qualityEngine.validateBorderIntegrity(border, 20, 10);
    }

    const endTime = performance.now();
    const averageTime = (endTime - startTime) / 100;

    performanceTests.push({
      test: 'Border creation (100 iterations)',
      time: averageTime,
      threshold: 5, // 5ms threshold
      passed: averageTime < 5
    });

    const failures = performanceTests.filter(test => !test.passed).map(test => 
      `${test.test}: ${test.time.toFixed(2)}ms (threshold: ${test.threshold}ms)`
    );

    return {
      passed: failures.length === 0,
      message: failures.length === 0 ? `Performance within thresholds (avg: ${averageTime.toFixed(2)}ms)` : 'Performance thresholds exceeded',
      details: failures
    };
  }

  /**
   * Tests error handling robustness
   */
  testErrorHandling() {
    const errorTests = [
      {
        name: 'Invalid dimensions',
        test: () => this.borderEngine.createBorder(-5, 10, 'single'),
        expectError: true
      },
      {
        name: 'Invalid style',
        test: () => this.borderEngine.createBorder(10, 5, 'invalid'),
        expectError: false // Should default to single
      },
      {
        name: 'Zero dimensions',
        test: () => this.borderEngine.createBorder(0, 0, 'single'),
        expectError: true
      }
    ];

    const failures = [];

    for (const errorTest of errorTests) {
      try {
        errorTest.test();
        if (errorTest.expectError) {
          failures.push(`${errorTest.name}: Expected error but none was thrown`);
        }
      } catch (error) {
        if (!errorTest.expectError) {
          failures.push(`${errorTest.name}: Unexpected error: ${error.message}`);
        }
      }
    }

    return {
      passed: failures.length === 0,
      message: failures.length === 0 ? 'Error handling robust' : 'Error handling issues detected',
      details: failures
    };
  }

  /**
   * Prints test summary
   */
  printSummary() {
    console.log(chalk.cyan('\n📊 Test Summary'));
    console.log(chalk.gray('═'.repeat(40)));

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const percentage = ((passed / total) * 100).toFixed(1);

    console.log(chalk.white(`Tests Run: ${total}`));
    console.log(chalk.green(`Passed: ${passed}`));
    console.log(chalk.red(`Failed: ${total - passed}`));
    console.log(chalk.yellow(`Success Rate: ${percentage}%`));

    if (passed === total) {
      console.log(chalk.green('\n🎉 All tests passed! Mathematical precision validated.'));
    } else {
      console.log(chalk.red('\n⚠️  Some tests failed. Review failures above.'));
    }

    console.log(chalk.gray('\nASCII VIBE CODEX - Mathematical Precision Testing Complete'));
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PrecisionTester();
  tester.runAllTests().catch(console.error);
}

export default PrecisionTester;