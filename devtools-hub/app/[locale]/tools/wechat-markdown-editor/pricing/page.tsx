'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FREE_FEATURES = [
  { name: 'Markdown Editor', included: true },
  { name: 'Live Preview', included: true },
  { name: 'One-Click Copy to WeChat', included: true },
  { name: 'Basic Themes (5)', included: true },
  { name: 'Search & Replace', included: true },
  { name: 'Keyboard Shortcuts', included: true },
  { name: '2 Free Templates', included: true },
  { name: 'AI Writing Assistant', included: false },
  { name: 'Article Analytics', included: false },
  { name: 'PDF Export', included: false },
  { name: '8 Premium Templates', included: false },
  { name: 'Dark Mode Preview', included: false },
  { name: 'Custom CSS Editor', included: false },
  { name: 'Visual Theme Designer', included: false },
  { name: 'Download as HTML', included: false },
  { name: 'Link-to-Footnote Conversion', included: false },
  { name: 'Premium Themes (13+)', included: false },
];

const PRO_FEATURES_HIGHLIGHT = [
  { icon: '✨', title: 'AI Writing Assistant', desc: 'Polish, expand, shorten, translate, and continue writing with AI — 50 calls/day' },
  { icon: '📊', title: 'Article Analytics', desc: 'Word count, reading time, WeChat layout score, keyword extraction, and SEO tips' },
  { icon: '📄', title: '8 Premium Templates', desc: 'Pre-built templates for product intros, tutorials, newsletters, recipes, and more' },
  { icon: '📥', title: 'PDF Export', desc: 'Export your content as print-ready PDF with optimized layout' },
  { icon: '🌙', title: 'Dark Mode Preview', desc: 'Preview your content in dark mode for better readability' },
  { icon: '🎨', title: 'Visual Theme Designer', desc: 'Create custom themes with a visual editor' },
  { icon: '🔗', title: 'Link-to-Footnote', desc: 'Convert links to footnotes for WeChat compatibility' },
  { icon: '💅', title: 'Custom CSS', desc: 'Fine-tune every detail with custom CSS' },
];

export default function WeMDPricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async (plan: 'wemd-pro-monthly' | 'wemd-pro-yearly') => {
    setIsLoading(true);
    try {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/tools/wechat-markdown-editor" className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="font-medium">Back to Editor</span>
          </Link>
          <button
            onClick={() => handleCheckout(isYearly ? 'wemd-pro-yearly' : 'wemd-pro-monthly')}
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Upgrade to Pro'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Limited Time Offer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Write Better WeChat Articles with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">WeMD Pro</span>
          </h1>
          <p className="text-lg text-slate-400 mb-4">
            Unlock AI-powered writing assistance, premium themes, article analytics, and advanced features to create stunning WeChat content.
          </p>
          <p className="text-emerald-400 text-sm font-medium mb-8">
            🎁 Free users get 3 AI calls/day — try the AI assistant before you buy!
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'left-8' : 'left-1'}`}></span>
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-slate-500'}`}>
              Yearly
              <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Save 18%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
            <p className="text-slate-400 mb-6">Basic features to get started</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400">/forever</span>
            </div>
            <Link
              href="/tools/wechat-markdown-editor"
              className="block w-full py-3 text-center border border-slate-600 hover:border-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              Start Free
            </Link>
            <ul className="mt-8 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature.name} className="flex items-center gap-3">
                  {feature.included ? (
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={feature.included ? 'text-slate-300' : 'text-slate-500'}>{feature.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-b from-emerald-900/30 to-slate-800/50 border-2 border-emerald-500/50 rounded-2xl p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <p className="text-slate-400 mb-6">Everything you need for professional content</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">{isYearly ? '$49' : '$4.99'}</span>
              <span className="text-slate-400">{isYearly ? '/year' : '/month'}</span>
              {isYearly && <span className="ml-2 text-sm text-emerald-400">(≈$4.08/mo)</span>}
            </div>
            <button
              onClick={() => handleCheckout(isYearly ? 'wemd-pro-yearly' : 'wemd-pro-monthly')}
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
            <ul className="mt-8 space-y-3">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white font-medium">Everything in Free, plus:</span>
              </li>
              {PRO_FEATURES_HIGHLIGHT.map((feature) => (
                <li key={feature.title} className="flex items-center gap-3">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-slate-300">{feature.title}</span>
                </li>
              ))}
              <li className="flex items-center gap-3 pt-2 border-t border-slate-700 mt-4">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-300">Priority Support</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">10,000+</span>
            <span>Articles Created</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">4.9/5</span>
            <span>User Rating</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">2,000+</span>
            <span>Pro Subscribers</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="px-4 py-16 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Upgrade to Pro?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {PRO_FEATURES_HIGHLIGHT.map((feature) => (
              <div key={feature.title} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to Pro features until the end of your billing period.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor.' },
              { q: 'Is there a free trial?', a: 'Yes! Free users get 3 AI calls per day and access to 2 free templates. You can experience the AI assistant before upgrading to Pro for unlimited access.' },
              { q: 'Do you offer refunds?', a: 'Yes, we offer a 7-day money-back guarantee if you\'re not satisfied with Pro.' },
              { q: 'Will my content be saved if I cancel?', a: 'Yes, your content is stored locally in your browser and is not affected by your subscription status.' },
            ].map((faq) => (
              <details key={faq.q} className="group bg-slate-800/50 border border-slate-700 rounded-xl">
                <summary className="flex items-center justify-between p-5 cursor-pointer">
                  <span className="font-medium text-white">{faq.q}</span>
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-slate-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Better Content?</h2>
          <p className="text-slate-400 mb-8">Join thousands of content creators who use WeMD Pro to write stunning WeChat articles.</p>
          <button
            onClick={() => handleCheckout(isYearly ? 'wemd-pro-yearly' : 'wemd-pro-monthly')}
            disabled={isLoading}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-lg font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Loading...' : `Upgrade to Pro — ${isYearly ? '$49/year' : '$4.99/month'}`}
          </button>
          <p className="mt-4 text-sm text-slate-500">7-day money-back guarantee · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 px-4 py-8 text-center text-slate-500 text-sm">
        <p>© 2025 DevTools Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
