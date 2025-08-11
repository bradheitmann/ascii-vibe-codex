import React, { useEffect, useRef } from 'react';

interface AsciiTableProps {
  headers: string[];
  rows: (string | number)[][];
  className?: string;
  decimalAlign?: boolean;
  compact?: boolean;
}

export function AsciiTable({ 
  headers, 
  rows, 
  className = '',
  decimalAlign = true,
  compact = false 
}: AsciiTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  // Apply decimal alignment after render
  useEffect(() => {
    if (!decimalAlign || !tableRef.current) return;
    
    // Import decimal alignment dynamically to avoid SSR issues
    import('../js/decimal-align.js').then(({ applyDecimalAlignment }) => {
      if (tableRef.current) {
        applyDecimalAlignment(tableRef.current);
      }
    }).catch(error => {
      console.warn('Failed to load decimal alignment:', error);
    });
  }, [rows, decimalAlign]);

  // Detect numeric columns for proper alignment
  const columnTypes = React.useMemo(() => {
    if (!rows.length) return [];
    
    return headers.map((_, colIndex) => {
      const columnValues = rows.map(row => row[colIndex]);
      const numericCount = columnValues.filter(value => {
        if (value == null) return false;
        const str = String(value).trim();
        // Simple numeric detection
        return /^[\-\+\(\)]?[\$€£¥]?[\d\s,.\u2009]+[\)%]?$/.test(str);
      }).length;
      
      return numericCount > rows.length * 0.5 ? 'numeric' : 'text';
    });
  }, [headers, rows]);

  const tableClasses = [
    'suisse',
    compact ? 'suisse-compact' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <table 
      ref={tableRef}
      className={tableClasses}
      data-decimal-align={decimalAlign}
    >
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => {
              const isNumeric = columnTypes[cellIndex] === 'numeric';
              const cellClasses = isNumeric ? 'num' : '';
              
              return (
                <td 
                  key={cellIndex}
                  className={cellClasses}
                  data-decimal={isNumeric && decimalAlign}
                >
                  {cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Additional table utilities
interface TableSummaryProps {
  data: Record<string, number>;
  title?: string;
  format?: 'currency' | 'percent' | 'number';
  precision?: number;
}

export function TableSummary({ 
  data, 
  title = 'Summary',
  format = 'number',
  precision = 2
}: TableSummaryProps) {
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: precision
        }).format(value);
      case 'percent':
        return new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: precision
        }).format(value / 100);
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
    }
  };

  const summaryRows = Object.entries(data).map(([key, value]) => [
    key,
    formatValue(value)
  ]);

  return (
    <AsciiTable 
      headers={[title, 'Value']}
      rows={summaryRows}
      className="table-summary"
      compact
    />
  );
}

// Responsive table wrapper
interface ResponsiveTableProps {
  children: React.ReactNode;
  breakpoint?: number;
  stackOn?: 'mobile' | 'tablet';
}

export function ResponsiveTable({ 
  children, 
  stackOn = 'mobile' 
}: ResponsiveTableProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={wrapperRef}
      className={`table-responsive table-stack-${stackOn}`}
      style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
}