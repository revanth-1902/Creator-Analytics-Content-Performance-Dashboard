import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, TrendingUp, ShieldCheck, RefreshCw, Award, CheckCircle2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { FormattedCurrency, FormattedNumber } from '../utils/format';
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
    { name: 'T-Series Official', handle: '@tseries', platform: 'YouTube', category: 'Music & Cinema', contract_type: 'Exclusive Agency Partner', reach: 6523554726034, views: 3544912710313, estimated_revenue: 638100000, commission_pct: 12.0, commission_earned: 76600000, status: 'Active & Syncing' },
    { name: 'Think Music South', handle: '@thinkmusicsouth', platform: 'YouTube', category: 'Regional Music & OST', contract_type: 'Digital Distribution & PR', reach: 6523554726034, views: 3544912710313, estimated_revenue: 638100000, commission_pct: 15.0, commission_earned: 95700000, status: 'Active & Syncing' },
    { name: 'Pawan Kalyan', handle: '@PawanKalyan', platform: 'X', category: 'Public & Politics', contract_type: 'Campaign Analytics Client', reach: 281143358719, views: 152004400637, estimated_revenue: 27400000, commission_pct: 10.0, commission_earned: 2740000, status: 'Active & Syncing' },
    { name: 'Narendra Modi', handle: '@narendramodi', platform: 'X', category: 'Public Leadership', contract_type: 'Institutional Monitoring', reach: 494039515553, views: 266931565994, estimated_revenue: 48100000, commission_pct: 10.0, commission_earned: 4810000, status: 'Active & Syncing' },
    { name: 'Revanth Agency Hub', handle: 'test123@gmail.com', platform: 'Multi-Platform', category: 'Verified Influencer', contract_type: 'Direct Roster', reach: 24500000, views: 15800000, estimated_revenue: 53000, commission_pct: 15.0, commission_earned: 8000, status: 'Active & Syncing' }
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
              Omnichannel agency metrics, client commissions, and multi-creator revenue splits.
            </p>
          </div>

          <button onClick={fetchRoster} className="btn-primary" style={{ backgroundColor: '#7c3aed', borderColor: '#a78bfa' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sync Roster Data</span>
          </button>
        </div>
      </div>

      {/* Agency KPI Overview Cards */}
      <div className="grid-stats">
        <StatCard
          title="Total Managed Client Reach"
          value={<FormattedNumber value={totalReach} />}
          subtitle="Aggregate Audience Reach"
          icon={Users}
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
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{item.platform}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>
                    <FormattedNumber value={item.reach} />
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>
                    <FormattedNumber value={item.views} />
                  </td>
                  <td style={{ fontWeight: 800, color: '#059669' }}>
                    <FormattedCurrency value={item.estimated_revenue} />
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '3px 8px', borderRadius: '12px', border: '1px solid #d8b4fe' }}>
                      {item.commission_pct}% Split
                    </span>
                  </td>
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
                      <span>{item.status || 'Active & Syncing'}</span>
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
