import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — DevTools Hub',
  description: 'Terms of Service for DevTools Hub free online developer tools and SnapGen Chrome extension.',
  alternates: {
    canonical: 'https://tools.pixiaoli.cn/terms/',
  },
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 9, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using DevTools Hub and the SnapGen Chrome extension (&quot;the Service&quot;),
            you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p>
            DevTools Hub provides free, client-side developer tools accessible via web browsers. SnapGen is a
            Chrome browser extension that captures screenshots and uses AI to analyze, describe, and generate code
            from them. All developer tool processing occurs locally in your browser. SnapGen sends screenshots
            to AI APIs (OpenAI or Anthropic) that you configure with your own API key.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Use of the Service</h2>
          <p>You may use the Service for lawful purposes only. You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
            <li>Use the Service to process content that violates third-party rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
          <p>
            The Service, including its design, code, and content, is owned by DevTools Hub and protected by copyright
            and other intellectual property laws. You may not copy, modify, distribute, or sell any part of the Service
            without prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
          <p>
            All data you enter into the Service&apos;s developer tools is processed entirely in your browser and
            is never transmitted to our servers. You retain full ownership of any content you create or process
            using the Service.
          </p>
          <p className="mt-2">
            For SnapGen, screenshots you capture are sent to the AI API you configure (OpenAI or Anthropic).
            We do not store, review, or access your screenshots or analysis results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Pro Accounts &amp; Payments</h2>
          <p>
            Pro accounts are processed through our payment partner Pancake. By subscribing, you agree to their terms
            of service. Pro subscriptions auto-renew unless cancelled. You may cancel at any time.
          </p>
          <p className="mt-2">
            SnapGen Pro plans include unlimited screenshot analyses. The free tier allows 5 analyses per day.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. AI-Generated Content</h2>
          <p>
            SnapGen uses third-party AI services (OpenAI, Anthropic) to analyze screenshots. AI-generated code,
            descriptions, and reviews are provided &quot;as is&quot; and may contain errors. You are responsible
            for reviewing and validating any AI-generated output before use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Disclaimer</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, DevTools Hub shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, or any loss of profits or revenue, arising from your use of
            the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated
            date. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:support@pixiaoli.cn" className="text-blue-600 hover:underline">support@pixiaoli.cn</a>.
          </p>
        </section>
      </div>
    </main>
  )
}
