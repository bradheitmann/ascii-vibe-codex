'use client';

import React from 'react';
import { useAscii } from '../../packages/swiss-ascii-kit/react/AsciiProvider';
import { AsciiTable, TableSummary } from '../../packages/swiss-ascii-kit/react/AsciiTable';
import Spark, { Trend, MetricSpark } from '../../packages/swiss-ascii-kit/react/Spark';

// Sample data for demonstrations
const sampleFinancialData = [
  ['Product A', '$1,234,567.89', '+15.7%', '23.4%'],
  ['Product B', '($45,678.12)', '-2.3%', '18.9%'],
  ['Product C', '$987,654.32', '+8.1%', '31.2%'],
  ['Product D', '$2,456.78', '+45.2%', '12.8%'],
];

const performanceMetrics = [1, 4, 6, 9, 8, 6, 4, 1, 3, 7, 5, 8];
const userGrowth = [100, 150, 145, 200, 280, 350, 420, 380, 450, 520];
const revenueData = [12000, 15000, 13500, 18000, 22000, 25000, 28000, 26000, 31000, 35000];

export default function HomePage() {
  const { ascii, toggleAscii } = useAscii();

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={toggleAscii}
        className="ascii-toggle"
        aria-label={`Switch to ${ascii ? 'visual' : 'ASCII'} mode`}
      >
        {ascii ? '🖼️ Visual' : '📄 ASCII'} Mode
      </button>

      {/* Keyboard Shortcut Hint */}
      <div className="keyboard-hint">
        Press Ctrl+Shift+A to toggle
      </div>

      <main>
        <header className="demo-section">
          <h1>
            Swiss International Style Demo
            <span className="mode-indicator">
              {ascii ? 'ASCII' : 'VISUAL'}
            </span>
          </h1>
          <p>
            This page demonstrates Swiss design principles with seamless ASCII mode switching. 
            All typography, tables, and micro-visualizations maintain their information 
            density and precision across both visual and text-only presentations.
          </p>
        </header>

        <section className="demo-section">
          <h2>Typography Hierarchy</h2>
          <h1>Heading Level 1 - Primary</h1>
          <h2>Heading Level 2 - Secondary</h2>
          <h3>Heading Level 3 - Tertiary</h3>
          <h4>Heading Level 4 - Quaternary</h4>
          
          <p>
            Body text maintains optimal reading flow with Swiss rag-right alignment. 
            No centering. No justified text. Clean, functional typography that serves 
            the content without distraction.
          </p>
          
          <ul>
            <li>List items use Swiss en-dash bullets</li>
            <li>Consistent spacing follows baseline grid</li>
            <li>Information hierarchy remains clear in ASCII mode</li>
          </ul>
        </section>

        <section className="demo-section">
          <h2>Decimal-Aligned Financial Tables</h2>
          <p>
            Swiss precision meets financial data. Notice how currency values, percentages, 
            and numbers align perfectly on decimal points in both modes.
          </p>
          
          <AsciiTable 
            headers={['Product', 'Revenue', 'Growth', 'Margin']}
            rows={sampleFinancialData}
            decimalAlign={true}
          />

          <h3>Summary Data</h3>
          <TableSummary 
            title="Totals"
            data={{
              'Total Revenue': 2179202.87,
              'Average Growth': 16.675,
              'Weighted Margin': 21.575
            }}
            format="number"
            precision={2}
          />
        </section>

        <section className="demo-section">
          <h2>Micro-Visualizations</h2>
          <p>
            Deterministic sparklines provide context without overwhelming the data. 
            Unicode characters in visual mode, ASCII fallbacks for text-only.
          </p>

          <div className="grid">
            <div className="col-4">
              <MetricSpark 
                label="Performance Score"
                value={7.2}
                trend={performanceMetrics}
                unit="/10"
                precision={1}
              />
            </div>
            <div className="col-4">
              <MetricSpark 
                label="User Growth"
                value={520}
                trend={userGrowth}
                format="number"
                precision={0}
              />
            </div>
            <div className="col-4">
              <MetricSpark 
                label="Monthly Revenue"
                value={35000}
                trend={revenueData}
                format="currency"
                precision={0}
              />
            </div>
          </div>

          <h3>Trend Analysis</h3>
          <table className="suisse">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Trend</th>
                <th>Sparkline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Performance</td>
                <td className="num">7.2/10</td>
                <td>
                  <Trend values={performanceMetrics} showDirection showPercentage />
                </td>
                <td>
                  <Spark values={performanceMetrics} />
                </td>
              </tr>
              <tr>
                <td>Users</td>
                <td className="num">520</td>
                <td>
                  <Trend values={userGrowth} showDirection showPercentage />
                </td>
                <td>
                  <Spark values={userGrowth} />
                </td>
              </tr>
              <tr>
                <td>Revenue</td>
                <td className="num">$35,000</td>
                <td>
                  <Trend values={revenueData} showDirection showPercentage />
                </td>
                <td>
                  <Spark values={revenueData} />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="demo-section">
          <h2>Responsive Layout</h2>
          <p>
            Swiss grid system adapts gracefully. Visual mode uses CSS Grid with 
            precise gutters. ASCII mode collapses to linear flow while maintaining 
            information hierarchy.
          </p>
          
          <div className="grid">
            <div className="col-6">
              <h3>Column One</h3>
              <p>Content flows naturally within the Swiss grid system.</p>
              <Spark values={[1, 3, 2, 5, 4, 6, 5, 7]} />
            </div>
            <div className="col-6">
              <h3>Column Two</h3>
              <p>Layout maintains clarity across mode switches.</p>
              <Spark values={[7, 5, 6, 4, 5, 2, 3, 1]} />
            </div>
          </div>
        </section>

        <footer className="demo-section">
          <h2>Accessibility & Standards</h2>
          <p>
            This implementation maintains WCAG AA contrast ratios, supports 
            screen readers, includes keyboard navigation, and ensures zero 
            layout shift (CLS = 0) during mode transitions.
          </p>
          
          <ul>
            <li>Semantic HTML structure preserved in both modes</li>
            <li>Tabular numerals for consistent number alignment</li>
            <li>Focus management and keyboard shortcuts</li>
            <li>High contrast support and reduced motion compliance</li>
          </ul>

          <p>
            <strong>ASCII VIBE CODEX</strong> — Swiss precision meets universal access.
          </p>
        </footer>
      </main>
    </>
  );
}