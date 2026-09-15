import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Users, Cpu, ShieldCheck, Flame, DollarSign, Briefcase, TrendingUp, PieChart, MessageSquare, ShieldAlert, Server, Copy, Check, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function AICopilotView({ user }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tools'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState([]);
  
  const chatBottomRef = useRef(null);
  const rawRole = (user?.role || 'creator').toLowerCase();
  const userRole = rawRole === 'admin' ? 'administrator' : rawRole === 'brand' ? 'marketing' : rawRole;

  const getDefaultToolForRole = (r) => {
    if (r === 'agency') return 'portfolio_analyzer';
    if (r === 'marketing') return 'roi_auditor';
    if (r === 'administrator') return 'security_diagnostic';
    return 'script_generator';
  };

  const [selectedTool, setSelectedTool] = useState(getDefaultToolForRole(userRole));
  const [toolFilter, setToolFilter] = useState('role_only'); // 'role_only' | 'all'
  const [toolParams, setToolParams] = useState({ topic: '', client_name: '', platform: 'YouTube Shorts' });
  const [toolResult, setToolResult] = useState(null);
  const [executingTool, setExecutingTool] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    setSelectedTool(getDefaultToolForRole(userRole));
    setQuickPrompts(getFallbackPromptsForRole(userRole));
    fetchQuickPrompts();
    // Welcome message
    const welcomeText = `Hello **${user?.full_name || 'CreatorIQ User'}**! I am your **CreatorIQ AI Copilot**, initialized with 100% awareness of your database, active role (**${userRole.toUpperCase()}**), and multi-platform analytics.

How can I help you optimize your content strategy, evaluate campaign ROI, or navigate the platform today?`;

    setMessages([{ id: 1, sender: 'ai', text: welcomeText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  }, [user, userRole]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getFallbackPromptsForRole = (r) => {
    if (r === 'agency') {
      return [
        { id: 1, title: 'Benchmark Agency Roster Reach', prompt: 'Analyze my agency multi-creator portfolio reach, view counts, and total client revenue potential.', tool: 'portfolio_analyzer', badge: 'AGENCY TOOL' },
        { id: 2, title: 'Create Brand Sponsorship Pitch Proposal', prompt: 'Generate a professional client sponsorship pitch deck summary for festive brand partners based on agency reach.', tool: 'pitch_builder', badge: 'PITCH DECK' },
        { id: 3, title: 'How to Manage Roster & Commission Splits?', prompt: 'Explain how agency commission percentages and roster syncing work in CreatorIQ.', tool: 'chat', badge: 'ROSTER MANAGEMENT' }
      ];
    } else if (r === 'marketing') {
      return [
        { id: 1, title: 'Audit Campaign ROI & Sponsor EMV', prompt: 'Evaluate campaign budget spending, Earned Media Value (EMV), and progress across active brand campaigns.', tool: 'roi_auditor', badge: 'CAMPAIGN ROI' },
        { id: 2, title: 'Audience Sentiment & Trending Topics', prompt: 'Summarize audience sentiment breakdown (positive, neutral, negative) and top viral topics for brand positioning.', tool: 'sentiment_summarizer', badge: 'SENTIMENT AUDIT' },
        { id: 3, title: 'Compare Platform Performance', prompt: 'Which platform yields highest engagement and reach for brand sponsorships between YouTube, Instagram, and X?', tool: 'chat', badge: 'BENCHMARKING' }
      ];
    } else if (r === 'administrator') {
      return [
        { id: 1, title: 'Run System Security & RBAC Audit', prompt: 'Inspect user role distributions, JWT security scopes, audit logs, and recommended security actions.', tool: 'security_diagnostic', badge: 'SYSTEM SECURITY' },
        { id: 2, title: 'Infrastructure & Service Health Check', prompt: 'Evaluate active service status for YouTube API, Instagram Scraper, PostgreSQL engine, and cache health.', tool: 'chat', badge: 'HEALTH CHECK' },
        { id: 3, title: 'How to Manage User Accounts & Roles?', prompt: 'Explain administrator authority for reassigning user access roles, creating profiles, and deleting accounts.', tool: 'chat', badge: 'USER MANAGEMENT' }
      ];
    } else {
      return [
        { id: 1, title: 'Generate Viral Video Script', prompt: 'Create a high-retention 60-second video script for my YouTube channel using trending hooks and strong call to action.', tool: 'script_generator', badge: 'VIRAL SCRIPT' },
        { id: 2, title: 'Analyze My Engagement & Monetization', prompt: 'Based on my channel metrics, how can I increase my sponsorship rate card and boost viewer retention?', tool: 'monetization_optimizer', badge: 'RATE CARD' },
        { id: 3, title: 'What are my Top Performing Posts?', prompt: 'Summarize my top performing videos across YouTube, Instagram, and X with recommendations to replicate success.', tool: 'chat', badge: 'TOP CONTENT' }
      ];
    }
  };

  const fetchQuickPrompts = async () => {
    try {
      const res = await api.getAIQuickPrompts(userRole);
      if (res && Array.isArray(res.prompts) && res.prompts.length > 0) {
        setQuickPrompts(res.prompts);
      } else {
        setQuickPrompts(getFallbackPromptsForRole(userRole));
      }
    } catch (e) {
      console.error('Error fetching quick prompts:', e);
      setQuickPrompts(getFallbackPromptsForRole(userRole));
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendAIChat(query);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.response || 'Sorry, I could not process your query right now.',
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Error connecting to AI Copilot: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTool = async () => {
    setExecutingTool(true);
    setToolResult(null);
    try {
      const res = await api.executeAITool(selectedTool, toolParams);
      setToolResult(res);
    } catch (err) {
      setToolResult({ error: err.message });
    } finally {
      setExecutingTool(false);
    }
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const renderTableBlock = (rows, key) => {
    if (!rows || rows.length === 0) return null;

    let headers = [];
    let dataRows = [];

    const isPipe = rows[0].includes('|');

    if (isPipe) {
      const cleanRows = rows
        .map(r => r.trim())
        .filter(r => r.length > 0 && !r.match(/^\|?[\s:\-\|]+\|?$/));

      if (cleanRows.length === 0) return null;

      headers = cleanRows[0]
        .split('|')
        .map(c => c.trim().replace(/\*\*/g, ''))
        .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));

      dataRows = cleanRows.slice(1).map(r => {
        const cells = r.split('|').map(c => c.trim());
        if (cells[0] === '') cells.shift();
        if (cells[cells.length - 1] === '') cells.pop();
        return cells;
      });
    } else {
      headers = rows[0].split('\t').map(c => c.trim().replace(/\*\*/g, ''));
      dataRows = rows.slice(1).map(r => r.split('\t').map(c => c.trim()));
    }

    if (headers.length === 0) return null;

    const isRosterTable = headers.some(h => {
      const l = h.toLowerCase();
      return l.includes('commission') || l.includes('roster') || l.includes('creator') || l.includes('handle') || l.includes('earned');
    });

    const headerTitle = isRosterTable
      ? "Managed Creator Roster & Revenue Splits"
      : "Realtime Campaign Performance Tracking";

    return (
      <div key={key} style={{
        margin: '16px 0',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Table Top Header Bar */}
        <div style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#e2e8f0' }}>
              {headerTitle}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
            {dataRows.length} Active Records
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} style={{
                    padding: '12px 14px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#475569',
                    whiteSpace: 'nowrap'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} style={{
                  borderBottom: rIdx === dataRows.length - 1 ? 'none' : '1px solid #f1f5f9',
                  backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3e8ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rIdx % 2 === 0 ? '#ffffff' : '#fafafa'}
                >
                  {row.map((cell, cIdx) => {
                    const cleanCell = cell.replace(/\*\*/g, '').trim();
                    const headerName = (headers[cIdx] || '').toLowerCase();
                    
                    // Render Status Pill
                    if (headerName.includes('status') || cleanCell.includes('Track') || cleanCell.includes('Exceeded') || cleanCell.includes('Progress') || cleanCell.includes('Near Goal') || cleanCell.includes('Syncing')) {
                      let bg = '#eff6ff';
                      let color = '#1d4ed8';
                      let border = '1px solid #bfdbfe';
                      let dotColor = '#3b82f6';

                      if (cleanCell.includes('Syncing') || cleanCell.includes('Active') || cleanCell.includes('Exceeded') || cleanCell.includes('Completed')) {
                        bg = '#ecfdf5'; color = '#047857'; border = '1px solid #a7f3d0'; dotColor = '#10b981';
                      } else if (cleanCell.includes('Track')) {
                        bg = '#e0f2fe'; color = '#0369a1'; border = '1px solid #bae6fd'; dotColor = '#0ea5e9';
                      } else if (cleanCell.includes('Near Goal')) {
                        bg = '#f0fdf4'; color = '#15803d'; border = '1px solid #bbf7d0'; dotColor = '#22c55e';
                      } else if (cleanCell.includes('Progress')) {
                        bg = '#fffbeb'; color = '#b45309'; border = '1px solid #fde68a'; dotColor = '#f59e0b';
                      }

                      return (
                        <td key={cIdx} style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: bg,
                            color: color,
                            border: border
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }}></span>
                            {cleanCell}
                          </span>
                        </td>
                      );
                    }

                    // Render Commission Rate / Split Pill
                    if (headerName.includes('commission') || cleanCell.includes('Split') || (cleanCell.includes('%') && headerName.includes('rate'))) {
                      return (
                        <td key={cIdx} style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#f3e8ff',
                            color: '#6b21a8',
                            border: '1px solid #d8b4fe',
                            fontWeight: 800,
                            fontSize: '12px'
                          }}>
                            {cleanCell}
                          </span>
                        </td>
                      );
                    }

                    // Render Goal Progress / Percentage Bar
                    if (headerName.includes('progress') || (cleanCell.includes('%') && cleanCell.length <= 8 && !headerName.includes('rate'))) {
                      const numMatch = cleanCell.match(/(\d+(\.\d+)?)/);
                      const pctVal = numMatch ? Math.min(100, parseFloat(numMatch[1])) : 0;
                      let barColor = pctVal >= 100 ? '#10b981' : pctVal >= 90 ? '#6366f1' : '#f59e0b';

                      return (
                        <td key={cIdx} style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '90px' }}>
                            <span style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>{cleanCell}</span>
                            <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{ width: `${pctVal}%`, height: '100%', backgroundColor: barColor, borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Render Currency / Revenue / EMV / Earned Highlight
                    if (headerName.includes('revenue') || headerName.includes('earned') || headerName.includes('spent') || headerName.includes('budget') || headerName.includes('emv') || headerName.includes('value') || cleanCell.includes('₹') || cleanCell.includes('Cr') || cleanCell.includes('Lakh') || cleanCell.includes('K')) {
                      const isAgencyEarned = headerName.includes('earned');
                      return (
                        <td key={cIdx} style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: isAgencyEarned ? '#f0fdf4' : '#faf5ff',
                            color: isAgencyEarned ? '#15803d' : '#4c1d95',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            border: isAgencyEarned ? '1px solid #bbf7d0' : '1px solid #e9d5ff'
                          }}>
                            {cleanCell}
                          </span>
                        </td>
                      );
                    }

                    // Render Creator Name / Handle & Platform Column
                    if (cIdx === 0 || headerName.includes('creator') || headerName.includes('handle') || headerName.includes('name')) {
                      return (
                        <td key={cIdx} style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                            {cleanCell}
                          </div>
                        </td>
                      );
                    }

                    // Default cell
                    return (
                      <td key={cIdx} style={{ padding: '12px 14px', verticalAlign: 'middle', color: '#334155' }}>
                        {parseBoldText(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSimpleMarkdown = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      const isPipeTable = line.trim().startsWith('|') && line.trim().endsWith('|');
      const isTabTable = !line.trim().startsWith('|') && line.includes('\t') && line.split('\t').length >= 3;

      if (isPipeTable || isTabTable) {
        const tableLines = [];
        while (i < lines.length) {
          const cur = lines[i].trim();
          if (isPipeTable && cur.startsWith('|')) {
            tableLines.push(cur);
            i++;
          } else if (isTabTable && (cur.includes('\t') || cur.startsWith('Campaign Name'))) {
            tableLines.push(cur);
            i++;
          } else {
            break;
          }
        }
        elements.push(renderTableBlock(tableLines, `table-${i}`));
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '14px 0 6px 0' }}>{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={i} style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1', margin: '10px 0 4px 0' }}>{line.replace('#### ', '')}</h4>);
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '12px', color: '#475569', fontStyle: 'italic', margin: '8px 0', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '0 8px 8px 0' }}>
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} style={{ marginLeft: '18px', margin: '3px 0', color: '#334155', fontSize: '13.5px' }}>
            {parseBoldText(line.substring(2))}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />);
      } else if (line.trim().length > 0) {
        elements.push(<p key={i} style={{ margin: '4px 0', fontSize: '13.5px', lineHeight: '1.5', color: '#1e293b' }}>{parseBoldText(line)}</p>);
      }
      i++;
    }
    return elements;
  };

  const parseBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ fontWeight: 800, color: '#0f172a' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} style={{ backgroundColor: '#f1f5f9', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="section-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311b92 100%)', color: '#ffffff', border: 'none', boxShadow: '0 12px 30px rgba(49, 27, 146, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(167, 139, 250, 0.2)', display: 'flex', alignItems: 'center' }}>
                <Sparkles size={28} color="#c084fc" />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
                  CreatorIQ AI Copilot & Knowledge Studio
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 800, backgroundColor: '#10b981', color: '#064e3b', textTransform: 'uppercase' }}>
                    Engine Online (Zero Latency)
                  </span>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                    Active Role Scope: <strong style={{ color: '#e9d5ff' }}>{userRole.toUpperCase()}</strong>
                  </span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px', fontWeight: 500, maxWidth: '750px' }}>
              Ask any question about your analytics, top content, agency roster, or campaign ROI. The AI Copilot possesses full live database context across all 5 platforms.
            </p>
          </div>

          {/* Mode Tabs Switcher */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'chat' ? '#ffffff' : 'transparent',
                color: activeTab === 'chat' ? '#311b92' : '#ffffff',
                transition: 'all 0.15s ease'
              }}
            >
              Conversational Chat AI
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'tools' ? '#ffffff' : 'transparent',
                color: activeTab === 'tools' ? '#311b92' : '#ffffff',
                transition: 'all 0.15s ease'
              }}
            >
              Role Specialist Studio
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Quick Action Prompts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {quickPrompts.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              if (p.tool === 'chat' || activeTab === 'chat') {
                handleSendMessage(p.prompt);
              } else {
                setActiveTab('tools');
                setSelectedTool(p.tool);
              }
            }}
            className="section-card"
            style={{
              padding: '16px',
              cursor: 'pointer',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{p.title}</span>
                <Sparkles size={14} color="#8b5cf6" />
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.prompt}
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#7c3aed', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Trigger Action ➔
            </span>
          </div>
        ))}
      </div>

      {/* Main Mode View */}
      {activeTab === 'chat' ? (
        /* CONVERSATIONAL CHAT WORKSPACE */
        <div className="section-card" style={{ padding: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          
          {/* Chat Messages Body */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc' }}>
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {msg.sender === 'ai' && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)',
                    flexShrink: 0
                  }}>
                    <Bot size={18} />
                  </div>
                )}

                <div style={{
                  backgroundColor: msg.sender === 'user' ? '#0f172a' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                  padding: '14px 18px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(15, 23, 42, 0.2)' : '0 2px 10px rgba(0,0,0,0.05)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  position: 'relative'
                }}>
                  {msg.sender === 'ai' ? (
                    <div>
                      {msg.source && (
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>
                          ⚡ {msg.source}
                        </div>
                      )}
                      <div>{renderSimpleMarkdown(msg.text)}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopyText(msg.text, idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedIdx === idx ? '#16a34a' : '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}
                        >
                          {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                          {copiedIdx === idx ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</p>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', display: 'block', textAlign: 'right' }}>{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Sparkles size={18} className="spin" />
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                  Analyzing database metrics and generating response...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <div style={{ padding: '16px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ask anything about CreatorIQ, your videos, revenue, roles, or strategy..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              style={{
                backgroundColor: loading || !inputMessage.trim() ? '#cbd5e1' : '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: loading || !inputMessage.trim() ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.4)'
              }}
            >
              <span>Send</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* ROLE SPECIALIST AI STUDIO */
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          
          {/* Tool Picker Panel */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                Role AI Tools
              </h3>
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                <button
                  onClick={() => setToolFilter('role_only')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: toolFilter === 'role_only' ? '#7c3aed' : 'transparent',
                    color: toolFilter === 'role_only' ? '#ffffff' : '#64748b'
                  }}
                >
                  {userRole.toUpperCase()}
                </button>
                <button
                  onClick={() => setToolFilter('all')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: toolFilter === 'all' ? '#7c3aed' : 'transparent',
                    color: toolFilter === 'all' ? '#ffffff' : '#64748b'
                  }}
                >
                  ALL
                </button>
              </div>
            </div>

            {[
              { id: 'portfolio_analyzer', title: 'Agency Roster Audit', desc: 'Roster Reach & Commissions', role: 'agency', icon: Users },
              { id: 'pitch_builder', title: 'Sponsorship Pitch Deck', desc: 'Brand Proposal Generator', role: 'agency', icon: Briefcase },
              { id: 'script_generator', title: 'Viral Script Generator', desc: 'Hooks, 60s script & CTA', role: 'creator', icon: Sparkles },
              { id: 'monetization_optimizer', title: 'Rate Card Calculator', desc: 'CPM & Sponsorship Pricing', role: 'creator', icon: DollarSign },
              { id: 'roi_auditor', title: 'Campaign ROI & EMV', desc: 'Sponsor Return Benchmarking', role: 'marketing', icon: PieChart },
              { id: 'sentiment_summarizer', title: 'Audience Sentiment', desc: 'Viral Topics & Feedback', role: 'marketing', icon: MessageSquare },
              { id: 'security_diagnostic', title: 'Security & RBAC Audit', desc: 'Scope & Audit Log Check', role: 'administrator', icon: ShieldAlert }
            ]
            .filter(t => toolFilter === 'all' || t.role === userRole)
            .map((t) => {
              const IconComp = t.icon;
              const isSelected = selectedTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTool(t.id); setToolResult(null); }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#7c3aed' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComp size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: isSelected ? '#5b21b6' : '#0f172a' }}>{t.title}</div>
                      <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: isSelected ? '#ddd6fe' : '#f1f5f9', color: isSelected ? '#5b21b6' : '#64748b', textTransform: 'uppercase' }}>
                        {t.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tool Result Workspace */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  AI Tool Studio Workspace
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Tool Selected: <strong>{selectedTool.replace('_', ' ').toUpperCase()}</strong>
                </span>
              </div>

              <button
                onClick={handleExecuteTool}
                disabled={executingTool}
                className="btn-primary"
                style={{ backgroundColor: '#7c3aed', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={executingTool ? 'spin' : ''} />
                <span>{executingTool ? 'Generating...' : 'Execute AI Tool'}</span>
              </button>
            </div>

            {/* Parameter Input Fields */}
            {selectedTool === 'script_generator' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Topic / Product Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 17 Pro Max Camera vs DSLR"
                    value={toolParams.topic}
                    onChange={(e) => setToolParams({ ...toolParams, topic: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Target Platform</label>
                  <select
                    value={toolParams.platform}
                    onChange={(e) => setToolParams({ ...toolParams, platform: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700 }}
                  >
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="Dedicated Video">Dedicated YouTube Video (8-12m)</option>
                  </select>
                </div>
              </div>
            )}

            {selectedTool === 'pitch_builder' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Sponsor / Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Think Music & Cinema / Tech Sponsor"
                  value={toolParams.client_name}
                  onChange={(e) => setToolParams({ ...toolParams, client_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            )}

            {/* Output Container */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              minHeight: '300px',
              position: 'relative'
            }}>
              {executingTool ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <Sparkles size={32} className="spin" color="#7c3aed" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Generating AI Result...</h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Querying live PostgreSQL analytics and compiling recommendations...</p>
                </div>
              ) : toolResult ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', pb: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                      ⚡ AI Output Generated
                    </span>
                    <button
                      onClick={() => handleCopyText(toolResult.result, 'tool')}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedIdx === 'tool' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      {copiedIdx === 'tool' ? 'Copied' : 'Copy Output'}
                    </button>
                  </div>
                  {renderSimpleMarkdown(toolResult.result || toolResult.error)}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <Cpu size={36} color="#cbd5e1" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#64748b' }}>Ready to Execute AI Specialist Tool</h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '400px', margin: '4px auto 0 auto' }}>
                    Click "Execute AI Tool" above to generate scripts, rate cards, pitch decks, or security reports.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
