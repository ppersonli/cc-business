import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — DevTools Hub',
  description: 'Privacy Policy for DevTools Hub developer tools.',
  alternates: {
    canonical: 'https://tools.ovanime.com/privacy/',
  },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
        <p><strong>Last updated:</strong> June 9, 2026</p>

        <h2 className="text-xl font-semibold text-white mt-8">1. Data Processing</h2>
        <p>
          DevTools Hub is a client-side application. All data processing happens in your browser.
          No user data is sent to our servers when using our developer tools.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">2. Account Information</h2>
        <p>
          If you create an account via Google OAuth, we store your email address and user ID
          for subscription management purposes only.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. Analytics</h2>
        <p>
          We use Google Analytics to understand how our tools are used. This includes page views
          and basic usage metrics. No personal data is collected through analytics.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">4. Cookies</h2>
        <p>
          We use essential cookies for authentication (auth_token). No tracking cookies are used.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">5. Chrome Extension Permissions</h2>
        <p>
          Our Chrome extensions request minimal permissions:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>storage</strong> — Saves user settings and preferences locally</li>
          <li><strong>cookies</strong> — Reads authentication status from our website</li>
          <li><strong>activeTab</strong> — Accesses current tab for core functionality</li>
        </ul>
        <p>
          No browsing history is collected or stored.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">6. Third-Party Services</h2>
        <p>
          We use the following third-party services:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Google OAuth — Authentication</li>
          <li>Google Analytics — Usage analytics</li>
          <li>Vercel — Hosting</li>
          <li>OpenAI API — AI features (Pro users only)</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">7. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your data. All data transmission
          is encrypted via HTTPS.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">8. Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to children under 13. We do not knowingly collect
          personal information from children.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">9. User Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data. Contact us
          at support@ovanime.com to exercise these rights.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">10. Contact</h2>
        <p>
          For privacy-related inquiries, contact us at support@ovanime.com.
        </p>
      </div>
    </main>
  )
}
