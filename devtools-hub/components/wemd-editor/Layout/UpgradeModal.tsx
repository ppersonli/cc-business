'use client';

import { useState } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const PRO_FEATURES = [
  { icon: '✨', name: 'AI Writing Assistant (50 calls/day)' },
  { icon: '📊', name: 'Article Analytics & WeChat Score' },
  { icon: '📄', name: '8 Premium Templates' },
  { icon: '📥', name: 'PDF Export' },
  { icon: '🎭', name: '8 Premium Themes' },
  { icon: '🌙', name: 'Dark Mode Preview' },
  { icon: '💅', name: 'Custom CSS Editor' },
  { icon: '🎨', name: 'Visual Theme Designer' },
  { icon: '🔗', name: 'Link-to-Footnote' },
  { icon: '📥', name: 'Download as HTML' },
];

export default function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const plan = isYearly ? 'wemd-pro-yearly' : 'wemd-pro-monthly';
      const res = await fetch('/api/wemd/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-emerald-500/10 rounded-full">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to WeMD Pro</h2>
          {featureName && (
            <p className="text-emerald-400 text-sm">
              <span className="font-medium">{featureName}</span> is a Pro feature
            </p>
          )}
          <p className="text-slate-400 text-sm mt-2">
            Unlock all premium features for professional content creation
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 py-4">
          <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-emerald-500' : 'bg-slate-600'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'left-6' : 'left-0.5'}`}></span>
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-slate-500'}`}>
            Yearly
            <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">-18%</span>
          </span>
        </div>

        {/* Price */}
        <div className="text-center py-2 mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">{isYearly ? '$49' : '$4.99'}</span>
            <span className="text-slate-400">{isYearly ? '/year' : '/month'}</span>
          </div>
          {isYearly && (
            <span className="text-sm text-emerald-400">≈ $4.08/month · Save $10.88</span>
          )}
        </div>

        {/* Features */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-b border-slate-700">
          <ul className="space-y-2.5">
            {PRO_FEATURES.map((feature) => (
              <li key={feature.name} className="flex items-center gap-2.5">
                <span className="text-sm">{feature.icon}</span>
                <span className="text-sm text-slate-300">{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="p-6">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Upgrade to Pro — ${isYearly ? '$49/year' : '$4.99/month'}`
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">
            7-day money-back guarantee · Cancel anytime
          </p>
          <a
            href="/tools/wechat-markdown-editor/pricing"
            className="block text-center text-sm text-emerald-400 hover:text-emerald-300 mt-3 transition-colors"
          >
            View full pricing →
          </a>
        </div>
      </div>
    </div>
  );
}
