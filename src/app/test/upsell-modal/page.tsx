'use client';

import { useState } from 'react';
import { VariantA, VariantB, VariantC } from './variants';

type Variant = 'A' | 'B' | 'C';

const variantInfo: Record<Variant, { name: string; description: string; focus: string }> = {
  A: {
    name: 'Variant A: Preview',
    description: 'Blurred program preview, "what you\'re getting" chips, navy header',
    focus: 'Show the product, create desire',
  },
  B: {
    name: 'Variant B: Benefits',
    description: 'Clear value list with icons, white background, clean layout',
    focus: 'Communicate value honestly',
  },
  C: {
    name: 'Variant C: Minimal',
    description: 'Single CTA, minimal copy, success state, Pro as subtle link',
    focus: 'Reduce friction & decision paralysis',
  },
};

export default function TestUpsellModalPage() {
  const [activeVariant, setActiveVariant] = useState<Variant>('A');
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">UpsellModal A/B Test Page</h1>
          <p className="text-white/60 text-sm">Compare variants and choose the winner</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Variant Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(Object.keys(variantInfo) as Variant[]).map((variant) => (
            <button
              key={variant}
              onClick={() => {
                setActiveVariant(variant);
                setIsOpen(true);
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                activeVariant === variant
                  ? 'border-[#FF6B6B] bg-[#FFE5E5]/50'
                  : 'border-[#E2E8F0] bg-white hover:border-[#FF6B6B]/50'
              }`}
            >
              <p className={`font-semibold text-sm ${activeVariant === variant ? 'text-[#FF6B6B]' : 'text-[#0F172A]'}`}>
                {variantInfo[variant].name}
              </p>
              <p className="text-xs text-[#64748B] mt-1">{variantInfo[variant].focus}</p>
            </button>
          ))}
        </div>

        {/* Active Variant Details */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-[#0F172A] text-lg">{variantInfo[activeVariant].name}</h2>
              <p className="text-[#64748B] mt-1">{variantInfo[activeVariant].description}</p>
              <p className="text-sm text-[#94A3B8] mt-2">
                <strong>Psychology:</strong> {variantInfo[activeVariant].focus}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors flex-shrink-0"
            >
              Open Modal
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
          <h3 className="font-semibold text-[#0F172A] mb-3">A/B Test Info</h3>
          <p className="text-sm text-[#475569]">
            In production, users are randomly assigned one variant (stored in localStorage).
            GTM events fire on: <code className="bg-[#F8FAFC] px-1 rounded">view</code>, <code className="bg-[#F8FAFC] px-1 rounded">convert</code>, <code className="bg-[#F8FAFC] px-1 rounded">dismiss</code>
          </p>
        </div>

        {/* Comparison Notes */}
        <div className="bg-[#0F172A] text-white rounded-xl p-6">
          <h3 className="font-bold mb-4">Quick Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/60 border-b border-white/10">
                  <th className="pb-2">Aspect</th>
                  <th className="pb-2">A: Preview</th>
                  <th className="pb-2">B: Benefits</th>
                  <th className="pb-2">C: Minimal</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                <tr className="border-b border-white/10">
                  <td className="py-2 text-white">Visual Hook</td>
                  <td className="py-2">Blurred program</td>
                  <td className="py-2">Icon + value list</td>
                  <td className="py-2">Checkmark icon</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 text-white">Header</td>
                  <td className="py-2">Navy gradient</td>
                  <td className="py-2">White/clean</td>
                  <td className="py-2">White/clean</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 text-white">CTA Text</td>
                  <td className="py-2">"Send Me My Program"</td>
                  <td className="py-2">"Get My Free Program"</td>
                  <td className="py-2">"Send Me My Program"</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 text-white">Pro Upsell</td>
                  <td className="py-2">❌</td>
                  <td className="py-2">❌</td>
                  <td className="py-2">Subtle link</td>
                </tr>
                <tr>
                  <td className="py-2 text-white">Copy Length</td>
                  <td className="py-2">Short</td>
                  <td className="py-2">Medium</td>
                  <td className="py-2">Minimal</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/40 mt-4">All variants are honest - no fake timers, fake stats, or fake activity feeds.</p>
        </div>
      </div>

      {/* Modals */}
      {activeVariant === 'A' && <VariantA isOpen={isOpen} onClose={() => setIsOpen(false)} />}
      {activeVariant === 'B' && <VariantB isOpen={isOpen} onClose={() => setIsOpen(false)} />}
      {activeVariant === 'C' && <VariantC isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
