import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, MapPin, Smartphone, Users, Clock, PieChart, ShieldCheck } from 'lucide-react';
import AudienceModal from '../components/AudienceModal';
import StatCard from '../components/StatCard';
import SentimentCard from '../components/SentimentCard';
import EmptyState from '../components/EmptyState';
import { useSortableData, SortHeader } from '../utils/useSortableData';
import { formatNumber, rawNumber, FormattedNumber } from '../utils/format';
import Pagination from '../components/Pagination';

export default function AudienceView({ records, report, onAdd, onUpdate, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { items: sortedRecords, requestSort, sortConfig } = useSortableData(records || [], { key: 'followers', direction: 'desc' });
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);


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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Report Cards */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
        <StatCard
          title="Total Audience Followers"
          value={report?.total_followers || 0}
          subtitle="Total Connected Audience"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Organic Reach"
          value={report?.total_reach || 0}
          subtitle="Omnichannel Impressions"
          icon={Globe}
          color="emerald"
        />
        <StatCard
          title="Total Impressions"
          value={report?.total_impressions || 0}
          subtitle="Audience Views Trajectory"
          icon={PieChart}
          color="purple"
        />
      </div>

      {/* Demographic Highlights & Peak Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="chart-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '12px', color: '#4f46e5', flexShrink: 0 }}>
            <Globe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Top Country</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{report?.top_country || 'India'}</div>
          </div>
        </div>

        <div className="chart-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '12px', background: '#d1fae5', borderRadius: '12px', color: '#059669', flexShrink: 0 }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Top City</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{report?.top_city || 'Hyderabad'}</div>
          </div>
        </div>

        <div className="chart-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '12px', background: '#ffe4e6', borderRadius: '12px', color: '#f43f5e', flexShrink: 0 }}>
            <Smartphone size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Top Device</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{report?.top_device || 'Mobile'}</div>
          </div>
        </div>
      </div>

      {/* Peak Activity Hours & Loyalty Intelligence Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Active Hours Breakdown */}
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#2563eb" />
              <span>Subscriber Peak Online Hours</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { time: '18:00 - 21:00 HRS (Evening)', pct: 88, status: 'Peak Online Window' },
              { time: '12:00 - 15:00 HRS (Afternoon)', pct: 64, status: 'High Engagement' },
              { time: '21:00 - 00:00 HRS (Night)', pct: 52, status: 'Moderate Traffic' },
              { time: '09:00 - 12:00 HRS (Morning)', pct: 38, status: 'Standard Traffic' },
            ].map((slot, idx) => (
              <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{slot.time}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: slot.pct > 70 ? '#059669' : '#2563eb' }}>{slot.status}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${slot.pct}%`, height: '100%', backgroundColor: slot.pct > 70 ? '#059669' : '#2563eb', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender & Audience Loyalty Breakdown */}
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} color="#7c3aed" />
              <span>Audience Composition & Loyalty</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>Returning Viewers vs New</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>78.4% Loyal</span>
              </div>
              <div style={{ fontSize: '11px', color: '#3b82f6' }}>High audience retention rate across content releases</div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Core Demographics (18-34 Age Group)</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>82.1% Segment Share</span>
              </div>
              <div style={{ fontSize: '11px', color: '#15803d' }}>Prime purchasing power demographic profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Sentiment & Comment Keyword Analyzer */}
      <SentimentCard sentimentData={report?.sentiment} />

      {/* Audience Data Table with Interactive Column Sorting */}
      <div className="table-container" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="table-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 className="chart-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Audience Demographic Records</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Click column headers to sort by Followers, Reach, Active Hour, or Demographics
            </p>
          </div>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Audience Record</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Gender" columnKey="gender" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Age Group" columnKey="age_group" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Country / City" columnKey="country" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Device" columnKey="device_type" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Active Hour" columnKey="active_hour" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Followers" columnKey="followers" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Reach" columnKey="reach" sortConfig={sortConfig} onSort={requestSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody key={currentPage} className="animate-fade-in">
              {paginatedRecords && paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}><strong>#{rec.id}</strong></td>
                    <td style={{ padding: '14px 18px' }}>{rec.gender || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.age_group || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.country}, {rec.city}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.device_type}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.active_hour}:00 HRS</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}><FormattedNumber value={rec.followers} /></td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}><FormattedNumber value={rec.reach} /></td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn-small btn-edit" onClick={() => handleOpenEdit(rec)} title="Edit">
                          <Edit2 size={13} /> Edit
                        </button>
                        <button className="btn-small btn-delete" onClick={() => onDelete(rec.id)} title="Delete">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={Users}
                      title="No Audience Records Found"
                      description="Create demographic entries to track device usage, age groups, and geographical reach."
                      actionLabel="+ Add First Audience Record"
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
          totalItems={sortedRecords.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }}
        />
      </div>


      <AudienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingRecord}
      />
    </div>
  );
}
