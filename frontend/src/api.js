/**
 * API Client Module for CreatorIQ Frontend.
 * Handles authentication tokens, cookie storage, REST requests, and binary blob downloads.
 */

import { getCookie, setCookie, deleteCookie } from './utils/cookie';

const API_BASE_URL = typeof window !== 'undefined' && window.location.origin.includes(':5173')
  ? '/api-backend'
  : 'http://127.0.0.1:8000';

export function getStoredToken() {
  return getCookie('creatoriq_token') || localStorage.getItem('creatoriq_token');
}

export function getStoredUser() {
  const raw = getCookie('creatoriq_user') || localStorage.getItem('creatoriq_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { email: raw };
  }
}

export function saveAuthSession(token, user) {
  if (token) {
    setCookie('creatoriq_token', token, 30);
    localStorage.setItem('creatoriq_token', token);
  }
  if (user) {
    const userStr = typeof user === 'string' ? user : JSON.stringify(user);
    setCookie('creatoriq_user', userStr, 30);
    localStorage.setItem('creatoriq_user', userStr);
  }
}

export function clearAuthSession() {
  deleteCookie('creatoriq_token');
  deleteCookie('creatoriq_user');
  localStorage.removeItem('creatoriq_token');
  localStorage.removeItem('creatoriq_user');
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('creatoriq:unauthorized'));
    }
  }

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (e) {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}

async function requestBlob(endpoint, filename, options = {}) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('creatoriq:unauthorized'));
    }
  }

  if (!response.ok) {
    let errorDetail = 'File Export Failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (e) {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  return true;
}

