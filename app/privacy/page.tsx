'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <FiArrowLeft />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <p className="text-gray-600">
            <strong>Last Updated:</strong> January 2026
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              BeamX Solutions (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our Business Idea Validator tool and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information that you voluntarily provide to us when you use our assessment tool:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Personal Information:</strong> Name, email address</li>
              <li><strong>Business Information:</strong> Industry, location, business stage</li>
              <li><strong>Assessment Responses:</strong> Your answers to our validation questions</li>
              <li><strong>Usage Data:</strong> How you interact with our platform (via Google Analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Generate your personalized business idea validation report</li>
              <li>Provide AI-powered recommendations tailored to your responses</li>
              <li>Send your assessment report to your email (if requested)</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about our services (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is securely stored using Supabase, a trusted cloud database provider.
              We implement appropriate technical and organizational measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Supabase:</strong> Database storage</li>
              <li><strong>Anthropic (Claude AI):</strong> AI-powered analysis and recommendations</li>
              <li><strong>Resend:</strong> Email delivery services</li>
              <li><strong>Google Analytics:</strong> Website usage analytics</li>
              <li><strong>Vercel:</strong> Website hosting</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Each of these services has their own privacy policies governing how they handle data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your assessment data for as long as necessary to provide our services
              and comply with legal obligations. You may request deletion of your data at any time
              by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use Google Analytics to understand how visitors interact with our website.
              This service may use cookies to collect anonymous usage data. You can opt-out of
              Google Analytics by installing the Google Analytics Opt-out Browser Add-on.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the
              &quot;Last Updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices,
              please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>BeamX Solutions</strong></p>
              <p className="text-gray-700">Email: info@beamxsolutions.com</p>
              <p className="text-gray-700">Website: www.beamxsolutions.com</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; 2026 BeamX Solutions. All rights reserved.
        </div>
      </main>
    </div>
  );
}
