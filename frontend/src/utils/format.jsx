import React from 'react';

/**
 * Formats large numbers into K, M, B abbreviations for values with 5-6+ digits.
 * Shows exact uncompressed figure on hover via title and CSS tooltip.
 */
export function formatNumber(num, minThreshold = 1000) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const val = Number(num);
  const abs = Math.abs(val);

  if (abs >= 1_000_000_000_000) {
    const formatted = (val / 1_000_000_000_000).toFixed(abs >= 10_000_000_000_000 ? 1 : 2);
    return formatted.replace(/\.0+$/, '') + 'T';
  }
  if (abs >= 1_000_000_000) {
    const formatted = (val / 1_000_000_000).toFixed(abs >= 10_000_000_000 ? 1 : 2);
    return formatted.replace(/\.0+$/, '') + 'B';
  }
  if (abs >= 1_000_000) {
    const formatted = (val / 1_000_000).toFixed(abs >= 100_000_000 ? 1 : 2);
    return formatted.replace(/\.0+$/, '') + 'M';
  }
  if (abs >= minThreshold) {
    const formatted = (val / 1_000).toFixed(abs >= 100_000 ? 0 : 1);
    return formatted.replace(/\.0+$/, '') + 'K';
  }
  return val.toLocaleString('en-IN');
}

export function rawNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-IN');
}

export function formatIndianCurrency(num) {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  const val = Number(num);
  const abs = Math.abs(val);

  if (abs >= 10_000_000) { // 1 Crore
    const formatted = (val / 10_000_000).toFixed(abs >= 100_000_000 ? 1 : 2);
    return '₹' + formatted.replace(/\.0+$/, '') + ' Cr';
  }
  if (abs >= 100_000) { // 1 Lakh
    const formatted = (val / 100_000).toFixed(abs >= 1_000_000 ? 1 : 2);
    return '₹' + formatted.replace(/\.0+$/, '') + ' Lakh';
  }
  if (abs >= 1_000) { // 1 Thousand
    const formatted = (val / 1_000).toFixed(abs >= 10_000 ? 0 : 1);
    return '₹' + formatted.replace(/\.0+$/, '') + 'K';
  }
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export function rawIndianCurrency(num) {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  return '₹' + Math.round(Number(num)).toLocaleString('en-IN');
}

/**
 * Reusable Formatted Number React Component with Hover Tooltip.
 */
export function FormattedNumber({ value, prefix = '', suffix = '', isCurrency = false, style = {}, className = '' }) {
  if (value === null || value === undefined || isNaN(value)) {
    return <span style={style} className={className}>{isCurrency ? '₹0' : '0'}</span>;
  }
  
  if (isCurrency) {
    const formatted = formatIndianCurrency(value);
    const exact = rawIndianCurrency(value);
    return (
      <span
        className={`has-tooltip ${className}`}
        style={{ position: 'relative', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', ...style }}
        title={`Exact Value: ${exact}`}
      >
        {formatted}
        <span className="number-tooltip">Exact Value: {exact}</span>
      </span>
    );
  }

  const formatted = formatNumber(value);
  const exact = rawNumber(value);

  return (
    <span
      className={`has-tooltip ${className}`}
      style={{ position: 'relative', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', ...style }}
      title={`Exact Value: ${prefix}${exact}${suffix}`}
    >
      {prefix}{formatted}{suffix}
      <span className="number-tooltip">Exact Value: {prefix}{exact}{suffix}</span>
    </span>
  );
}

export function FormattedCurrency({ value, style = {}, className = '' }) {
  return <FormattedNumber value={value} isCurrency={true} style={style} className={className} />;
}

