'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { ArrowLeft, Palette, Link2, Copy, Check, Loader2, RefreshCw } from 'lucide-react';

interface Settings {
  name: string | null;
  brandName: string | null;
  brandColor: string;
  brandLogo: string | null;
  inviteSlug: string | null;
  inviteUrl: string | null;
}

const PRESET_COLORS = [
  '#FF6B6B', // Coral (default)
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Violet
  '#0891B2', // Cyan
  '#65A30D', // Lime
];

export default function CoachSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#FF6B6B');
  const [inviteSlug, setInviteSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/coach/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
      setBrandName(data.brandName || '');
      setBrandColor(data.brandColor || '#FF6B6B');
      setInviteSlug(data.inviteSlug || '');
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  function normalizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function validateSlug(slug: string): string | null {
    if (!slug) return null;
    const normalized = normalizeSlug(slug);
    if (normalized.length < 3) return 'Must be at least 3 characters';
    if (normalized.length > 30) return 'Must be 30 characters or less';
    return null;
  }

  async function handleSave() {
    const slugValidation = validateSlug(inviteSlug);
    if (inviteSlug && slugValidation) {
      setSlugError(slugValidation);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setSlugError(null);

    try {
      const res = await fetch('/api/coach/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName || null,
          brandColor,
          inviteSlug: inviteSlug || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await res.json();
      setSettings({ ...settings, ...data });
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function copyInviteUrl() {
    if (!settings?.inviteUrl) return;
    await navigator.clipboard.writeText(settings.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function regenerateInviteToken() {
    try {
      await fetch('/api/coach/public-invite', { method: 'DELETE' });
      await fetchSettings();
    } catch {
      setError('Failed to regenerate invite');
    }
  }

  const displayName = brandName || settings?.name || 'Your Brand';
  const previewInviteUrl = inviteSlug
    ? `baisics.app/join/${normalizeSlug(inviteSlug)}`
    : settings?.inviteUrl?.replace('https://', '') || 'baisics.app/join/...';

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .coach-settings {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      <div className="coach-settings min-h-screen bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/coach/dashboard"
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#64748B]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Coach Settings</h1>
              <p className="text-[#64748B] text-sm">Customize your coaching brand</p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Live Preview Card */}
          <div className="mb-8 p-6 bg-white rounded-xl border border-[#E2E8F0]">
            <h2 className="text-sm font-medium text-[#64748B] mb-4">Preview</h2>
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: `${brandColor}15`, borderLeft: `4px solid ${brandColor}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: brandColor }}
                >
                  {getInitials(displayName)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">{displayName}</h3>
                  <p className="text-sm text-[#64748B]">{previewInviteUrl}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Cards */}
          <div className="space-y-4">
            {/* Brand Name */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FFE5E5] rounded-lg">
                  <Palette className="w-5 h-5 text-[#FF6B6B]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Brand Name</h2>
                  <p className="text-sm text-[#64748B] mb-4">
                    What clients see as your coaching brand
                  </p>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder={settings?.name || 'My Coaching Brand'}
                    className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                  />
                </div>
              </div>
            </div>

            {/* Brand Color */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandColor}20` }}>
                  <Palette className="w-5 h-5" style={{ color: brandColor }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Brand Color</h2>
                  <p className="text-sm text-[#64748B] mb-4">
                    Accent color for your client experience
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBrandColor(color)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          brandColor === color
                            ? 'ring-2 ring-offset-2 ring-[#0F172A] scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
                        className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0"
                      />
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-dashed border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#94A3B8]"
                        style={
                          !PRESET_COLORS.includes(brandColor)
                            ? { backgroundColor: brandColor, border: 'none' }
                            : {}
                        }
                      >
                        {PRESET_COLORS.includes(brandColor) && '+'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">Hex:</span>
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#?[0-9A-Fa-f]{0,6}$/.test(val.replace('#', ''))) {
                          setBrandColor(val.startsWith('#') ? val.toUpperCase() : `#${val}`.toUpperCase());
                        }
                      }}
                      className="w-24 px-2 py-1 text-xs font-mono border border-[#E2E8F0] rounded focus:outline-none focus:border-[#FF6B6B]"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invite Link */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FFE5E5] rounded-lg">
                  <Link2 className="w-5 h-5 text-[#FF6B6B]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Custom Invite Link</h2>
                  <p className="text-sm text-[#64748B] mb-4">
                    Personalized URL like baisics.app/join/yourname
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#64748B]">baisics.app/join/</span>
                      <input
                        type="text"
                        value={inviteSlug}
                        onChange={(e) => {
                          setInviteSlug(e.target.value);
                          setSlugError(null);
                        }}
                        placeholder="yourname"
                        className={`flex-1 px-3 py-2 border rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                          slugError
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-[#E2E8F0] focus:border-[#FF6B6B]'
                        }`}
                      />
                    </div>
                    {slugError && (
                      <p className="mt-1 text-xs text-red-500">{slugError}</p>
                    )}
                    {inviteSlug && !slugError && (
                      <p className="mt-1 text-xs text-[#64748B]">
                        Will be: baisics.app/join/{normalizeSlug(inviteSlug)}
                      </p>
                    )}
                  </div>

                  {/* Current Invite URL */}
                  {settings?.inviteUrl && (
                    <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
                      <span className="flex-1 text-sm font-mono text-[#475569] truncate">
                        {settings.inviteUrl}
                      </span>
                      <button
                        onClick={copyInviteUrl}
                        className="p-2 hover:bg-white rounded transition-colors"
                        title="Copy link"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#64748B]" />
                        )}
                      </button>
                      {!settings.inviteSlug && (
                        <button
                          onClick={regenerateInviteToken}
                          className="p-2 hover:bg-white rounded transition-colors"
                          title="Regenerate link"
                        >
                          <RefreshCw className="w-4 h-4 text-[#64748B]" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/coach/dashboard"
              className="text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
