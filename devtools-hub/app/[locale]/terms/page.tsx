import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — DevTools Hub',
  description: 'Terms of Service for DevTools Hub developer tools.',
  alternates: {
    canonical: 'https://tools.ovanime.com/terms/',
  },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
        <p><strong>Last updated:</strong> June 9, 2026</p>

        <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance</h2>
        <p>
          By using DevTools Hub, you agree to these Terms of Service. If you do not agree,
          do not use our services.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">2. Service Description</h2>
        <p>
          DevTools Hub provides free and premium developer tools accessible via web browsers
          and Chrome extensions. All client-side tools process data locally in your browser.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. User Content</h2>
        <p>
          You retain full ownership of any data you input into our tools. We do not claim
          ownership over your content. Data processed by client-side tools never leaves your browser.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">4. Intellectual Property</h2>
        <p>
          All tools, code, and content on DevTools Hub are owned by us and protected by
          intellectual property laws. You may not copy, modify, or distribute our tools
          without permission.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">5. Pro Accounts and Payments</h2>
        <p>
          Pro subscriptions are processed through Waffo Pancake. By subscribing, you agree
          to their payment terms. Subscriptions auto-renew unless cancelled. Refund requests
          are handled on a case-by-case basis within 14 days of purchase.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">6. Disclaimer</h2>
        <p>
          Our tools are provided &quot;as is&quot; without warranties. We are not responsible for any
          damages arising from the use of our tools. Always verify tool outputs for critical tasks.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">7. Limitation of Liability</h2>
        <p>
          In no event shall DevTools Hub be liable for any indirect, incidental, special,
          or consequential damages arising from your use of our services.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of our services
          after changes constitutes acceptance of the new terms.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">9. Contact</h2>
        <p>
          For questions about these terms, contact us at support@ovanime.com.
        </p>
      </div>
    </main>
  )
}
