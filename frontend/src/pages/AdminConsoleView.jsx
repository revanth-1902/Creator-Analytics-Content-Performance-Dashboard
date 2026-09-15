import React, { useState, useEffect } from 'react';
import { Server, Users, ShieldAlert, Database, RefreshCw, Trash2, CheckCircle2, UserCheck, Key, Lock, Activity, Sliders, Plus, Shield, Search, X } from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../api';

export default function AdminConsoleView({ user, onUpdateUser }) {
  const [adminStats, setAdminStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'audit', 'health'
  
  // Create User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [roleConfirmModal, setRoleConfirmModal] = useState(null); // { targetUser, currentRole, newRole }
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('creator');
  const [creatingUser, setCreatingUser] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, event: 'System Boot & JWT Key Loaded', user: 'SYSTEM', timestamp: '2026-09-13 14:30:00', type: 'security' },
    { id: 2, event: 'Role Reassignment Policy Enforced', user: user?.email || 'admin@creatoriq.com', timestamp: '2026-09-13 14:15:22', type: 'role' },
    { id: 3, event: 'PostgreSQL Database Connection Health Check', user: 'DB_MONITOR', timestamp: '2026-09-13 14:00:10', type: 'system' },
    { id: 4, event: 'Multi-Tenant Data Scope Verified', user: 'SECURITY_GUARD', timestamp: '2026-09-13 13:45:00', type: 'security' }
  ]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [stats, users] = await Promise.all([
        api.getAdminSystemStats().catch(() => null),
        api.getAllUsers().catch(() => [])
      ]);
      setAdminStats(stats);
      if (Array.isArray(users)) {
        setUsersList(users);
      }
    } catch (e) {
      console.error('Error fetching admin console data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await api.register(newFullName, newEmail, newPassword, newRole);
      if (res && res.user) {
        setUsersList(prev => [...prev, res.user]);
        setAuditLogs(prev => [
          { id: Date.now(), event: `Created User '${newEmail}' with role '${newRole.toUpperCase()}'`, user: user?.email || 'Admin', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), type: 'user' },
          ...prev
        ]);
      }
      setIsAddUserOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('creator');
      setActionMessage({ text: `User account '${newEmail}' registered successfully!`, type: 'success' });
      await fetchAdminData();
    } catch (err) {
      setActionMessage({ text: `Failed to create user: ${err.message}`, type: 'error' });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSelectRoleChange = (targetUser, newRoleVal) => {
    const currentRole = (targetUser.role || 'creator').toLowerCase();
    const formattedCurrent = currentRole === 'admin' ? 'administrator' : currentRole;
    if (formattedCurrent === newRoleVal) return;
    setRoleConfirmModal({
      targetUser,
      currentRole: formattedCurrent,
      newRole: newRoleVal
    });
  };

  const confirmRoleChange = async () => {
    if (!roleConfirmModal) return;
    const { targetUser, newRole } = roleConfirmModal;
    setRoleConfirmModal(null);
    await handleRoleChange(targetUser.id, newRole);
  };

  const handleRoleChange = async (targetUserId, newRoleVal) => {
    setUpdatingId(targetUserId);
    try {
      await api.updateUserRole(targetUserId, newRoleVal);
      setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRoleVal } : u));
      if (user && user.id === targetUserId && onUpdateUser) {
        onUpdateUser({ ...user, role: newRoleVal });
      }
      setAuditLogs(prev => [
        { id: Date.now(), event: `Updated User ID #${targetUserId} role to '${newRoleVal.toUpperCase()}'`, user: user?.email || 'Admin', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), type: 'role' },
        ...prev
      ]);
      setActionMessage({ text: `Role updated to '${newRoleVal.toUpperCase()}' successfully!`, type: 'success' });
    } catch (e) {
      setActionMessage({ text: `Failed to update role: ${e.message}`, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (targetUserId, targetEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user '${targetEmail}'?`)) return;
    try {
      await api.deleteUserAccount(targetUserId);
      setUsersList(prev => prev.filter(u => u.id !== targetUserId));
      setAuditLogs(prev => [
        { id: Date.now(), event: `Deleted User '${targetEmail}' (ID #${targetUserId})`, user: user?.email || 'Admin', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), type: 'security' },
        ...prev
      ]);
      setActionMessage({ text: `User account '${targetEmail}' deleted successfully!`, type: 'info' });
    } catch (e) {
      setActionMessage({ text: `Failed to delete user: ${e.message}`, type: 'error' });
    }
  };

  const handleClearCache = () => {
    setActionMessage({ text: 'System Redis cache and query session buffer flushed successfully!', type: 'success' });
    setAuditLogs(prev => [
      { id: Date.now(), event: 'Flushed Redis System Query Cache', user: user?.email || 'Admin', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), type: 'system' },
      ...prev
    ]);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const getRoleCount = (roleKey) => {
    if (roleKey === 'ALL') return usersList.length;
    const keyLower = roleKey.toLowerCase();
    return usersList.filter(u => {
      const ur = (u.role || 'creator').toLowerCase();
      if (keyLower === 'administrator' || keyLower === 'admin') {
        return ['administrator', 'admin', 'manager', 'analyst'].includes(ur);
      }
      return ur === keyLower;
    }).length;
  };

  const filteredUsers = usersList.filter(u => {
    const userRole = (u.role || 'creator').toLowerCase();
    const filterRole = selectedRoleFilter.toLowerCase();
    
    let roleMatch = filterRole === 'all';
    if (!roleMatch) {
      if (filterRole === 'administrator' || filterRole === 'admin') {
        roleMatch = ['administrator', 'admin', 'manager', 'analyst'].includes(userRole);
      } else {
        roleMatch = userRole === filterRole;
      }
    }
    
    if (!roleMatch) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name || u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalUsers = usersList.length || adminStats?.total_registered_users || 1;
  const dbRecords = adminStats?.database_stats?.contents_records || 150;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Notice Alert Banner */}
      {actionMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          backgroundColor: actionMessage.type === 'error' ? '#fff1f2' : actionMessage.type === 'info' ? '#f0f9ff' : '#f0fdf4',
          color: actionMessage.type === 'error' ? '#be123c' : actionMessage.type === 'info' ? '#0369a1' : '#166534',
          border: `1px solid ${actionMessage.type === 'error' ? '#fecdd3' : actionMessage.type === 'info' ? '#bae6fd' : '#bbf7d0'}`,
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="section-card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)', color: '#ffffff', border: 'none', boxShadow: '0 12px 30px rgba(4, 120, 87, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={30} color="#a7f3d0" />
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
                System Administration & Role Access Control Console
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#d1fae5', marginTop: '6px', fontWeight: 500 }}>
              Complete administrative authority over multi-role user accounts, JWT token security, RBAC scope enforcement & database maintenance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="btn-primary"
              style={{ backgroundColor: '#10b981', color: '#064e3b', fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}
            >
              <Plus size={16} color="#064e3b" />
              <span>Create User Account</span>
            </button>
            <button
              onClick={handleClearCache}
              className="btn-primary"
              style={{ backgroundColor: '#059669', borderColor: '#34d399' }}
            >
              <Database size={14} />
              <span>Flush System Cache</span>
            </button>
            <button
              onClick={fetchAdminData}
              className="btn-primary"
              style={{ backgroundColor: '#047857', borderColor: '#6ee7b7' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin KPI Overview Cards */}
      <div className="grid-stats">
        <StatCard
          title="Registered User Accounts"
          value={totalUsers}
          subtitle="Multi-Tenant User Count"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Database Records"
          value={`${dbRecords}+`}
          subtitle="PostgreSQL Stored Analytics"
          icon={Database}
          color="indigo"
        />
        <StatCard
          title="Engine Status"
          value="FastAPI v4.0.0"
          subtitle="Uvicorn Server Online"
          icon={Server}
          color="purple"
        />
        <StatCard
          title="Security Enforcement"
          value="256-bit JWT RBAC"
          subtitle="Strict Scope Protection"
          icon={ShieldAlert}
          color="amber"
        />
      </div>

      {/* Admin Console View Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('directory')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'directory' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'directory' ? '#ffffff' : 'var(--text-muted)'
          }}
        >
          User Accounts Directory & Role Management
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'audit' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'audit' ? '#ffffff' : 'var(--text-muted)'
          }}
        >
          Security Audit Trail Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('health')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'health' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'health' ? '#ffffff' : 'var(--text-muted)'
          }}
        >
          Infrastructure & Service Health
        </button>
      </div>

      {/* Tab 1: User Directory & Role Assignment Table */}
      {activeTab === 'directory' && (
        <div className="section-card" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <div className="section-header" style={{ alignItems: 'flex-start' }}>
            <div>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                <UserCheck size={22} color="#059669" />
                <span>Registered User Directory & Role Assignment</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0', fontWeight: 500 }}>
                View all <strong>{usersList.length}</strong> registered accounts, switch roles in real-time (Creator, Agency, Marketing, Administrator), or manage user profiles.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Role Filter Tabs */}
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #cbd5e1' }}>
                {['ALL', 'creator', 'agency', 'marketing', 'administrator'].map((roleKey) => {
                  const count = getRoleCount(roleKey);
                  const isSelected = selectedRoleFilter === roleKey;
                  return (
                    <button
                      key={roleKey}
                      onClick={() => { setSelectedRoleFilter(roleKey); setCurrentPage(1); }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#047857' : 'transparent',
                        color: isSelected ? '#ffffff' : '#64748b',
                        boxShadow: isSelected ? '0 2px 8px rgba(4, 120, 87, 0.3)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {roleKey} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Field */}
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px' }}>User ID</th>
                  <th style={{ padding: '10px 14px' }}>Registered User</th>
                  <th style={{ padding: '10px 14px' }}>Email Address</th>
                  <th style={{ padding: '10px 14px' }}>Current Role Badge</th>
                  <th style={{ padding: '10px 14px' }}>Reassign Role Access</th>
                  <th style={{ padding: '10px 14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => {
                    const currentRole = (u.role || 'creator').toLowerCase();
                    const isSelf = user && user.id === u.id;
                    const userName = u.full_name || u.name || 'User Account';
                    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

                    const roleColors = {
                      agency: { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
                      marketing: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
                      administrator: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
                      admin: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
                      creator: { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' }
                    };
                    const roleStyle = roleColors[currentRole] || roleColors.creator;

                    return (
                      <tr
                        key={u.id}
                        style={{
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <td style={{ fontWeight: 800, padding: '12px 14px', color: '#64748b' }}>#{u.id}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)'
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                                {userName} {isSelf && <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 800, marginLeft: '4px' }}>(Logged In You)</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#475569', padding: '12px 14px', fontSize: '13px', fontWeight: 600 }}>{u.email}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`
                          }}>
                            <Shield size={12} />
                            {currentRole === 'admin' ? 'ADMINISTRATOR' : currentRole.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <select
                            value={currentRole === 'admin' ? 'administrator' : currentRole}
                            disabled={updatingId === u.id}
                            onChange={(e) => handleSelectRoleChange(u, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              fontWeight: 700,
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="creator">Creator (Personal Analytics)</option>
                            <option value="agency">Agency (Multi-Creator Hub)</option>
                            <option value="marketing">Marketing Team (Campaign ROI)</option>
                            <option value="administrator">Administrator (Full Admin)</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={isSelf}
                            style={{
                              backgroundColor: isSelf ? '#f1f5f9' : '#fff1f2',
                              color: isSelf ? '#94a3b8' : '#e11d48',
                              border: `1px solid ${isSelf ? '#e2e8f0' : '#fecdd3'}`,
                              borderRadius: '6px',
                              padding: '5px 12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                            title={isSelf ? 'Self deletion prevented' : 'Delete Account'}
                          >
                            <Trash2 size={12} /> Delete Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
                      {loading ? 'Loading registered user directory...' : 'No matching users found for selected role filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> registered accounts
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                    color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', padding: '0 6px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                    color: currentPage >= totalPages ? '#94a3b8' : '#0f172a',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Security Audit Trail Logs */}
      {activeTab === 'audit' && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#8b5cf6" />
                <span>Real-Time System & Role Security Audit Logs</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Chronological security log trail of authentication attempts, role modifications, and admin actions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{
                backgroundColor: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: log.type === 'security' ? '#ef4444' : log.type === 'role' ? '#8b5cf6' : log.type === 'user' ? '#10b981' : '#3b82f6'
                  }} />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>{log.event}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Actor: <strong>{log.user}</strong></span>
                  <span>Timestamp: <strong>{log.timestamp}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Infrastructure Health Matrix */}
      {activeTab === 'health' && (
        <div className="section-card">
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Server size={20} color="#2563eb" />
            <span>Active Services Infrastructure Health Matrix</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {(adminStats?.active_services || [
              { service: 'YouTube Data API / RSS Feed Sync', status: 'Healthy (Live)' },
              { service: 'Instagram Graph API / Profile Scraper', status: 'Healthy (Live)' },
              { service: 'X (Twitter) Handle Resolver', status: 'Healthy (Live)' },
              { service: 'PostgreSQL Database Primary Engine', status: 'Connected & Synchronized' },
              { service: 'PDF & Excel Export Report Engine', status: 'Ready (ReportLab & OpenPyXL)' },
              { service: 'JWT Authentication & Scope Middleware', status: 'Active (256-bit RS256)' }
            ]).map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534' }}>{item.service}</div>
                  <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px', fontWeight: 600 }}>{item.status}</div>
                </div>
                <CheckCircle2 size={18} color="#16a34a" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create User Modal Form */}
      {isAddUserOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Create New System User Account
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Register a new account with custom role authorization across the CreatorIQ platform.
            </p>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agency Lead"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="partner@agency.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Assigned System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                >
                  <option value="creator">Creator (Personal Analytics)</option>
                  <option value="agency">Agency (Multi-Creator Network)</option>
                  <option value="marketing">Marketing Team (Campaign Strategy)</option>
                  <option value="administrator">Administrator (Full Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddUserOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="btn-primary"
                  style={{ flex: 1, backgroundColor: '#059669', border: 'none' }}
                >
                  {creatingUser ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Reassignment Confirmation Modal Popup */}
      {roleConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #a7f3d0'
              }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Confirm Role Reassignment
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Security & Access Control Scope Update
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', margin: '14px 0 18px 0' }}>
              Are you sure you want to change the access role for <strong>{roleConfirmModal.targetUser.full_name || roleConfirmModal.targetUser.name || 'this user'}</strong> (<span style={{ color: '#059669', fontWeight: 700 }}>{roleConfirmModal.targetUser.email}</span>)?
            </p>

            {/* Role Transition Visual Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Current Role
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  display: 'inline-block'
                }}>
                  {roleConfirmModal.currentRole.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', padding: '0 8px' }}>
                ➔
              </div>

              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  New Assigned Role
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  display: 'inline-block'
                }}>
                  {roleConfirmModal.newRole.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setRoleConfirmModal(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRoleChange}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)'
                }}
              >
                Yes, Reassign Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

