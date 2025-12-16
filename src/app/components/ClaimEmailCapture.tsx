'use client';

import { useState } from 'react';
import { ArrowRight, Mail, CheckCircle } from 'lucide-react';

interface ClaimEmailCaptureProps {
  source: string;
  toolData?: Record<string, unknown>;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  variant?: 'card' | 'inline';
}

export default function ClaimEmailCapture({
  source,
  toolData,
  headline = "Save your results",
  subheadline = "Get a personalized program based on your calculations.",
  ctaText = "Claim Program",
  variant = 'card',
}: ClaimEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          toolData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send');
      }

      setIsSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`${variant === 'card' ? 'bg-[#FFE5E5] rounded-2xl p-6 lg:p-8 border-2 border-[#FF6B6B]' : ''}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#FF6B6B] rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-2">
            Check your email
          </h3>
          <p className="text-[#475569]">
            We sent a magic link to <strong>{email}</strong>. Click it to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#F1F5F9] focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 font-semibold text-white bg-[#FF6B6B] rounded-lg hover:bg-[#EF5350] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    );
  }

  return (
    <div className="bg-[#FFE5E5] rounded-2xl p-6 lg:p-8 border-2 border-[#FF6B6B]">
      <h3 className="text-xl font-bold text-[#0F172A] mb-2">
        {headline}
      </h3>
      <p className="text-[#475569] mb-6">
        {subheadline}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-4 py-3 rounded-lg border border-[#FF6B6B]/30 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none transition-all"
        />
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 text-lg font-bold text-white bg-[#FF6B6B] rounded-xl hover:bg-[#EF5350] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>{ctaText}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#94A3B8]">
        No password needed. We&apos;ll send you a secure link.
      </p>
    </div>
  );
}
