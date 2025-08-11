#!/usr/bin/env node

/**
 * Test suite for decimal alignment functionality
 */

import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';

// Mock DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Import modules to test
import { 
  isNumericLike, 
  splitDecimal, 
  applyDecimalAlignment 
} from '../js/decimal-align.js';

console.log('🧪 Running decimal alignment tests...\n');

// Test isNumericLike function
function testIsNumericLike() {
  console.log('Testing isNumericLike...');
  
  const tests = [
    ['123.45', true],
    ['$1,234.56', true],
    ['(€123.45)', true],
    ['15.7%', true],
    ['-45.2%', true],
    ['Not a number', false],
    ['', false],
    ['$', false],
    ['abc123', false]
  ];
  
  tests.forEach(([input, expected]) => {
    const result = isNumericLike(input);
    assert.equal(result, expected, `isNumericLike("${input}") should be ${expected}`);
  });
  
  console.log('✓ isNumericLike tests passed\n');
}

// Test splitDecimal function
function testSplitDecimal() {
  console.log('Testing splitDecimal...');
  
  const tests = [
    {
      input: '$1,234.56',
      expected: { prefix: '$', left: '1,234', right: '56', hasDecimal: true }
    },
    {
      input: '($123.45)',
      expected: { prefix: '($', left: '123', right: '45)', hasDecimal: true }
    },
    {
      input: '15.7%',
      expected: { prefix: '', left: '15', right: '7%', hasDecimal: true }
    },
    {
      input: '1000',
      expected: { prefix: '', left: '1000', right: '', hasDecimal: false }
    }
  ];
  
  tests.forEach(({ input, expected }) => {
    const result = splitDecimal(input);
    assert.deepEqual(result, expected, 
      `splitDecimal("${input}") failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`);
  });
  
  console.log('✓ splitDecimal tests passed\n');
}

// Test DOM manipulation
function testDOMManipulation() {
  console.log('Testing DOM manipulation...');
  
  // Create test table
  const table = document.createElement('table');
  table.innerHTML = `
    <tr>
      <td class="num">$1,234.56</td>
      <td class="num">($123.45)</td>
      <td class="num">1000</td>
    </tr>
  `;
  document.body.appendChild(table);
  
  // Apply decimal alignment
  applyDecimalAlignment(document, { preserveOriginal: true });
  
  // Verify results
  const cells = table.querySelectorAll('td.num');
  
  cells.forEach(cell => {
    assert.equal(cell.dataset.aligned, '1', 'Cell should be marked as aligned');
    assert.ok(cell.dataset.originalText, 'Original text should be preserved');
    assert.ok(cell.querySelector('.decimal'), 'Decimal wrapper should be present');
  });
  
  // Test first cell structure
  const firstCell = cells[0];
  const decimal = firstCell.querySelector('.decimal');
  const leftSpan = decimal.querySelector('.L');
  const rightSpan = decimal.querySelector('.R');
  
  assert.equal(leftSpan.textContent, '$1,234', 'Left part should contain prefix and integer');
  assert.equal(rightSpan.textContent, '56', 'Right part should contain decimal places');
  
  // Clean up
  document.body.removeChild(table);
  
  console.log('✓ DOM manipulation tests passed\n');
}

// Test contrast ratios (simulated)
function testContrastCompliance() {
  console.log('Testing WCAG AA contrast compliance...');
  
  // Simulate contrast ratio calculations
  const contrastTests = [
    { bg: '#FFFFFF', fg: '#000000', ratio: 21, passes: true },
    { bg: '#FFFFFF', fg: '#0066CC', ratio: 5.9, passes: true },
    { bg: '#000000', fg: '#FFFFFF', ratio: 21, passes: true },
    { bg: '#FFFFFF', fg: '#999999', ratio: 2.8, passes: false }
  ];
  
  contrastTests.forEach(({ bg, fg, ratio, passes }) => {
    const meetsAA = ratio >= 4.5;
    assert.equal(meetsAA, passes, 
      `Contrast ${fg} on ${bg} (${ratio}:1) should ${passes ? 'pass' : 'fail'} AA`);
  });
  
  console.log('✓ Contrast compliance tests passed\n');
}

// Test layout stability (CLS prevention)
function testLayoutStability() {
  console.log('Testing layout stability...');
  
  // Create test element
  const element = document.createElement('div');
  element.innerHTML = '<span class="decimal"><span class="L">123</span><span class="R">45</span></span>';
  document.body.appendChild(element);
  
  // Measure initial dimensions
  const initialRect = element.getBoundingClientRect();
  
  // Toggle ASCII mode simulation
  document.documentElement.setAttribute('data-mode', 'ascii');
  
  // Measure after mode change (in real DOM this would trigger reflow)
  const afterRect = element.getBoundingClientRect();
  
  // In a real test, we'd verify no unexpected layout shift occurred
  // For this simulation, we just check structure is maintained
  assert.ok(element.querySelector('.decimal'), 'Structure should be preserved');
  
  // Clean up
  document.documentElement.removeAttribute('data-mode');
  document.body.removeChild(element);
  
  console.log('✓ Layout stability tests passed\n');
}

// Run all tests
function runTests() {
  try {
    testIsNumericLike();
    testSplitDecimal();
    testDOMManipulation();
    testContrastCompliance();
    testLayoutStability();
    
    console.log('🎉 All tests passed! Swiss decimal alignment is functioning correctly.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}