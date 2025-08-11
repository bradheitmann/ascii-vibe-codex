import React, { useMemo, useEffect, useState } from 'react';
import { useAscii } from './AsciiProvider';

interface SparkProps {
  values: number[];
  className?: string;
  seed?: number;
  variation?: number;
  label?: string;
  'aria-label'?: string;
}

export default function Spark({ 
  values, 
  className = '',
  seed,
  variation = 0,
  label,
  'aria-label': ariaLabel
}: SparkProps) {
  const { ascii } = useAscii();
  const [sparkModule, setSparkModule] = useState<any>(null);

  // Dynamically import sparkline module
  useEffect(() => {
    import('../js/sparkline.js').then(module => {
      setSparkModule(module);
    }).catch(error => {
      console.warn('Failed to load sparkline module:', error);
    });
  }, []);

  // Generate sparklines for both modes
  const { unicodeSpark, asciiSpark } = useMemo(() => {
    if (!sparkModule || !values.length) {
      return { unicodeSpark: '', asciiSpark: '' };
    }

    const options = { seed, variation };
    
    return {
      unicodeSpark: sparkModule.spark(values, { ...options, ascii: false }),
      asciiSpark: sparkModule.spark(values, { ...options, ascii: true })
    };
  }, [values, seed, variation, sparkModule]);

  // Current sparkline based on mode
  const currentSparkline = ascii ? asciiSpark : unicodeSpark;

  // Generate accessible description
  const accessibleDescription = useMemo(() => {
    if (!values.length) return '';
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return `Sparkline showing ${values.length} data points. ` +
           `Range: ${min.toFixed(1)} to ${max.toFixed(1)}. ` +
           `Average: ${avg.toFixed(1)}.`;
  }, [values]);

  const sparkClasses = [
    'spark',
    ascii ? 'spark-ascii' : 'spark-unicode',
    className
  ].filter(Boolean).join(' ');

  if (!currentSparkline) {
    return null;
  }

  return (
    <>
      <span 
        className={sparkClasses}
        data-ascii={asciiSpark}
        data-unicode={unicodeSpark}
        data-values={values.join(',')}
        aria-label={ariaLabel || accessibleDescription}
        role="img"
      >
        {currentSparkline}
      </span>
      {label && (
        <span className="spark-label sr-only">
          {label}
        </span>
      )}
    </>
  );
}

// Trend indicator component
interface TrendProps {
  values: number[];
  className?: string;
  showDirection?: boolean;
  showPercentage?: boolean;
}

export function Trend({ 
  values, 
  className = '',
  showDirection = true,
  showPercentage = false
}: TrendProps) {
  const trend = useMemo(() => {
    if (values.length < 2) return { direction: 'flat', percentage: 0 };
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentage = first !== 0 ? (change / first) * 100 : 0;
    
    let direction: 'up' | 'down' | 'flat' = 'flat';
    if (change > 0) direction = 'up';
    else if (change < 0) direction = 'down';
    
    return { direction, percentage };
  }, [values]);

  const { ascii } = useAscii();
  
  const directionChars = {
    up: ascii ? '^' : '↗',
    down: ascii ? 'v' : '↘', 
    flat: ascii ? '-' : '→'
  };

  const trendClasses = [
    'trend',
    `trend-${trend.direction}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={trendClasses}>
      <Spark values={values} className="trend-spark" />
      {showDirection && (
        <span className="trend-direction" aria-hidden="true">
          {directionChars[trend.direction]}
        </span>
      )}
      {showPercentage && (
        <span className="trend-percentage">
          {trend.percentage > 0 ? '+' : ''}
          {trend.percentage.toFixed(1)}%
        </span>
      )}
    </span>
  );
}

// Inline metric with sparkline
interface MetricSparkProps {
  label: string;
  value: number;
  trend: number[];
  unit?: string;
  format?: 'number' | 'currency' | 'percent';
  precision?: number;
}

export function MetricSpark({ 
  label, 
  value, 
  trend, 
  unit = '',
  format = 'number',
  precision = 1
}: MetricSparkProps) {
  const formattedValue = useMemo(() => {
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
        }).format(value) + unit;
    }
  }, [value, format, precision, unit]);

  return (
    <div className="metric-spark">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{formattedValue}</div>
      <div className="metric-trend">
        <Trend values={trend} showDirection showPercentage />
      </div>
    </div>
  );
}