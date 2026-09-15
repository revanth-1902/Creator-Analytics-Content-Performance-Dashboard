import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  TrendingUp, 
  DollarSign,
  Bell,
  FileText,
  Settings,
  Building2,
  Target,
  ShieldAlert,
  Flame,
  Sparkles,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, isMobileOpen, onCloseMobile }) {
  const userRole = (user?.role || 'creator').toLowerCase();

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'agency_hub', label: 'Agency Roster & Portfolio', icon: Building2, roles: ['agency', 'administrator', 'admin'] },
    { id: 'marketing_hub', label: 'Campaign Strategy Hub', icon: Target, roles: ['marketing', 'administrator', 'admin'] },
    { id: 'admin_console', label: 'System Admin Console', icon: ShieldAlert, roles: ['administrator', 'admin'] },
    { id: 'content', label: 'Content Analytics', icon: Video, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'ai_copilot', label: 'AI Copilot & Knowledge', icon: Sparkles, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'trending', label: 'Trending & Viral Explorer', icon: Flame, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'audience', label: 'Audience Analytics', icon: Users, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'growth', label: 'Growth & Trends', icon: TrendingUp, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'revenue', label: 'Revenue & Sponsorships', icon: DollarSign, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'reports', label: 'Reports & Export', icon: FileText, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] },
    { id: 'settings', label: 'Profile & Settings', icon: Settings, roles: ['creator', 'agency', 'marketing', 'administrator', 'admin'] }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99
          }}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div>
          <div className="brand" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="brand-icon">IQ</div>
              <span className="brand-name">CreatorIQ</span>
            </div>

            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          <ul className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sign Out button at bottom of sidebar */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
          <button
            className="nav-item"
            onClick={onLogout}
            style={{ color: '#f43f5e', width: '100%' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
