import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, TrendingUp, ShieldCheck, RefreshCw, Award } from 'lucide-react';
import StatCard from '../components/StatCard';
import { FormattedCurrency } from '../utils/format';
import { api } from '../api';

export default function AgencyHubView({ onNavigateTab }) {
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const data = await api.getAgencyRoster();
      setRosterData(data);
    } catch (e) {
      console.error('Error fetching agency roster:', e);
    } finally {
      setLoading(false);
    }
  };

  const roster = rosterData?.roster || [
    { name: 'T-Series Official', handle: '@tseries', platform: 'YouTube', category: 'Music & Cinema', contract_type: 'Exclusive Agency Partner', reach: 245000000, views: 158000000, estimated_revenue: 1250000, commission_pct: 12.0, commission_earned: 150000, status: 'Active & Syncing' },
    { name: 'Think Music South', handle: '@thinkmusicsouth', platform: 'YouTube', category: 'Regional Music & OST', contract_type: 'Digital Distribution & PR', reach: 89000000, views: 42000000, estimated_revenue: 480000, commission_pct: 15.0, commission_earned: 72000, status: 'Active & Syncing' },
    { name: 'Pawan Kalyan', handle: '@PawanKalyan', platform: 'X', category: 'Public & Politics', contract_type: 'Campaign Analytics Client', reach: 64000000, views: 28000000, estimated_revenue: 350000, commission_pct: 10.0, commission_earned: 35000, status: 'Active & Syncing' },
    { name: 'Narendra Modi', handle: '@narendramodi', platform: 'X', category: 'Public Leadership', contract_type: 'Institutional Monitoring', reach: 185000000, views: 95000000, estimated_revenue: 850000, commission_pct: 10.0, commission_earned: 85000, status: 'Active & Syncing' }
  ];

  const totalReach = rosterData?.total_client_reach || roster.reduce((acc, item) => acc + item.reach, 0);
  const totalRev = rosterData?.total_client_revenue || roster.reduce((acc, item) => acc + item.estimated_revenue, 0);
  const totalCommission = rosterData?.total_agency_commission || roster.reduce((acc, item) => acc + item.commission_earned, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="section-card" style={{ background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', color: '#ffffff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={28} color="#c084fc" />
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Influencer Agency Portfolio & Roster Hub
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#e9d5ff', marginTop: '6px', fontWeight: 500 }}>
              Multi-creator client management, brand deal commission tracking, and network performance scoring.
            </p>
          </div>

          <button
            onClick={fetchRoster}
            className="btn-primary"
            style={{ backgroundColor: '#9333ea', borderColor: '#a855f7' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sync Agency Directory</span>
          </button>
        </div>
      </div>

      {/* Agency KPI Overview Cards */}
      <div className="grid-stats">
        <StatCard
          title="Creators Managed"
          value={roster.length}
          subtitle="Active Roster Accounts"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Network Reach"
          value={totalReach >= 1000000 ? `${(totalReach / 1000000).toFixed(1)}M` : totalReach.toLocaleString()}
          subtitle="Combined Organic Impressions"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Total Client Revenue"
          value={<FormattedCurrency value={totalRev} />}
          subtitle="Gross Client Earnings"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Agency Commission Earned"
          value={<FormattedCurrency value={totalCommission} />}
          subtitle="Net Agency Cut (10-15% Split)"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Managed Creators Roster Table */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#7c3aed" />
              <span>Managed Creator Roster & Revenue Splits</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Individual client performance overview, platform handles, and contract commission rates.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Creator Name</th>
                <th>Handle & Platform</th>
                <th>Category</th>
                <th>Total Reach</th>
                <th>Views</th>
                <th>Gross Revenue</th>
                <th>Agency Commission Rate</th>
                <th>Agency Earned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#4f46e5' }}>{item.handle}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.platform}</div>
                  </td>
                  <td style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{item.category}</td>
                  <td style={{ fontWeight: 700 }}>{(item.reach || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>{(item.views || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 800, color: '#059669' }}>
                    <FormattedCurrency value={item.estimated_revenue} />
                  </td>
                  <td style={{ fontWeight: 700, color: '#7c3aed' }}>{item.commission_pct}% Split</td>
                  <td style={{ fontWeight: 800, color: '#d97706' }}>
                    <FormattedCurrency value={item.commission_earned} />
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0'
                    }}>
                      <CheckCircle2 size={13} color="#166534" />
                      <span>{item.status || 'Active'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
