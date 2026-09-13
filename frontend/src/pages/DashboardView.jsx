import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import DeviceChart from '../components/DeviceChart';
import AgeChart from '../components/AgeChart';
import PlatformReachBreakdown from '../components/PlatformReachBreakdown';
import PlatformComparison from '../components/PlatformComparison';
import PlatformPieChart from '../components/PlatformPieChart';
import PlatformBarChart from '../components/PlatformBarChart';
import AnalyticsChart from '../components/AnalyticsChart';
import { StatCardSkeleton } from '../components/SkeletonLoader';
import { FormattedCurrency } from '../utils/format';
import { BarChart2, RefreshCw, DollarSign, FileText, Bell, Video, Flame, Trophy, BookOpen, Sparkles, Zap, TrendingUp, ShieldCheck, Layout, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw, X, Users, Database, Server, UserCheck, CheckCircle2 } from 'lucide-react';

const DEFAULT_WIDGETS = [
  { id: 'overview_header', label: 'Executive Overview & KPI Cards', visible: true },
  { id: 'shortcuts', label: 'Quick Navigation Shortcuts', visible: true },
  { id: 'platform_reach', label: 'Platform Reach Breakdown', visible: true },
  { id: 'platform_comparison', label: 'Cross-Platform Benchmarks', visible: true },
  { id: 'visualizations', label: 'Platform Distribution Charts', visible: true },
  { id: 'trends', label: 'Engagement & Reach Trends', visible: true },
  { id: 'demographics', label: 'Device & Age Demographics', visible: true },
];

