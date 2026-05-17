import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mb-12">Last updated: January 1, 2025</p>

          {[
            {
              title: '1. Information We Collect',
              content: `We collect information you provide directly, including your name, email address, phone number, and country when you register. We also collect usage data, transaction history, and technical information such as IP addresses and browser type to improve our services.`,
            },
            {
              title: '2. How We Use Your Information',
              content: `We use your information to provide and improve our services, process transactions, verify your identity, send account notifications, and comply with legal obligations. We do not sell your personal data to third parties.`,
            },
            {
              title: '3. Data Security',
              content: `Meta Trading Option uses industry-standard encryption and bank-level security protocols to protect your data. All data is encrypted in transit using TLS and at rest. We implement access controls and regular security audits to maintain the integrity of your information.`,
            },
            {
              title: '4. Cookies',
              content: `We use cookies to maintain your session, remember preferences, and analyze usage patterns. You can control cookie settings through your browser. Essential cookies are required for the platform to function properly.`,
            },
            {
              title: '5. Third-Party Services',
              content: `We may use third-party services for analytics, payment processing, and customer support. These providers are bound by confidentiality agreements and may only use your data as directed by us.`,
            },
            {
              title: '6. Your Rights',
              content: `You have the right to access, correct, or delete your personal data. You may also request a copy of all data we hold about you. To exercise these rights, contact our support team at support@metatradingoption.com.`,
            },
            {
              title: '7. Data Retention',
              content: `We retain your data for as long as your account is active and as required by law. Transaction records are kept for a minimum of 5 years for regulatory compliance.`,
            },
            {
              title: '8. Contact Us',
              content: `For privacy-related questions or concerns, email us at support@metatradingoption.com. We respond to all privacy requests within 30 days.`,
            },
          ].map((section) => (
            <div key={section.title} className="mb-8">
              <h2 className="text-white font-bold text-lg mb-3">{section.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
