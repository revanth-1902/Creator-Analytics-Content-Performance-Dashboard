import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Video, Search, Layers, Share2, Sparkles, TrendingUp, Zap } from 'lucide-react';
import ContentModal from '../components/ContentModal';
import StatCard from '../components/StatCard';
import YouTubeSyncModal from '../components/YouTubeSyncModal';
import EmptyState from '../components/EmptyState';
import { YoutubeIcon, InstagramIcon, LinkedInIcon, TwitterIcon } from '../components/PlatformIcons';
import { formatNumber, rawNumber, FormattedNumber } from '../utils/format';
import { useSortableData, SortHeader } from '../utils/useSortableData';
import Pagination from '../components/Pagination';


const platforms = ['All', 'YouTube', 'Instagram', 'Facebook', 'LinkedIn', 'X'];

const platformIconMap = {
  YouTube: { icon: YoutubeIcon, color: '#dc2626', bg: '#fee2e2' },
  Instagram: { icon: InstagramIcon, color: '#be185d', bg: '#fce7f3' },
  LinkedIn: { icon: LinkedInIcon, color: '#1d4ed8', bg: '#eff6ff' },
  'Twitter/X': { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  Twitter: { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  X: { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  Facebook: { icon: Share2, color: '#2563eb', bg: '#eff6ff' },
};

export default function ContentView({ contents, onAdd, onUpdate, onDelete, onSyncYouTube, selectedPlatform, onSelectPlatform }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredContents = (contents || []).filter(c => {
    const pStr = (c.platform || '').toLowerCase();
    const sStr = (selectedPlatform || 'All').toLowerCase();

    let matchesPlatform = sStr === 'all';
    if (!matchesPlatform) {
      if (sStr === 'twitter/x' || sStr === 'x' || sStr === 'twitter' || sStr === 'x (twitter)') {
        matchesPlatform = (pStr === 'x' || pStr === 'twitter' || pStr === 'twitter/x');
      } else {
        matchesPlatform = pStr === sStr;
      }
    }

    const matchesSearch = !searchQuery || (c.content_title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const { items: sortedContents, requestSort, sortConfig } = useSortableData(filteredContents, { key: 'views', direction: 'desc' });

  const totalPages = Math.ceil(sortedContents.length / pageSize) || 1;
  const paginatedContents = sortedContents.slice((currentPage - 1) * pageSize, currentPage * pageSize);


  const totalViews = filteredContents.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalLikes = filteredContents.reduce((acc, c) => acc + (c.likes || 0), 0);
  const totalComments = filteredContents.reduce((acc, c) => acc + (c.comments || 0), 0);
  const totalReach = filteredContents.reduce((acc, c) => acc + (c.reach || 0), 0);

  const avgEngagementRate = filteredContents.length > 0
    ? (filteredContents.reduce((acc, c) => acc + (c.engagement_rate || ((c.likes + c.comments) / (c.views || 1) * 100)), 0) / filteredContents.length).toFixed(2)
    : '0.00';

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingRecord) {
      onUpdate(editingRecord.id, data);
    } else {
      onAdd(data);
    }
  };

  const getItemBadge = (item) => {
    const views = item.views || 0;
    const likes = item.likes || 0;
    const rate = item.engagement_rate || ((likes / (views || 1)) * 100);

    if (views > 1000000 || rate > 9.0) {
      return (
        <span style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Sparkles size={11} color="#047857" /> Viral Top 1%
        </span>
      );
    } else if (views > 300000 || rate > 6.0) {
      return (
        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <TrendingUp size={11} color="#1d4ed8" /> High Virality
        </span>
      );
    } else {
      return (
        <span style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
          Stable Growth
        </span>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Controls: Platform Filters & Search Bar & YouTube Sync */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginRight: '6px' }}>Filter:</span>
          {platforms.map((p) => {
            const active = (selectedPlatform || 'All').toLowerCase() === p.toLowerCase();
            return (
              <button
                key={p}
                onClick={() => onSelectPlatform && onSelectPlatform(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: active ? 'none' : '1px solid #cbd5e1',
                  backgroundColor: active ? '#2563eb' : '#f8fafc',
                  color: active ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search content library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                width: '200px'
              }}
            />
          </div>

          {onSyncYouTube && (
            <button
              onClick={() => setIsYouTubeModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <YoutubeIcon size={16} color="#ffffff" />
              <span>Sync YouTube Channel</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Summary Cards (4 Cards) */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
        <StatCard
          title={`${selectedPlatform && selectedPlatform !== 'All' ? selectedPlatform : 'Total'} Views`}
          value={totalViews}
          subtitle="Cumulative View Count"
          icon={Video}
          color="indigo"
        />
        <StatCard
          title="Total Engagements"
          value={totalLikes + totalComments}
          subtitle="Reactions & Comments"
          icon={Sparkles}
          color="purple"
        />
        <StatCard
          title="Filtered Organic Reach"
          value={totalReach}
          subtitle="Unique Organic Audience Reach"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Avg Library Engagement"
          value={`${avgEngagementRate}%`}
          subtitle="Mean Engagement Velocity"
          icon={Zap}
          color="amber"
        />
      </div>

      {/* Content Performance Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#2563eb" />
              <span>Content Performance Library</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                {filteredContents.length} items
              </span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Click column headers to sort by Views, Likes, Comments, Reach, or Date
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Create Content Record</span>
          </button>
        </div>

        <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          <table className="simple-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Platform" columnKey="platform" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Content Title" columnKey="content_title" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Virality Benchmark" columnKey="views" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Views" columnKey="views" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Likes" columnKey="likes" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Comments" columnKey="comments" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Reach" columnKey="reach" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Published Date" columnKey="published_date" sortConfig={sortConfig} onSort={requestSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody key={currentPage} className="animate-fade-in">
              {paginatedContents && paginatedContents.length > 0 ? (
                paginatedContents.map((item) => {
                  const platMeta = platformIconMap[item.platform] || { icon: Share2, color: '#334155', bg: '#f1f5f9' };
                  const IconComp = platMeta.icon;

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>#{item.id}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          backgroundColor: platMeta.bg,
                          color: platMeta.color,
                          fontSize: '12px',
                          fontWeight: 800
                        }}>
                          <IconComp size={14} color={platMeta.color} />
                          <span>{item.platform}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', maxWidth: '320px' }}>
                        {item.content_title}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {getItemBadge(item)}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }}>
                        <FormattedNumber value={item.views || 0} />
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#059669' }}>
                        <FormattedNumber value={item.likes || 0} />
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>
                        <FormattedNumber value={item.comments || 0} />
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#7c3aed' }}>
                        <FormattedNumber value={item.reach || 0} />
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                        {item.published_date ? new Date(item.published_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button className="btn-small btn-edit" onClick={() => handleOpenEdit(item)} title="Edit Content Item">
                            <Edit2 size={13} /> Edit
                          </button>
                          <button className="btn-small btn-delete" onClick={() => onDelete(item.id)} title="Delete Content Item">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={Video}
                      title="No Content Items Found"
                      description="Add manual content entries or sync saved channels to populate your library analytics."
                      actionLabel="+ Create First Content Item"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sortedContents.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }}
        />
      </div>

      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingRecord}
      />

      <YouTubeSyncModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        onSync={onSyncYouTube}
      />
    </div>
  );
}
