import React, { useState } from 'react';
import { Target, Megaphone, TrendingUp, HeartHandshake, Flame, Sparkles, CheckCircle2, BarChart2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import SentimentCard from '../components/SentimentCard';
import { FormattedCurrency } from '../utils/format';

export default function MarketingHubView({ summary }) {
  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'Diwali Brand Blitz 2026', client: 'Festive Sponsorships', target_reach: 50000000, current_reach: 48200000, budget: 350000, emv: 1420000, sentiment: '88.5% Positive', status: 'On Track (96.4%)' },
    { id: 2, title: 'OG Movie Single Launch', client: 'Think Music & Cinema', target_reach: 25000000, current_reach: 28400000, budget: 200000, emv: 980000, sentiment: '91.2% Positive', status: 'Goal Exceeded (113.6%)' },
    { id: 3, title: 'Autumn Tech Product Campaign', client: 'Sponsor Network', target_reach: 15000000, current_reach: 12100000, budget: 150000, emv: 540000, sentiment: '79.0% Positive', status: 'In Progress (80.6%)' },
    { id: 4, title: 'Public Leadership & Outreach', client: 'Institutional PR', target_reach: 40000000, current_reach: 39500000, budget: 280000, emv: 1150000, sentiment: '84.0% Positive', status: 'Near Goal (98.7%)' }
  ]);

  const totalTarget = campaigns.reduce((acc, c) => acc + c.target_reach, 0);
  const totalAchieved = campaigns.reduce((acc, c) => acc + c.current_reach, 0);
  const totalEmv = campaigns.reduce((acc, c) => acc + c.emv, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="section-card" style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', color: '#ffffff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={28} color="#fde047" />
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Marketing Team Campaign Strategy & ROI Hub
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#fef3c7', marginTop: '6px', fontWeight: 500 }}>
              Tracking brand campaign reach targets, earned media value (EMV), sentiment velocity, and engagement ROI benchmarks.
            </p>
          </div>
        </div>
      </div>

      {/* Marketing KPI Overview Cards */}
      <div className="grid-stats">
        <StatCard
          title="Active Campaigns"
          value={campaigns.length}
          subtitle="Monitored Brand Deals"
          icon={Megaphone}
          color="amber"
        />
        <StatCard
          title="Campaign Reach Target"
          value={`${(totalAchieved / 1000000).toFixed(1)}M / ${(totalTarget / 1000000).toFixed(1)}M`}
          subtitle={`${((totalAchieved / totalTarget) * 100).toFixed(1)}% Total Target Achieved`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Earned Media Value (EMV)"
          value={<FormattedCurrency value={totalEmv} />}
          subtitle="Estimated Campaign Media Return"
          icon={BarChart2}
          color="indigo"
        />
        <StatCard
          title="Avg Audience Sentiment"
          value="85.7% Positive"
          subtitle="Derived from Live Comments & Reactions"
          icon={HeartHandshake}
          color="purple"
        />
      </div>

      {/* Campaign Progress & ROI Tracker */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#d97706" />
              <span>Brand Campaign Performance & Target Milestones</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Realtime tracking of campaign reach goals, budget spending, and earned media return.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Sponsor / Client</th>
                <th>Target Reach</th>
                <th>Impressions Achieved</th>
                <th>Goal Progress</th>
                <th>Budget Spent</th>
                <th>Earned Media Value (EMV)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const pct = Math.min(100, Math.round((c.current_reach / c.target_reach) * 100));
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{c.title}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{c.client}</td>
                    <td style={{ fontWeight: 700 }}>{c.target_reach.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{c.current_reach.toLocaleString()}</td>
                    <td style={{ minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 100 ? '#10b981' : '#f59e0b', borderRadius: '9999px' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      <FormattedCurrency value={c.budget} />
                    </td>
                    <td style={{ fontWeight: 800, color: '#059669' }}>
                      <FormattedCurrency value={c.emv} />
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: pct >= 100 ? '#ecfdf5' : '#fffbeb',
                        color: pct >= 100 ? '#047857' : '#b45309',
                        border: `1px solid ${pct >= 100 ? '#a7f3d0' : '#fde68a'}`
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
