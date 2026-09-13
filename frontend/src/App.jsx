/**
 * Main Application Component for CreatorIQ.
 * Manages global app state, routing views, theme management, modal dialogs, and real-time backend synchronization.
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';
import { PageLoader, SyncingBanner } from './components/Loader';

import DashboardView from './pages/DashboardView';
import ContentView from './pages/ContentView';
import AudienceView from './pages/AudienceView';
import GrowthView from './pages/GrowthView';
import RevenueView from './pages/RevenueView';
import NotificationsView from './pages/NotificationsView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import AuthView from './pages/AuthView';

import AgencyHubView from './pages/AgencyHubView';
import MarketingHubView from './pages/MarketingHubView';
import AdminConsoleView from './pages/AdminConsoleView';

import AudienceModal from './components/AudienceModal';
import ContentModal from './components/ContentModal';
import YouTubeSyncModal from './components/YouTubeSyncModal';
import InstagramSyncModal from './components/InstagramSyncModal';
import SocialConnectModal from './components/SocialConnectModal';
import PlatformSyncModal from './components/PlatformSyncModal';
import RevenueModal from './components/RevenueModal';
import SponsorshipModal from './components/SponsorshipModal';

import { Zap, ShieldAlert, Building2, Target } from 'lucide-react';
import { api, getStoredToken, getStoredUser, clearAuthSession } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Backend States (Realtime Data Only)
  const [summary, setSummary] = useState(null);
  const [audienceReport, setAudienceReport] = useState(null);
  const [audienceRecords, setAudienceRecords] = useState([]);
  const [contents, setContents] = useState([]);
  const [growthTrends, setGrowthTrends] = useState([]);
  const [audienceTrends, setAudienceTrends] = useState([]);
  const [reachBreakdown, setReachBreakdown] = useState(null);

  // Sprint 4 Chart & Social Media States
  const [engagementChartData, setEngagementChartData] = useState(null);
  const [followerGrowthChartData, setFollowerGrowthChartData] = useState(null);
  const [platformComparison, setPlatformComparison] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  // Sprint 6 Revenue & Sponsorship States
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [revenueRecords, setRevenueRecords] = useState([]);
  const [sponsorshipRecords, setSponsorshipRecords] = useState([]);

  // Platform Filter State
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  // Theme & Appearance Customizer States
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('creatoriq_theme') || 'light'; } catch { return 'light'; }
  });
  const [accentColor, setAccentColor] = useState(() => {
    try { return localStorage.getItem('creatoriq_accent') || 'indigo'; } catch { return 'indigo'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('creatoriq_theme', theme);
      localStorage.setItem('creatoriq_accent', accentColor);
    } catch (e) {}
    document.documentElement.className = `${theme === 'dark' ? 'dark-theme' : ''} accent-${accentColor}`;
  }, [theme, accentColor]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSelectAccent = (colorKey) => {
    setAccentColor(colorKey);
  };

  const [loading, setLoading] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Syncing real-time social metrics...');
  const [error, setError] = useState(null);

  // Modals
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const [activeSyncPlatform, setActiveSyncPlatform] = useState('YouTube');
  const [isPlatformSyncModalOpen, setIsPlatformSyncModalOpen] = useState(false);

  // Sprint 6 Modals
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(null);

  const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);
  const [editingSponsorship, setEditingSponsorship] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenPlatformModal = (platformName) => {
    setIsYouTubeModalOpen(false);
    setIsInstagramModalOpen(false);
    setIsSocialModalOpen(false);
    setActiveSyncPlatform(platformName);
    setIsPlatformSyncModalOpen(true);
  };

  const handleOpenYouTubeModal = () => {
    setIsPlatformSyncModalOpen(false);
    setIsInstagramModalOpen(false);
    setIsSocialModalOpen(false);
    setIsYouTubeModalOpen(true);
  };

  const handleOpenInstagramModal = () => {
    setIsPlatformSyncModalOpen(false);
    setIsYouTubeModalOpen(false);
    setIsSocialModalOpen(false);
    setIsInstagramModalOpen(true);
  };

  const handleOpenSocialModal = () => {
    setIsPlatformSyncModalOpen(false);
    setIsYouTubeModalOpen(false);
    setIsInstagramModalOpen(false);
    setIsSocialModalOpen(true);
  };

  // Check login session on mount (30-day token persistence check)
  useEffect(() => {
    const savedToken = getStoredToken();
    const savedUser = getStoredUser();

    if (savedToken && savedUser) {
      setUser(savedUser);
    } else {
      setUser(null);
    }
    setIsInitializing(false);

    const handleUnauthorized = () => {
      setUser(null);
      showToast('Session expired. Please sign in to continue.', 'info');
    };

    window.addEventListener('creatoriq:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('creatoriq:unauthorized', handleUnauthorized);
  }, []);

  // Fetch all realtime backend data
  const fetchAllBackendData = async (platform = selectedPlatform) => {
    if (!getStoredToken()) return;
    setLoading(true);
    setError(null);
    try {
      const [
        sumRes,
        audReportRes,
        audRecsRes,
        contentRes,
        growthRes,
        trendsRes,
        reachRes,
        engChartRes,
        folChartRes,
        platCompRes,
        connPlatRes,
        revSumRes,
        revListRes,
        spListRes
      ] = await Promise.all([
        api.getDashboardSummary(platform).catch(() => null),
        api.getAudienceReport().catch(() => null),
        api.getAudience().catch(() => []),
        api.getContent(platform).catch(() => []),
        api.getGrowthReport(platform).catch(() => []),
        api.getAudienceTrends(platform).catch(() => []),
        api.getReachBreakdown().catch(() => null),
        api.getEngagementChart(platform).catch(() => null),
        api.getFollowerGrowthChart(platform).catch(() => null),
        api.getPlatformComparison().catch(() => null),
        api.getConnectedSocialPlatforms().catch(() => null),
        api.getRevenueSummary().catch(() => null),
        api.getRevenue().catch(() => []),
        api.getSponsorships().catch(() => [])
      ]);

      setSummary(sumRes);
      setAudienceReport(audReportRes);
      setAudienceRecords(Array.isArray(audRecsRes) ? audRecsRes : []);
      setContents(Array.isArray(contentRes) ? contentRes : []);
      setGrowthTrends(Array.isArray(growthRes) ? growthRes : []);
      setAudienceTrends(Array.isArray(trendsRes) ? trendsRes : []);
      setReachBreakdown(reachRes);
      setEngagementChartData(engChartRes);
      setFollowerGrowthChartData(folChartRes);
      setPlatformComparison(platCompRes);

      setRevenueSummary(revSumRes);
      setRevenueRecords(Array.isArray(revListRes) ? revListRes : []);
      setSponsorshipRecords(Array.isArray(spListRes) ? spListRes : []);

      if (connPlatRes && connPlatRes.platforms) {
        setConnectedPlatforms(connPlatRes.platforms);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to CreatorIQ backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllBackendData(selectedPlatform);
    }
  }, [user, selectedPlatform]);

  const handleLoginSuccess = (userData) => {
    const userObj = typeof userData === 'object' ? userData : { email: userData };
    setUser(userObj);
    showToast(`Welcome back, ${userObj.name || userObj.email.split('@')[0]}!`, 'success');
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setSummary(null);
    showToast('Signed out successfully', 'info');
  };

  const handleSyncYouTube = async (channelId) => {
    setIsSyncing(true);
    setSyncMessage('Syncing live YouTube channel metrics & videos...');
    try {
      const res = await api.syncYouTube(channelId);
      await fetchAllBackendData();
      showToast('YouTube channel metrics synced successfully!', 'success');
      return res;
    } catch (err) {
      showToast(`YouTube Sync Error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncInstagram = async (handle) => {
    setIsSyncing(true);
    setSyncMessage('Syncing live Instagram media & reels...');
    try {
      const res = await api.syncInstagram(handle);
      await fetchAllBackendData();
      showToast('Instagram media & reels synced successfully!', 'success');
      return res;
    } catch (err) {
      showToast(`Instagram Sync Error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoSyncAll = async () => {
    setIsAutoSyncing(true);
    setIsSyncing(true);
    setSyncMessage('Auto-syncing real-time social metrics from all saved channels & handles...');
    try {
      const res = await api.autoSyncAccounts();
      await fetchAllBackendData();
      showToast(res?.message || 'All saved channels & handles auto-synced successfully!', 'success');
    } catch (err) {
      showToast(`Auto-Sync Error: ${err.message}`, 'error');
    } finally {
      setIsAutoSyncing(false);
      setIsSyncing(false);
    }
  };

  const handleConnectSocial = async (platform, accountName) => {
    setIsSyncing(true);
    setSyncMessage(`Connecting and syncing live data for ${platform}...`);
    try {
      const res = await api.saveSocialAccount(platform, accountName, accountName);
      await fetchAllBackendData();
      showToast(`${platform} account '${accountName}' connected & synced!`, 'success');
      return res;
    } catch (err) {
      showToast(`Connection Error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSocial = async (platform, accountId) => {
    setIsSyncing(true);
    setSyncMessage(`Refreshing real-time ${platform} metrics${accountId ? ` for ${accountId}` : ''}...`);
    try {
      const res = await api.syncPlatform(platform, accountId);
      await fetchAllBackendData();
      showToast(res?.message || `${platform} data refreshed!`, 'success');
      return res;
    } catch (err) {
      showToast(`Sync Error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Audience Handlers
  const handleSaveAudience = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingAudience?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateAudience(recordId, payload);
        showToast('Audience demographic record updated!', 'success');
      } else {
        await api.createAudience(data);
        showToast('New audience demographic record created!', 'success');
      }
      setEditingAudience(null);
      setIsAudienceModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteAudience = async (id) => {
    if (!window.confirm('Delete this audience record?')) return;
    try {
      await api.deleteAudience(id);
      await fetchAllBackendData();
      showToast('Audience record deleted', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Content Handlers
  const handleSaveContent = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingContent?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateContent(recordId, payload);
        showToast('Content item updated successfully!', 'success');
      } else {
        await api.createContent(data);
        showToast('New content item published to library!', 'success');
      }
      setEditingContent(null);
      setIsContentModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Delete this content record?')) return;
    try {
      await api.deleteContent(id);
      await fetchAllBackendData();
      showToast('Content record removed', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Sprint 6 Revenue Handlers
  const handleSaveRevenue = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingRevenue?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateRevenue(recordId, payload);
        showToast('Revenue record updated!', 'success');
      } else {
        await api.createRevenue(data);
        showToast('New revenue stream entry saved!', 'success');
      }
      setEditingRevenue(null);
      setIsRevenueModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteRevenue = async (id) => {
    if (!window.confirm('Delete this revenue record?')) return;
    try {
      await api.deleteRevenue(id);
      await fetchAllBackendData();
      showToast('Revenue stream entry removed', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Sprint 6 Sponsorship Handlers
  const handleSaveSponsorship = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingSponsorship?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateSponsorship(recordId, payload);
        showToast('Sponsorship deal updated!', 'success');
      } else {
        await api.createSponsorship(data);
        showToast('New sponsorship contract deal logged!', 'success');
      }
      setEditingSponsorship(null);
      setIsSponsorshipModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteSponsorship = async (id) => {
    if (!window.confirm('Delete this sponsorship deal record?')) return;
    try {
      await api.deleteSponsorship(id);
      await fetchAllBackendData();
      showToast('Sponsorship contract removed', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const getHeaderTitles = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Realtime KPIs, performance charts, and top platform metrics' };
      case 'agency_hub':
        return { title: 'Agency Roster & Portfolio Hub', subtitle: 'Managed client creators, agency contract splits, and network performance' };
      case 'marketing_hub':
        return { title: 'Marketing Campaign Strategy Hub', subtitle: 'Campaign reach milestones, sentiment velocity, and earned media value (EMV)' };
      case 'admin_console':
        return { title: 'System Administration Console', subtitle: 'User accounts management, role access controls, database & API health' };
      case 'content':
        return { title: 'Content Performance', subtitle: 'Manage library items, views, likes, shares & engagement rates' };
      case 'audience':
        return { title: 'Audience Analytics', subtitle: 'Demographics, device distribution, and demographic database records' };
      case 'growth':
        return { title: 'Growth & Trends', subtitle: '30-day historical follower growth, virality, and impression logs' };
      case 'revenue':
        return { title: 'Revenue & Sponsorships', subtitle: 'Financial stream breakdown, monthly revenue & brand deal contracts' };
      case 'notifications':
        return { title: 'Notifications & Alerts Hub', subtitle: 'Contextual performance milestones, engagement warnings & revenue alerts' };
      case 'reports':
        return { title: 'Analytics Reports & Export', subtitle: 'Generate structured report summaries and download PDF & Excel exports' };
      case 'settings':
        return { title: 'Profile & Account Settings', subtitle: 'Manage creator account details, social connections & API status' };
      default:
        return { title: 'CreatorIQ Dashboard', subtitle: 'Realtime creator analytics platform' };
    }
  };

  const headerInfo = getHeaderTitles();

  const renderActiveView = () => {
    if (loading && !summary) {
      return <PageLoader message="Loading Creator Analytics Workspace..." />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            user={user}
            summary={summary}
            audienceReport={audienceReport}
            audienceTrends={audienceTrends}
            reachBreakdown={reachBreakdown}
            engagementChartData={engagementChartData}
            followerGrowthChartData={followerGrowthChartData}
            platformComparison={platformComparison}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            onRefresh={fetchAllBackendData}
            onNavigateTab={setActiveTab}
            loading={loading}
          />
        );
      case 'agency_hub':
        if (!['agency', 'administrator', 'admin'].includes((user?.role || 'creator').toLowerCase())) {
          return (
            <div className="section-card" style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#be123c' }}>403 Forbidden: Influencer Agency Role Required</h3>
              <p style={{ fontSize: '13px', color: '#881337', marginTop: '6px', maxWidth: '520px', margin: '6px auto 0 auto' }}>
                Your active account role is <strong>{(user?.role || 'creator').toUpperCase()}</strong>. Access to the Influencer Agency Portfolio & Roster Hub requires an <strong>Agency</strong> or <strong>Administrator</strong> account.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  className="btn-primary"
                  style={{ backgroundColor: '#7c3aed', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    const up = { ...user, role: 'agency' };
                    setUser(up);
                    try { localStorage.setItem('creatoriq_user', JSON.stringify(up)); } catch(e) {}
                    showToast("Switched role to 'AGENCY' context!", 'success');
                  }}
                >
                  <Building2 size={16} /> Switch to Agency Role Context
                </button>
                <button className="btn-secondary" style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActiveTab('dashboard')}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          );
        }
        return <AgencyHubView onNavigateTab={setActiveTab} />;
      case 'marketing_hub':
        if (!['marketing', 'administrator', 'admin'].includes((user?.role || 'creator').toLowerCase())) {
          return (
            <div className="section-card" style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#be123c' }}>403 Forbidden: Marketing Team Role Required</h3>
              <p style={{ fontSize: '13px', color: '#881337', marginTop: '6px', maxWidth: '520px', margin: '6px auto 0 auto' }}>
                Your active account role is <strong>{(user?.role || 'creator').toUpperCase()}</strong>. Access to the Campaign Strategy & Target Hub requires a <strong>Marketing Team</strong> or <strong>Administrator</strong> account.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  className="btn-primary"
                  style={{ backgroundColor: '#d97706', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    const up = { ...user, role: 'marketing' };
                    setUser(up);
                    try { localStorage.setItem('creatoriq_user', JSON.stringify(up)); } catch(e) {}
                    showToast("Switched role to 'MARKETING' context!", 'success');
                  }}
                >
                  <Target size={16} /> Switch to Marketing Role Context
                </button>
                <button className="btn-secondary" style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActiveTab('dashboard')}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          );
        }
        return <MarketingHubView summary={summary} />;
      case 'admin_console':
        if (!['administrator', 'admin'].includes((user?.role || 'creator').toLowerCase())) {
          return (
            <div className="section-card" style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#be123c' }}>403 Forbidden: Administrator Role Required</h3>
              <p style={{ fontSize: '13px', color: '#881337', marginTop: '6px', maxWidth: '520px', margin: '6px auto 0 auto' }}>
                Your active account role is <strong>{(user?.role || 'creator').toUpperCase()}</strong>. System Administration Console requires an <strong>Administrator</strong> account.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  className="btn-primary"
                  style={{ backgroundColor: '#059669', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    const up = { ...user, role: 'administrator' };
                    setUser(up);
                    try { localStorage.setItem('creatoriq_user', JSON.stringify(up)); } catch(e) {}
                    showToast("Switched role to 'ADMINISTRATOR' context!", 'success');
                  }}
                >
                  <ShieldAlert size={16} /> Elevate to Administrator Role
                </button>
                <button className="btn-secondary" style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActiveTab('dashboard')}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          );
        }
        return <AdminConsoleView user={user} onUpdateUser={setUser} />;
      case 'content':
        return (
          <ContentView
            contents={contents}
            onAdd={handleSaveContent}
            onUpdate={(id, data) => handleSaveContent({ ...data, id })}
            onDelete={handleDeleteContent}
            onSyncYouTube={handleSyncYouTube}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
          />
        );
      case 'audience':
        return (
          <AudienceView
            records={audienceRecords}
            report={audienceReport}
            onAdd={(data) => handleSaveAudience(data)}
            onUpdate={(id, data) => handleSaveAudience({ ...data, id })}
            onDelete={handleDeleteAudience}
          />
        );
      case 'growth':
        return (
          <GrowthView
            growthTrends={growthTrends}
            contents={contents}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
          />
        );
      case 'revenue':
        return (
          <RevenueView
            revenueSummary={revenueSummary}
            revenueRecords={revenueRecords}
            sponsorshipRecords={sponsorshipRecords}
            onAddRevenue={() => { setEditingRevenue(null); setIsRevenueModalOpen(true); }}
            onUpdateRevenue={(rev) => { setEditingRevenue(rev); setIsRevenueModalOpen(true); }}
            onDeleteRevenue={handleDeleteRevenue}
            onAddSponsorship={() => { setEditingSponsorship(null); setIsSponsorshipModalOpen(true); }}
            onUpdateSponsorship={(sp) => { setEditingSponsorship(sp); setIsSponsorshipModalOpen(true); }}
            onDeleteSponsorship={handleDeleteSponsorship}
          />
        );
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return (
          <SettingsView
            user={user}
            onUpdateUser={(upUser) => setUser(upUser)}
            onOpenSocialModal={() => setIsSocialModalOpen(true)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            accentColor={accentColor}
            onSelectAccent={handleSelectAccent}
          />
        );
      default:
        return (
          <DashboardView
            user={user}
            summary={summary}
            audienceReport={audienceReport}
            audienceTrends={audienceTrends}
            reachBreakdown={reachBreakdown}
            engagementChartData={engagementChartData}
            followerGrowthChartData={followerGrowthChartData}
            platformComparison={platformComparison}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            onRefresh={fetchAllBackendData}
            onNavigateTab={setActiveTab}
            loading={loading}
          />
        );
    }
  };

  // If initializing session check, show page loader
  if (isInitializing) {
    return <PageLoader message="Initializing Session..." />;
  }

  // Gatekeeping: If user is not authenticated, show AuthView (Login/Register) ONLY
  if (!user) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <AuthView onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Popup Notification Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Left Sidebar Navigation (Desktop) */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="main-content">
        {/* Top Header Bar */}
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          user={user}
          onUpdateUser={(updatedUser) => {
            setUser(updatedUser);
            try {
              localStorage.setItem('creatoriq_user', JSON.stringify(updatedUser));
            } catch(e) {}
            showToast(`Active role switched to '${(updatedUser.role || 'creator').toUpperCase()}' context!`, 'info');
          }}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          onAutoSync={handleAutoSyncAll}
          isAutoSyncing={isAutoSyncing}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          accentColor={accentColor}
          onSelectAccent={handleSelectAccent}
          onLogout={handleLogout}
          onOpenYouTubeModal={handleOpenYouTubeModal}
          onOpenInstagramModal={handleOpenInstagramModal}
          onOpenSocialModal={handleOpenSocialModal}
          onOpenPlatformModal={handleOpenPlatformModal}
          onOpenNotificationsTab={() => setActiveTab('notifications')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Backend Connection Error Banner */}
        {error && (
          <div className="section-card" style={{ backgroundColor: '#fee2e2', color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 32px 0 32px' }}>
            <span><strong>Backend Connection Notice:</strong> {error}</span>
            <button className="btn-add" onClick={fetchAllBackendData}>Retry Backend Connection</button>
          </div>
        )}

        {/* Active Page View Body */}
        <main className="content-area">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Real-Time Data Sync Banner Notification */}
      {isSyncing && <SyncingBanner message={syncMessage} />}

      {/* Smartphone Bottom Navbar (< 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* CRUD & Workflow Modals */}
      <AudienceModal
        isOpen={isAudienceModalOpen}
        onClose={() => setIsAudienceModalOpen(false)}
        onSave={handleSaveAudience}
        initialData={editingAudience}
      />

      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSave={handleSaveContent}
        initialData={editingContent}
      />

      <YouTubeSyncModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        onSync={handleSyncYouTube}
      />

      <InstagramSyncModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
        onSync={handleSyncInstagram}
      />

      <SocialConnectModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        onConnect={handleConnectSocial}
        onSync={handleSyncSocial}
        connectedPlatforms={connectedPlatforms}
      />

      <PlatformSyncModal
        isOpen={isPlatformSyncModalOpen}
        onClose={() => setIsPlatformSyncModalOpen(false)}
        platform={activeSyncPlatform}
        onSync={handleSyncSocial}
      />

      <RevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        onSave={handleSaveRevenue}
        initialData={editingRevenue}
      />

      <SponsorshipModal
        isOpen={isSponsorshipModalOpen}
        onClose={() => setIsSponsorshipModalOpen(false)}
        onSave={handleSaveSponsorship}
        initialData={editingSponsorship}
      />
    </div>
  );
}
