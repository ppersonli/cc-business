import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — DevTools Hub',
  description: 'Privacy Policy for DevTools Hub free online developer tools and SnapGen Chrome extension.',
  alternates: {
    canonical: 'https://tools.pixiaoli.cn/privacy/',
  },
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 9, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
          <p>
            DevTools Hub is committed to protecting your privacy. This Privacy Policy explains how we collect,
            use, and safeguard information when you use our website, developer tools, and the SnapGen Chrome
            browser extension.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Data Processing — Client-Side by Design</h2>
          <p>
            <strong>All developer tools process data entirely in your browser.</strong> No content you enter into
            our tools (text, code, JSON, images, etc.) is ever transmitted to or stored on our servers. Your data
            stays on your device.
          </p>
          <p className="mt-2">
            <strong>SnapGen</strong> captures screenshots of your visible browser tab and sends them to AI APIs
            (OpenAI or Anthropic) that you configure with your own API key. Screenshots are processed by the AI
            service and are <strong>not stored on our servers</strong>. Analysis results are saved locally in your
            browser storage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Information We Collect</h2>
          <p>We collect only the minimum information necessary to provide the Service:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Account Information</strong> — If you sign in with Google, we store your email address and display name for account identification and Pro subscription management.</li>
            <li><strong>API Keys</strong> — If you choose to use your own API key (BYOK mode), it is stored locally in your browser using Chrome storage. We never see or transmit your API key to our servers.</li>
            <li><strong>Usage Analytics</strong> — We use Google Analytics to collect anonymous usage statistics (page views, session duration, device type). This helps us improve the Service.</li>
            <li><strong>Cookies</strong> — We use essential cookies for session management and authentication.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>To provide and maintain the Service</li>
            <li>To manage your Pro subscription and account</li>
            <li>To improve the Service through aggregated analytics</li>
            <li>To respond to your support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. SnapGen Chrome Extension</h2>
          <p>
            The SnapGen Chrome extension requires the following permissions to function:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Side Panel</strong> — To display the capture and analysis interface in a side panel.</li>
            <li><strong>Storage</strong> — To save your settings, API keys, and analysis history locally in your browser.</li>
            <li><strong>Tabs</strong> — To capture screenshots of the active tab when you request it.</li>
            <li><strong>Cookies</strong> — To read your login status from tools.pixiaoli.cn for Pro subscription verification.</li>
            <li><strong>Commands</strong> — To support keyboard shortcuts for quick screenshot capture.</li>
          </ul>
          <p className="mt-2">
            The extension does <strong>not</strong> track your browsing activity, collect personal data,
            or send data to third parties. Screenshots are sent only to the AI API you configure
            (OpenAI or Anthropic) and are not stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Google Analytics</strong> — For anonymous usage analytics. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google&apos;s Privacy Policy</a>.</li>
            <li><strong>Google OAuth</strong> — For authentication. We receive only your email and display name.</li>
            <li><strong>Pancake</strong> — For payment processing. We do not store payment card information.</li>
            <li><strong>Vercel</strong> — For hosting. Vercel collects standard server logs.</li>
            <li><strong>OpenAI / Anthropic</strong> — For AI-powered screenshot analysis (SnapGen). Screenshots are sent directly from your browser to these APIs when you use SnapGen with your own API key.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information. However,
            no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
          <p>The Service is not directed to children under 13. We do not knowingly collect personal information from children.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request deletion of your personal data</li>
            <li>Opt out of analytics tracking</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact us at{' '}
            <a href="mailto:support@pixiaoli.cn" className="text-blue-600 hover:underline">support@pixiaoli.cn</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
          <p>
            For questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:support@pixiaoli.cn" className="text-blue-600 hover:underline">support@pixiaoli.cn</a>.
          </p>
        </section>
      </div>
    </main>
  )
}
