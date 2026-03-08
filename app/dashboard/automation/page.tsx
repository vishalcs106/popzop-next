'use client';

import { useState } from 'react';
import { useMerchant } from '@/hooks/useMerchant';
import { Automation } from '@/types';
import {
  Zap, Plus, Link2, MessageCircle, TrendingUp, Send,
  Pause, Play, Trash2, ExternalLink, X, Hash,
  Instagram, AtSign, CheckCircle2, AlertCircle, Sparkles,
} from 'lucide-react';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED: Automation[] = [
  {
    id: '1',
    merchantId: '',
    postUrl: 'https://www.instagram.com/reel/ABC123xyz/',
    postType: 'reel',
    keyword: 'LINK',
    replyLink: 'https://popzop.bio/yourbrand/product/summer-dress',
    replyMessage: "Hey! Here's the link you asked for 👉 {link}",
    isLive: true,
    stats: { comments: 142, dmsSent: 138, conversions: 23 },
    createdAt: new Date('2024-11-01'),
  },
  {
    id: '2',
    merchantId: '',
    postUrl: 'https://www.instagram.com/p/XYZ789abc/',
    postType: 'post',
    keyword: 'BUY',
    replyLink: 'https://popzop.bio/yourbrand/product/floral-kurti',
    replyMessage: "Hey! Here's the link you asked for 👉 {link}",
    isLive: false,
    stats: { comments: 67, dmsSent: 64, conversions: 11 },
    createdAt: new Date('2024-10-20'),
  },
];

// ─── Instagram not connected banner ───────────────────────────────────────────
function ConnectBanner({ onConnect }: { onConnect: () => void }) {
  return (
    <div
      className="rounded-3xl p-6 md:p-8 border flex flex-col items-center gap-5 mb-8 text-center md:flex-row md:text-left"
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.06) 100%)',
        borderColor: 'rgba(168,85,247,0.2)',
      }}
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
        <AtSign size={26} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">Connect your Instagram account</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto md:mx-0">
          Link your Instagram to enable comment-to-DM automation. When a follower comments your keyword, they instantly receive your product link.
        </p>
      </div>
      <button
        onClick={onConnect}
        className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl text-white transition-all active:scale-[0.97] shadow-lg"
        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
      >
        <AtSign size={16} />
        Connect Instagram
      </button>
    </div>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number | string; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <p className="text-xs md:text-sm text-gray-500 leading-tight pr-1">{label}</p>
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}

