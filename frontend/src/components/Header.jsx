import React, { useState, useRef, useEffect } from 'react';
import { Link2, LogOut, Menu, Zap, ChevronDown, Plus, Globe, Sliders, RefreshCw, Sun, Moon, Palette } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { YoutubeIcon, InstagramIcon, LinkedInIcon, TwitterIcon, FacebookIcon } from './PlatformIcons';

export default function Header({
  title,
  subtitle,
  user,
  onUpdateUser,
  selectedPlatform = 'All',
  onPlatformChange,
  onAutoSync,
  isAutoSyncing = false,
  theme = 'light',
  onToggleTheme,
  accentColor = 'indigo',
  onSelectAccent,
  onLogout,
  onOpenSocialModal,
  onOpenPlatformModal,
  onOpenNotificationsTab,
  onToggleMobileSidebar
}) {
  const [showConnectMenu, setShowConnectMenu] = useState(false);
  const [showAccentMenu, setShowAccentMenu] = useState(false);
  const menuRef = useRef(null);
  const accentRef = useRef(null);

  const userName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Creator';
  const initial = userName.charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowConnectMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectConnect = (platformKey) => {
    setShowConnectMenu(false);
    if (platformKey === 'hub') {
      onOpenSocialModal && onOpenSocialModal();
    } else {
      onOpenPlatformModal && onOpenPlatformModal(platformKey);
    }
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-only"
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} color="#0f172a" />
        </button>

        <div className="header-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
              {title || 'CreatorIQ Dashboard'}
            </h1>
            <span className="live-badge">
              <span className="live-dot" /> LIVE REALTIME
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: 500 }}>
            {subtitle || 'Realtime Revenue & Analytics Management Platform'}
          </p>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Global Platform Selector Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ffffff',
          padding: '6px 12px',
          borderRadius: '9999px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
        }}>
          <Sliders size={14} color="#64748b" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformChange && onPlatformChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none',
              paddingRight: '4px'
            }}
          >
            <option value="All">All Platforms</option>
            <option value="YouTube">YouTube</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="X">X (Twitter)</option>
          </select>
        </div>

        {/* Auto-Sync All Button */}
        {onAutoSync && (
          <button
            className="nav-btn"
            onClick={onAutoSync}
            disabled={isAutoSyncing}
            style={{
              backgroundColor: isAutoSyncing ? '#f3f4f6' : '#f0fdf4',
              color: isAutoSyncing ? '#6b7280' : '#15803d',
              fontWeight: 700,
              border: `1px solid ${isAutoSyncing ? '#d1d5db' : '#bbf7d0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              cursor: isAutoSyncing ? 'not-allowed' : 'pointer'
            }}
            title="Auto-Sync All Saved Channels & Handles"
          >
            {isAutoSyncing ? (
              <RefreshCw size={14} className="spin" color="#6b7280" />
            ) : (
              <Zap size={14} color="#15803d" />
            )}
            <span>{isAutoSyncing ? 'Syncing Live Data...' : 'Auto-Sync All'}</span>
          </button>
        )}


        {/* Consolidated + Connect Channels Dropdown Menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowConnectMenu(!showConnectMenu)}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
            title="Connect Social Media Channels & Sync APIs"
          >
            <Plus size={15} color="#ffffff" />
            <span>Connect Channel</span>
            <ChevronDown size={14} color="#ffffff" style={{ transform: showConnectMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </button>

          {showConnectMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '230px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
              padding: '6px',
              zIndex: 1000
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', padding: '8px 10px 4px 10px', letterSpacing: '0.5px' }}>
                Select Social Platform
              </div>

              {[
                { key: 'YouTube', label: 'YouTube Channel', icon: YoutubeIcon, color: '#dc2626' },
                { key: 'Instagram', label: 'Instagram Profile', icon: InstagramIcon, color: '#be185d' },
                { key: 'LinkedIn', label: 'LinkedIn Profile/Page', icon: LinkedInIcon, color: '#1d4ed8' },
                { key: 'X', label: 'X (Twitter) Handle', icon: TwitterIcon, color: '#0284c7' },
                { key: 'Facebook', label: 'Facebook Page', icon: FacebookIcon, color: '#2563eb' },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSelectConnect(item.key)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#0f172a',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <IconComponent size={16} color={item.color} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

              <button
                onClick={() => handleSelectConnect('hub')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Globe size={15} color="#1d4ed8" />
                <span>Open Multi-API Connect Hub</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell Dropdown Widget */}
        <NotificationBell onOpenFullNotifications={onOpenNotificationsTab} />

        {/* Theme Quick Toggle (Light/Dark Mode) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            style={{
              background: theme === 'dark' ? '#1e293b' : '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme === 'dark' ? '#f59e0b' : '#6366f1',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              transition: 'all 0.2s ease'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* Accent Color Palette Selector */}
        {onSelectAccent && (
          <div ref={accentRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAccentMenu(!showAccentMenu)}
              style={{
                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--primary-accent)',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
              }}
              title="Change Dashboard Accent Color"
            >
              <Palette size={18} />
            </button>

            {showAccentMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: theme === 'dark' ? '#151d30' : '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                display: 'flex',
                gap: '8px',
                zIndex: 1000
              }}>
                {[
                  { key: 'indigo', name: 'Indigo', color: '#4f46e5' },
                  { key: 'emerald', name: 'Emerald', color: '#10b981' },
                  { key: 'violet', name: 'Violet', color: '#8b5cf6' },
                  { key: 'cyan', name: 'Cyan', color: '#0284c7' },
                  { key: 'amber', name: 'Amber', color: '#d97706' }
                ].map((acc) => (
                  <button
                    key={acc.key}
                    onClick={() => { onSelectAccent(acc.key); setShowAccentMenu(false); }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: acc.color,
                      border: accentColor === acc.key ? '2px solid #ffffff' : 'none',
                      outline: accentColor === acc.key ? `2px solid ${acc.color}` : 'none',
                      cursor: 'pointer'
                    }}
                    title={acc.name}
                  />
                ))}
              </div>
            )}
          </div>
        )}


        {/* User Profile Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ffffff',
          padding: '4px 10px 4px 4px',
          borderRadius: '9999px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            {initial}
          </div>
          <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', lineHeight: 1.2 }}>
              {userName}
            </span>
            {onUpdateUser ? (
              <select
                value={(user?.role || 'creator').toLowerCase() === 'admin' ? 'administrator' : (user?.role || 'creator').toLowerCase()}
                onChange={(e) => onUpdateUser({ ...user, role: e.target.value })}
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  color: user?.role === 'agency' ? '#6b21a8' : user?.role === 'marketing' ? '#92400e' : (user?.role === 'administrator' || user?.role === 'admin') ? '#166534' : '#3730a3',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: 0
                }}
                title="Quick Role Switcher: Switch system roles"
              >
                <option value="creator">CREATOR</option>
                <option value="agency">AGENCY</option>
                <option value="marketing">MARKETING</option>
                <option value="administrator">ADMINISTRATOR</option>
              </select>
            ) : (
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                color: user?.role === 'agency' ? '#6b21a8' : user?.role === 'marketing' ? '#92400e' : (user?.role === 'administrator' || user?.role === 'admin') ? '#166534' : '#3730a3'
              }}>
                {user?.role ? user.role.toUpperCase() : 'CREATOR'}
              </span>
            )}
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '50%',
              transition: 'color 0.15s ease',
              marginLeft: '4px'
            }}
            title="Sign Out"
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