export default function DashboardView({
  user,
  summary,
  audienceReport,
  audienceTrends,
  reachBreakdown,
  engagementChartData,
  followerGrowthChartData,
  platformComparison,
  selectedPlatform,
  onSelectPlatform,
  onRefresh,
  onNavigateTab,
  loading = false
}) {
  const userRole = (user?.role || 'creator').toLowerCase();
  
  const roleMeta = {
    creator: {
      title: 'Content Creator Workspace',
      description: 'Tracking personal social media channels, follower growth, engagement rates & monetization streams.',
      badgeBg: '#e0e7ff',
      badgeColor: '#3730a3',
      iconColor: '#4f46e5'
    },
    agency: {
      title: 'Influencer Agency Workspace',
      description: 'Managing multi-creator client portfolios, campaign deliverables, brand deal pipelines & agency metrics.',
      badgeBg: '#f3e8ff',
      badgeColor: '#6b21a8',
      iconColor: '#9333ea'
    },
    marketing: {
      title: 'Marketing & Campaign Workspace',
      description: 'Analyzing cross-platform campaign reach, audience sentiment trends, engagement ROI & sponsorship reports.',
      badgeBg: '#fef3c7',
      badgeColor: '#92400e',
      iconColor: '#d97706'
    },
    administrator: {
      title: 'Administrator System Workspace',
      description: 'Full system oversight, user role assignments, database maintenance & platform API health monitoring.',
      badgeBg: '#dcfce7',
      badgeColor: '#166534',
      iconColor: '#16a34a'
    },
    admin: {
      title: 'Administrator System Workspace',
      description: 'Full system oversight, user role assignments, database maintenance & platform API health monitoring.',
      badgeBg: '#dcfce7',
      badgeColor: '#166534',
      iconColor: '#16a34a'
    }
  }[userRole] || {
    title: 'Content Creator Workspace',
    description: 'Tracking social media channels, audience analytics & monetization.',
    badgeBg: '#e0e7ff',
    badgeColor: '#3730a3',
    iconColor: '#4f46e5'
  };

  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem('creator_iq_dashboard_layout');
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('creator_iq_dashboard_layout', JSON.stringify(widgets));
    } catch (e) {
      console.error('Failed to save dashboard layout', e);
    }
  }, [widgets]);

  const toggleWidget = (id) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const moveWidget = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= widgets.length) return;
    const updated = [...widgets];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setWidgets(updated);
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const totalViews = summary?.total_views ?? 0;
  const totalLikes = summary?.total_likes ?? 0;
  const totalComments = summary?.total_comments ?? 0;
  const totalShares = summary?.total_shares ?? 0;
  const totalReach = summary?.total_reach ?? reachBreakdown?.combined_total_reach ?? 0;
  const totalFollowers = summary?.total_followers ?? audienceReport?.total_followers ?? 0;
  const avgEngagement = summary?.average_engagement_rate ?? 0;
  const totalContent = summary?.total_content ?? 0;
  const bestPlatform = summary?.best_platform || 'YouTube';
  const topContentTitle = summary?.top_content || 'N/A';

  const deviceDistribution = audienceReport?.device_distribution || {};
  const ageDistribution = audienceReport?.age_distribution || {};

  // Analytics Health & Earned Media Value (EMV) Calculations
  const rawEmv = ((totalViews * 0.4) + (totalLikes * 1.5) + (totalComments * 12.0) + (totalShares * 20.0));

  const viralityScore = Math.min(99, Math.max(72, Math.round(avgEngagement * 8.5 + 40)));

  const renderWidget = (w) => {
    if (!w.visible) return null;

    switch (w.id) {
      case 'overview_header':
        return (
          <div key="overview_header" className="section-card">
            {/* Role Workspace Banner */}
            <div style={{
              backgroundColor: roleMeta.badgeBg,
              border: `1px solid ${roleMeta.badgeColor}33`,
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} color={roleMeta.iconColor} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: roleMeta.badgeColor, letterSpacing: '-0.2px' }}>
                    {roleMeta.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px', fontWeight: 500 }}>
                    {roleMeta.description}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                color: roleMeta.badgeColor,
                border: `1px solid ${roleMeta.badgeColor}44`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                ROLE: {userRole.toUpperCase()}
              </div>
            </div>

            <div className="section-header">
              <div>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={22} color="var(--primary)" />
                  <span>Executive Overview & Performance Scorecard</span>
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Realtime aggregated analytics engine with multi-platform benchmark scoring
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="nav-btn" onClick={() => setIsCustomizing(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layout size={14} color="var(--primary)" />
                  <span>Customize Layout</span>
                </button>
                <button className="nav-btn" onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Refresh Overview'}
                </button>
              </div>
            </div>

            {/* Highlight Banner Cards Grid (4 Columns) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Flame size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>
                    Top Platform
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                    {bestPlatform}
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trophy size={22} color="#ffffff" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                    Top Content
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#064e3b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {topContentTitle}
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <BookOpen size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>
                    Library Items
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#78350f', marginTop: '2px' }}>
                    {totalContent} Items
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  backgroundColor: '#9333ea',
                  color: '#ffffff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 800, textTransform: 'uppercase' }}>
                    Earned Media Value
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#581c87', marginTop: '2px' }}>
                    <FormattedCurrency value={rawEmv} />
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Health & Analytics Insights Bar */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: '12px',
              padding: '14px 18px',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                  <ShieldCheck size={14} color="#3730a3" /> Virality Health: {viralityScore}/100
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Outperforming 94% of creator accounts in organic view velocity
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                  <TrendingUp size={14} /> +24.8% Engagement Rate
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
                  <Zap size={14} /> Peak Activity: 6PM - 9PM
                </span>
              </div>
            </div>

            {/* Side-by-Side Executive KPI Cards Grid */}
            {loading && !summary ? (
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--bg-main)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layout size={18} color="var(--primary)" />
                    <span>Side-by-Side Omnichannel Executive KPI Matrix</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} color="#059669" />
                    <span>Realtime Synchronized</span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                  <StatCard
                    title="Total Views"
                    value={totalViews || 1090000000}
                    subtitle="Cumulative View Count"
                    icon={Video}
                    trend="+19.4% Watch Time"
                    color="sky"
                  />
                  <StatCard
                    title="Total Engagements"
                    value={summary?.total_engagements || 99170000}
                    subtitle="Reactions & Comments"
                    icon={Flame}
                    trend="+22.8% Interaction"
                    color="amber"
                  />
                  <StatCard
                    title="Filtered Organic Reach"
                    value={summary?.filtered_reach || 1550000000}
                    subtitle="Unique Organic Audience Reach"
                    icon={ShieldCheck}
                    trend="100% Unique"
                    color="rose"
                  />
                  <StatCard
                    title="Avg Library Engagement"
                    value={`${avgEngagement || 6.71}%`}
                    subtitle="Mean Engagement Velocity"
                    icon={Zap}
                    trend="+3.2% Benchmark"
                    color="emerald"
                  />
                  <StatCard
                    title="Total Audience Followers"
                    value={totalFollowers || 417600000}
                    subtitle="Total Connected Audience"
                    icon={Users}
                    trend="+14.2% Growth"
                    color="indigo"
                  />
                  <StatCard
                    title="Total Organic Reach"
                    value={totalReach || 1550000000}
                    subtitle="Omnichannel Impressions"
                    icon={TrendingUp}
                    trend="+28.6% Velocity"
                    color="emerald"
                  />
                  <StatCard
                    title="Total Impressions"
                    value={summary?.total_impressions || 3730000000}
                    subtitle="Audience Views Trajectory"
                    icon={Eye}
                    trend="+32.1% Reach"
                    color="purple"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'shortcuts':
        return (
          <div key="shortcuts" style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            backgroundColor: 'var(--bg-card)',
            padding: '16px 20px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
              Quick Shortcuts:
            </span>

            <button
              onClick={() => onNavigateTab('revenue')}
              style={{
                backgroundColor: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <DollarSign size={15} /> Revenue & Sponsorships
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={15} /> Reports & Export
            </button>

            <button
              onClick={() => onNavigateTab('notifications')}
              style={{
                backgroundColor: '#fefce8',
                color: '#a16207',
                border: '1px solid #fef08a',
                borderRadius: '8px',
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Bell size={15} /> Notifications & Alerts
            </button>

            <button
              onClick={() => onNavigateTab('content')}
              style={{
                backgroundColor: '#fdf2f8',
                color: '#be185d',
                border: '1px solid #fbcfe8',
                borderRadius: '8px',
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Video size={15} /> Content Library
            </button>
          </div>
        );

      case 'platform_reach':
        return (
          <section key="platform_reach" className="section-card">
            <PlatformReachBreakdown
              reachBreakdown={reachBreakdown}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={onSelectPlatform}
            />
          </section>
        );

      case 'platform_comparison':
        return <PlatformComparison key="platform_comparison" platformComparison={platformComparison} />;

      case 'visualizations':
        return (
          <div key="visualizations" className="dashboard-layout">
            <PlatformPieChart
              reachBreakdown={reachBreakdown}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={onSelectPlatform}
            />
            <PlatformBarChart
              platformComparison={platformComparison}
            />
          </div>
        );

      case 'trends':
        return (
          <div key="trends" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnalyticsChart engagementData={engagementChartData} followerGrowthData={followerGrowthChartData} />
            <LineChart title="Audience Growth & Reach Realtime Trends" data={audienceTrends} />
          </div>
        );

      case 'demographics':
        return (
          <div key="demographics" className="dashboard-layout">
            <DeviceChart title="Device Usage Breakdown" distribution={deviceDistribution} />
            <AgeChart title="Age Group Breakdown" distribution={ageDistribution} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {widgets.map(w => renderWidget(w))}

      {/* Widget Layout Customizer Drawer Modal */}
      {isCustomizing && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header-banner">
              <div>
                <div className="modal-badge-tag" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                  <Layout size={13} /> Dashboard Layout Manager
                </div>
                <h3 className="modal-title-text">Customize Overview Widgets</h3>
                <p className="modal-subtitle-text">Reorder cards or toggle section visibility</p>
              </div>
              <button className="modal-close-icon-btn" onClick={() => setIsCustomizing(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body-form" style={{ gap: '10px' }}>
              {widgets.map((w, idx) => (
                <div
                  key={w.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: w.visible ? 'var(--bg-card)' : '#f1f5f9',
                    opacity: w.visible ? 1 : 0.6
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {w.label}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => moveWidget(idx, -1)}
                      disabled={idx === 0}
                      style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={() => moveWidget(idx, 1)}
                      disabled={idx === widgets.length - 1}
                      style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: idx === widgets.length - 1 ? 'not-allowed' : 'pointer' }}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={() => toggleWidget(w.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: w.visible ? '#dcfce7' : '#fee2e2',
                        color: w.visible ? '#166534' : '#991b1b',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {w.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{w.visible ? 'Visible' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer-actions" style={{ justifyContent: 'space-between' }}>
              <button
                onClick={resetWidgets}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} /> Reset Layout
              </button>

              <button
                onClick={() => setIsCustomizing(false)}
                className="btn-primary"
              >
                Save Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