// ─── Automation card ──────────────────────────────────────────────────────────
function AutomationCard({
  automation,
  onToggle,
  onDelete,
}: {
  automation: Automation;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const postId = automation.postUrl.split('/').filter(Boolean).pop() ?? '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 transition-all hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-start gap-3">
        {/* Post type icon */}
        <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center mt-0.5"
          style={{
            background: automation.postType === 'reel'
              ? 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(236,72,153,0.1))'
              : 'rgba(59,130,246,0.1)',
          }}>
          {automation.postType === 'reel'
            ? <Zap size={15} style={{ color: '#a855f7' }} />
            : <AtSign size={15} style={{ color: '#3b82f6' }} />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: type + postId + status badge + actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 shrink-0">
                {automation.postType}
              </span>
              <span className="text-gray-200 shrink-0">·</span>
              <a
                href={automation.postUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-violet-600 hover:underline flex items-center gap-1 font-medium truncate"
              >
                {postId}
                <ExternalLink size={10} className="shrink-0" />
              </a>
            </div>

            {/* Status + actions (top-right) */}
            <div className="shrink-0 flex items-center gap-1.5">
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                automation.isLive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {automation.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                )}
                {automation.isLive ? 'Live' : 'Paused'}
              </div>
              <button
                onClick={() => onToggle(automation.id)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title={automation.isLive ? 'Pause' : 'Resume'}
              >
                {automation.isLive
                  ? <Pause size={13} className="text-gray-400" />
                  : <Play size={13} className="text-violet-500" />}
              </button>
              <button
                onClick={() => onDelete(automation.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
              </button>
            </div>
          </div>

          {/* Keyword + link */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-900 text-white shrink-0">
              <Hash size={10} /> {automation.keyword}
            </span>
            <span className="text-gray-300 text-xs shrink-0">→</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 min-w-0 max-w-full truncate">
              <Link2 size={10} className="shrink-0" />
              <span className="truncate">{automation.replyLink.replace('https://', '')}</span>
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 md:gap-4">
            {[
              { icon: MessageCircle, value: automation.stats.comments, label: 'comments', color: '#6366f1' },
              { icon: Send, value: automation.stats.dmsSent, label: 'DMs', color: '#8b5cf6' },
              { icon: TrendingUp, value: automation.stats.conversions, label: 'conversions', color: '#10b981' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <s.icon size={11} style={{ color: s.color }} />
                <span className="text-sm font-bold text-gray-900">{s.value}</span>
                <span className="text-xs text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create automation form ───────────────────────────────────────────────────
function CreateForm({
  merchantHandle,
  onCreate,
  onCancel,
}: {
  merchantHandle: string;
  onCreate: (a: Automation) => void;
  onCancel: () => void;
}) {
  const [postUrl, setPostUrl] = useState('');
  const [postType, setPostType] = useState<'reel' | 'post'>('reel');
  const [keyword, setKeyword] = useState('LINK');
  const [link, setLink] = useState(`https://popzop.bio/${merchantHandle}`);
  const [goLive, setGoLive] = useState(true);

  const previewMsg = `Hey! Here's the link you asked for 👉 ${link || '{link}'}`;
  const isValid = postUrl.trim() && keyword.trim() && link.trim();

  function handleCreate() {
    if (!isValid) return;
    onCreate({
      id: Date.now().toString(),
      merchantId: '',
      postUrl: postUrl.trim(),
      postType,
      keyword: keyword.trim().toUpperCase(),
      replyLink: link.trim(),
      replyMessage: `Hey! Here's the link you asked for 👉 {link}`,
      isLive: goLive,
      stats: { comments: 0, dmsSent: 0, conversions: 0 },
      createdAt: new Date(),
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <Zap size={14} className="text-violet-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">New automation</h3>
        </div>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-5">
        {/* Step 1: Post URL + type */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            1 · Instagram reel or post
          </label>
          <div className="flex gap-2 mb-2">
            {(['reel', 'post'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPostType(t)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={{
                  background: postType === t ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'transparent',
                  color: postType === t ? 'white' : '#6b7280',
                  border: postType === t ? 'none' : '1px solid #e5e7eb',
                }}
              >
                {t === 'reel' ? '🎬 Reel' : '🖼️ Post'}
              </button>
            ))}
          </div>
          <input
            value={postUrl}
            onChange={e => setPostUrl(e.target.value)}
            placeholder={`https://www.instagram.com/${postType === 'reel' ? 'reel' : 'p'}/...`}
            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all"
          />
        </div>

        {/* Step 2: Keyword */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            2 · Trigger keyword
          </label>
          <p className="text-xs text-gray-400 mb-2">When someone comments this word, they get the DM.</p>
          <div className="relative">
            <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value.toUpperCase())}
              placeholder="e.g. LINK, BUY, PRICE"
              className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-4 text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all uppercase"
            />
          </div>
          {/* Keyword suggestions */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {['LINK', 'BUY', 'SHOP', 'PRICE'].map((kw) => (
              <button
                key={kw}
                onClick={() => setKeyword(kw)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                style={{
                  background: keyword === kw ? '#111827' : '#f3f4f6',
                  color: keyword === kw ? 'white' : '#6b7280',
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Product link */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            3 · Link to send in DM
          </label>
          <div className="relative">
            <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://popzop.bio/yourshop/..."
              className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all"
            />
          </div>
        </div>

        {/* Step 4: DM preview */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#f8f9ff', border: '1px solid #e0e7ff' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-violet-500" />
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">DM preview</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }} />
            <div className="flex-1 bg-white rounded-xl rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100 min-w-0">
              <p className="text-xs text-gray-700 leading-relaxed wrap-break-word">{previewMsg}</p>
            </div>
          </div>
        </div>

        {/* Step 5: Go live toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-semibold text-gray-900">Go live immediately</p>
            <p className="text-xs text-gray-400 mt-0.5">Start responding to comments right away</p>
          </div>
          <button
            onClick={() => setGoLive(v => !v)}
            className="relative w-12 h-6 rounded-full transition-all shrink-0"
            style={{ background: goLive ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : '#e5e7eb' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
              style={{ left: goLive ? '26px' : '2px' }}
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <button onClick={onCancel} className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors text-center sm:text-left">
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!isValid}
          className="flex items-center justify-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
        >
          <Zap size={15} />
          {goLive ? 'Create & Go Live' : 'Create (Paused)'}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AutomationPage() {
  const { merchant } = useMerchant();
  const [isConnected, setIsConnected] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>(SEED);
  const [showForm, setShowForm] = useState(false);

  const totalComments = automations.reduce((s, a) => s + a.stats.comments, 0);
  const totalDms = automations.reduce((s, a) => s + a.stats.dmsSent, 0);
  const totalConversions = automations.reduce((s, a) => s + a.stats.conversions, 0);
  const liveCount = automations.filter(a => a.isLive).length;

  function toggleAutomation(id: string) {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, isLive: !a.isLive } : a));
  }

  function deleteAutomation(id: string) {
    setAutomations(prev => prev.filter(a => a.id !== id));
  }

  function createAutomation(a: Automation) {
    setAutomations(prev => [a, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-4xl pb-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-violet-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Automation</h1>
            {liveCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {liveCount} live
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 pl-10">
            Comment triggers → instant DMs with your product links
          </p>
        </div>
        {isConnected && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 flex items-center gap-2 text-sm font-bold px-3 sm:px-5 py-2.5 rounded-xl text-white transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New automation</span>
          </button>
        )}
      </div>

      {/* Connect Instagram */}
      {!isConnected && (
        <ConnectBanner onConnect={() => setIsConnected(true)} />
      )}

      {/* Connected indicator */}
      {isConnected && (
        <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-6">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
            <AtSign size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">@{merchant?.handle ?? 'youraccount'}</p>
            <p className="text-xs text-gray-400">Instagram connected</p>
          </div>
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
        </div>
      )}

      {/* Stats overview */}
      {isConnected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard label="Comments" value={totalComments} icon={MessageCircle} color="#7c3aed" bg="#f3f0ff" />
          <StatCard label="DMs sent" value={totalDms} icon={Send} color="#8b5cf6" bg="#ede9fe" />
          <StatCard label="Conversions" value={totalConversions} icon={TrendingUp} color="#10b981" bg="#d1fae5" />
          <StatCard label="Active rules" value={liveCount} icon={Zap} color="#f59e0b" bg="#fef3c7" />
        </div>
      )}

      {/* Create form */}
      {isConnected && showForm && (
        <CreateForm
          merchantHandle={merchant?.handle ?? 'yourbrand'}
          onCreate={createAutomation}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Automations list */}
      {isConnected && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Your automations
              <span className="ml-2 text-xs font-normal text-gray-400">({automations.length})</span>
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
              >
                <Plus size={13} /> Add new
              </button>
            )}
          </div>

          {automations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                <Zap size={22} className="text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">No automations yet</p>
              <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">Create your first automation to start converting comments into sales.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
              >
                <Plus size={15} /> Create automation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map(a => (
                <AutomationCard
                  key={a.id}
                  automation={a}
                  onToggle={toggleAutomation}
                  onDelete={deleteAutomation}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Not connected empty state */}
      {!isConnected && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="flex justify-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <MessageCircle size={18} className="text-gray-400" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Send size={18} className="text-gray-400" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-gray-400" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Connect Instagram to get started</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Once connected, you can turn any reel or post into an automated sales machine using comment triggers.
          </p>
        </div>
      )}
    </div>
  );
}
