import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, rawNumber } from '../utils/format';

export default function StatCard({ label, title, value, subtitle, icon: Icon, trend, isUp = true, color = 'indigo' }) {
  const cardLabel = label || title || 'Metric';
  const isNumeric = typeof value === 'number' || (!isNaN(value) && value !== null && value !== '' && typeof value !== 'object');
  const displayVal = isNumeric ? formatNumber(value) : value;
  const fullVal = isNumeric ? rawNumber(value) : (typeof value === 'object' ? '' : value);

  const colorStyles = {
    indigo: { accent: '#4f46e5', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', lightBg: '#e0e7ff', textColor: '#3730a3' },
    purple: { accent: '#9333ea', bg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', lightBg: '#f3e8ff', textColor: '#6b21a8' },
    emerald: { accent: '#10b981', bg: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', lightBg: '#dcfce7', textColor: '#166534' },
    amber: { accent: '#f59e0b', bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', lightBg: '#fef3c7', textColor: '#92400e' },
    rose: { accent: '#f43f5e', bg: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)', lightBg: '#fff1f2', textColor: '#9f1239' },
    sky: { accent: '#0284c7', bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', lightBg: '#e0f2fe', textColor: '#075985' }
  }[color] || { accent: '#4f46e5', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', lightBg: '#e0e7ff', textColor: '#3730a3' };

  return (
    <div className="stat-card" style={{
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      borderLeft: `4px solid ${colorStyles.accent}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div className="stat-label" style={{ fontWeight: 700, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {cardLabel}
          </div>
          <div
            className="stat-value"
            onClick={() => fullVal && alert(`Exact Figure for ${cardLabel}: ${fullVal}`)}
            title={fullVal ? `Exact figure: ${fullVal}` : ''}
            style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.5px' }}
          >
            {displayVal}
          </div>
        </div>

        {Icon && (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: colorStyles.bg,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${colorStyles.accent}44`,
            flexShrink: 0
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
        {subtitle ? (
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {subtitle}
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
            Realtime Tracked
          </span>
        )}

        {trend && (
          <span className={`stat-trend ${isUp ? 'up' : 'down'}`} style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            backgroundColor: isUp ? '#ecfdf5' : '#fff1f2',
            color: isUp ? '#047857' : '#be123c'
          }}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend}</span>
          </span>
        )}
      </div>
    </div>
  );
}