export const api = {
  // Auth APIs
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res && res.access_token) {
      saveAuthSession(res.access_token, res.user || { email });
    }
    return res;
  },

  register: async (fullName, email, password, role = 'creator') => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, role })
    });
    if (res && res.access_token) {
      saveAuthSession(res.access_token, res.user || { email, full_name: fullName });
    }
    return res;
  },

  // Dashboard & Analytics APIs
  getDashboardSummary: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/summary${query}`);
  },

  getReachBreakdown: async () => {
    return await request('/analytics/reach-breakdown');
  },

  getAudienceReport: async () => {
    return await request('/analytics/audience');
  },

  getGrowthReport: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/growth${query}`);
  },

  getAudienceTrends: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/audience-trends${query}`);
  },

  getTopContent: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/top-content${query}`);
  },

  getPlatformPerformance: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/platform-performance${query}`);
  },

  getEngagementChart: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/chart/engagement${query}`);
  },

  getFollowerGrowthChart: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/chart/followers${query}`);
  },

  getSentimentAnalysis: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/sentiment${query}`);
  },

  getPlatformComparison: async () => {
    return await request('/social/platforms/comparison');
  },

  // Social Media Workflow APIs
  getSavedAccounts: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/social/platforms/saved-accounts${query}`);
  },

  saveSocialAccount: async (platform, handle, accountName) => {
    const pQuery = `platform=${encodeURIComponent(platform)}&handle=${encodeURIComponent(handle)}`;
    const nQuery = accountName ? `&account_name=${encodeURIComponent(accountName)}` : '';
    return await request(`/social/platforms/saved-accounts?${pQuery}${nQuery}`, {
      method: 'POST'
    });
  },

  deleteSavedAccount: async (accountId) => {
    return await request(`/social/platforms/saved-accounts/${accountId}`, {
      method: 'DELETE'
    });
  },

  autoSyncAccounts: async () => {
    return await request('/social/platforms/auto-sync', {
      method: 'POST'
    });
  },

  connectSocialPlatform: async (platform, accountName) => {
    return await request('/social/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, account_name: accountName })
    });
  },

  getConnectedSocialPlatforms: async () => {
    return await request('/social/platforms');
  },

  syncSocialPlatform: async (platform) => {
    return await request('/social/sync', {
      method: 'POST',
      body: JSON.stringify({ platform })
    });
  },

  // YouTube & Instagram Multi-Platform Integration
  syncYouTube: async (channelId) => {
    const query = channelId ? `?channel_id=${encodeURIComponent(channelId)}` : '';
    return await request(`/social/youtube/sync${query}`, {
      method: 'POST'
    });
  },

  syncInstagram: async (handle) => {
    const query = handle ? `?account_id=${encodeURIComponent(handle)}` : '';
    return await request(`/social/platforms/Instagram/sync${query}`, {
      method: 'POST'
    });
  },

  syncPlatform: async (platform, accountId) => {
    const query = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    return await request(`/social/platforms/${encodeURIComponent(platform)}/sync${query}`, {
      method: 'POST'
    });
  },

  getPlatformComparison: async () => {
    return await request('/social/platforms/comparison');
  },

  // Audience CRUD
  getAudience: async () => {
    return await request('/audience');
  },

  createAudience: async (payload) => {
    return await request('/audience', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateAudience: async (id, payload) => {
    return await request(`/audience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteAudience: async (id) => {
    return await request(`/audience/${id}`, {
      method: 'DELETE'
    });
  },

  // Content CRUD
  getContent: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/content${query}`);
  },

  createContent: async (payload) => {
    return await request('/content', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateContent: async (id, payload) => {
    return await request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteContent: async (id) => {
    return await request(`/content/${id}`, {
      method: 'DELETE'
    });
  },

  // Sprint 6: Revenue Management & Analytics APIs
  getRevenue: async (source) => {
    const query = source && source !== 'All' ? `?source=${encodeURIComponent(source)}` : '';
    return await request(`/revenue${query}`);
  },

  createRevenue: async (payload) => {
    return await request('/revenue', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateRevenue: async (id, payload) => {
    return await request(`/revenue/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteRevenue: async (id) => {
    return await request(`/revenue/${id}`, {
      method: 'DELETE'
    });
  },

  getRevenueSummary: async () => {
    return await request('/revenue/analytics/summary');
  },

  getRevenueBySource: async () => {
    return await request('/revenue/analytics/by-source');
  },

  getMonthlyRevenue: async () => {
    return await request('/revenue/analytics/monthly');
  },

  getRevenueTrends: async (days = 30) => {
    return await request(`/revenue/analytics/trends?days=${days}`);
  },

  // Sprint 6: Sponsorship Management APIs
  getSponsorships: async (status, paymentStatus) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (paymentStatus && paymentStatus !== 'All') params.append('payment_status', paymentStatus);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/sponsorships${queryString}`);
  },

  createSponsorship: async (payload) => {
    return await request('/sponsorships', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateSponsorship: async (id, payload) => {
    return await request(`/sponsorships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteSponsorship: async (id) => {
    return await request(`/sponsorships/${id}`, {
      method: 'DELETE'
    });
  },

  // Sprint 7: Notification & Alert APIs
  getNotifications: async (unreadOnly = false, type = null) => {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unread_only', 'true');
    if (type && type !== 'All') params.append('type', type.toLowerCase());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/notifications${queryString}`);
  },

  getUnreadNotificationCount: async () => {
    return await request('/notifications/unread-count');
  },

  markNotificationAsRead: async (id) => {
    return await request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  markAllNotificationsAsRead: async () => {
    return await request('/notifications/read-all', {
      method: 'PUT'
    });
  },

  triggerAlertCheck: async () => {
    return await request('/notifications/check-alerts', {
      method: 'POST'
    });
  },

  deleteNotification: async (id) => {
    return await request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  // Sprint 7: Reporting Service & Export APIs
  getReportTypes: async () => {
    return await request('/reports/types');
  },

  generateReport: async (reportType = 'executive_summary', dateRange = '30_days', save = true) => {
    return await request(`/reports/generate?save=${save}`, {
      method: 'POST',
      body: JSON.stringify({ report_type: reportType, date_range: dateRange })
    });
  },

  getSavedReports: async () => {
    return await request('/reports');
  },

  getReportById: async (id) => {
    return await request(`/reports/${id}`);
  },

  downloadReportPdf: async (reportType = 'executive_summary', dateRange = '30_days') => {
    const filename = `CreatorIQ_${reportType}_${Date.now()}.pdf`;
    return await requestBlob('/reports/export/pdf', filename, {
      method: 'POST',
      body: JSON.stringify({ report_type: reportType, date_range: dateRange })
    });
  },

  downloadReportExcel: async (reportType = 'executive_summary', dateRange = '30_days') => {
    const filename = `CreatorIQ_${reportType}_${Date.now()}.xlsx`;
    return await requestBlob('/reports/export/excel', filename, {
      method: 'POST',
      body: JSON.stringify({ report_type: reportType, date_range: dateRange })
    });
  },

  downloadSavedReportPdf: async (id) => {
    const filename = `CreatorIQ_Report_${id}.pdf`;
    return await requestBlob(`/reports/${id}/pdf`, filename, { method: 'GET' });
  },

  downloadSavedReportExcel: async (id) => {
    const filename = `CreatorIQ_Report_${id}.xlsx`;
    return await requestBlob(`/reports/${id}/excel`, filename, { method: 'GET' });
  },

  deleteReport: async (id) => {
    return await request(`/reports/${id}`, {
      method: 'DELETE'
    });
  },

  // User & Role Management APIs
  getCurrentUserProfile: async () => {
    return await request('/users/me');
  },

  getAllUsers: async () => {
    return await request('/users');
  },

  updateUserRole: async (userId, role) => {
    return await request(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  deleteUserAccount: async (userId) => {
    return await request(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  getAgencyRoster: async () => {
    return await request('/users/agency/roster');
  },

  getAdminSystemStats: async () => {
    return await request('/users/admin/system-stats');
  }
};


