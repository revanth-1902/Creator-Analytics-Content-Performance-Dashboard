import React, { useState, useEffect } from 'react';
import { Flame, ExternalLink, Eye, ThumbsUp, MessageSquare, Calendar, Filter, Search, LayoutGrid, List, Sparkles } from 'lucide-react';
import { YoutubeIcon } from '../components/PlatformIcons';
import { api } from '../api';
import { FormattedNumber } from '../utils/format';

export default function TrendingView() {
  const [timeframe, setTimeframe] = useState('today'); // 'today', '7_days', '30_days'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, [timeframe, selectedCategory]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await api.getTrendingYouTubeVideos(timeframe, selectedCategory);
      if (res && Array.isArray(res.videos)) {
        setVideos(res.videos);
      }
    } catch (err) {
      console.error('Error fetching trending YouTube videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.title || '').toLowerCase().includes(q) ||
      (v.channel_title || '').toLowerCase().includes(q) ||
      (v.channel_handle || '').toLowerCase().includes(q) ||
      (v.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="section-card" style={{ background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%)', color: '#ffffff', border: 'none', boxShadow: '0 12px 30px rgba(220, 38, 38, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame size={30} color="#fef08a" />
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
                YouTube Trending & Viral Content Explorer
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#fecaca', marginTop: '6px', fontWeight: 500 }}>
              Analyze top viral videos across <strong>Today</strong>, <strong>Past 7 Days (Last Week)</strong>, and <strong>Past 30 Days (1 Month)</strong> with live engagement metrics, views, likes, comments, and direct YouTube playback links.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#991b1b' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LayoutGrid size={15} /> Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#991b1b' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <List size={15} /> Table View
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Timeframe & Category Filters */}
      <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Timeframe Selector Tabs */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            {[
              { key: 'today', label: 'Trending Today (Realtime)' },
              { key: '7_days', label: 'Past 7 Days (Last Week)' },
              { key: '30_days', label: 'Past 30 Days (1 Month)' }
            ].map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  backgroundColor: timeframe === tf.key ? '#dc2626' : 'transparent',
                  color: timeframe === tf.key ? '#ffffff' : '#64748b',
                  boxShadow: timeframe === tf.key ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search trending titles, channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Filter size={12} /> Category:
          </span>
          {[
            { key: 'all', label: 'All Categories' },
            { key: 'music', label: 'Music & OST' },
            { key: 'entertainment', label: 'Cinema & Trailers' },
            { key: 'news', label: 'News & Politics' },
            { key: 'gaming', label: 'Gaming & Esports' },
            { key: 'tech', label: 'Tech & Gadgets' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat.key ? '#0f172a' : '#f1f5f9',
                color: selectedCategory === cat.key ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <Flame size={32} className="spin" color="#dc2626" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Fetching Live YouTube Trending Data...</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Gathering view counts, likes, comments, and video metrics for {timeframe.replace('_', ' ')}...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>No Trending Videos Found</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Try switching timeframe or choosing 'All Categories'.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredVideos.map((video, idx) => (
            <div
              key={video.id + idx}
              className="section-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
              }}
            >
              {/* Thumbnail Container */}
              <div
                style={{ position: 'relative', cursor: 'pointer', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#0f172a' }}
                onClick={() => window.open(video.youtube_url, '_blank')}
                title="Click thumbnail to watch on YouTube"
              >
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`; }}
                />

                {/* Overlay Play Badge */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(220, 38, 38, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.5)'
                  }}>
                    <YoutubeIcon size={18} color="#ffffff" />
                  </div>
                </div>

                {/* Trending Rank Badge */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}>
                  #{idx + 1} Trending
                </div>

                {/* Relative Date Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backdropFilter: 'blur(4px)'
                }}>
                  {video.published_display}
                </div>
              </div>

              {/* Card Details */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {video.category}
                  </span>
                  <h4
                    onClick={() => window.open(video.youtube_url, '_blank')}
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '4px 0 0 0',
                      cursor: 'pointer',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4'
                    }}
                  >
                    {video.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginTop: '4px' }}>
                    {video.channel_title} <span style={{ color: '#94a3b8' }}>({video.channel_handle})</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Eye size={12} color="#0284c7" /> Views
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      <FormattedNumber value={video.views} />
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ThumbsUp size={12} color="#16a34a" /> Likes
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      <FormattedNumber value={video.likes} />
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MessageSquare size={12} color="#8b5cf6" /> Comments
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      <FormattedNumber value={video.comments} />
                    </span>
                  </div>
                </div>

                {/* Watch Button */}
                <button
                  onClick={() => window.open(video.youtube_url, '_blank')}
                  className="btn-primary"
                  style={{
                    marginTop: 'auto',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <YoutubeIcon size={16} color="#ffffff" /> Watch Video on YouTube <ExternalLink size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="section-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank & Thumbnail</th>
                  <th>Video Title & Creator</th>
                  <th>Category</th>
                  <th>Total Views</th>
                  <th>Total Likes</th>
                  <th>Total Comments</th>
                  <th>Engagement</th>
                  <th>YouTube Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video, idx) => (
                  <tr key={video.id + idx}>
                    <td style={{ fontWeight: 800 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: 800 }}>#{idx + 1}</span>
                        <div
                          style={{ position: 'relative', width: '90px', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#0f172a' }}
                          onClick={() => window.open(video.youtube_url, '_blank')}
                        >
                          <img src={video.thumbnail_url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', maxWidth: '300px' }}>
                        <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          {video.title}
                        </a>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {video.channel_title} ({video.channel_handle})
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 800, backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        {video.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>
                      <FormattedNumber value={video.views} />
                    </td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>
                      <FormattedNumber value={video.likes} />
                    </td>
                    <td style={{ color: '#8b5cf6', fontWeight: 700 }}>
                      <FormattedNumber value={video.comments} />
                    </td>
                    <td style={{ fontWeight: 800, color: '#0284c7' }}>
                      {video.engagement_rate}%
                    </td>
                    <td>
                      <button
                        onClick={() => window.open(video.youtube_url, '_blank')}
                        style={{
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <YoutubeIcon size={13} color="#ffffff" /> Watch <ExternalLink size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
