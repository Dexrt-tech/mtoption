import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-4xl font-black text-white mb-3">Terms of Service</h1>
          <p className="text-gray-500 text-sm mb-12">Last updated: January 1, 2025</p>

          {[
            {
              title: '1. Acceptance of Terms',
              content: `By accessing or using Meta Trading Option, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.`,
            },
            {
              title: '2. Eligibility',
              content: `You must be at least 18 years of age to use Meta Trading Option. By registering, you confirm that you are of legal age and that the information you provide is accurate and complete.`,
            },
            {
              title: '3. Account Responsibilities',
              content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Meta Trading Option is not liable for losses resulting from unauthorized access due to your failure to secure your credentials.`,
            },
            {
              title: '4. Investment Plans & Returns',
              content: `Investment plans on Meta Trading Option carry inherent risks. Past performance does not guarantee future results. All projected returns are estimates based on current market conditions and may vary. You acknowledge that you may lose part or all of your invested capital.`,
            },
            {
              title: '5. Deposits & Withdrawals',
              content: `Deposits are subject to verification before being credited to your account. Withdrawals are processed within 24 hours of approval. Meta Trading Option reserves the right to request additional verification before processing withdrawals.`,
            },
            {
              title: '6. Prohibited Activities',
              content: `You may not use Meta Trading Option for money laundering, fraud, or any illegal activities. You may not attempt to reverse-engineer, hack, or disrupt our platform. Violation of these terms may result in immediate account termination.`,
            },
            {
              title: '7. Limitation of Liability',
              content: `Meta Trading Option shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including loss of profits or data. Our total liability shall not exceed the amount you have deposited in the preceding 30 days.`,
            },
            {
              title: '8. Termination',
              content: `We reserve the right to terminate or suspend your account at any time for violation of these terms or for any reason at our sole discretion. Upon termination, your right to use the platform immediately ceases.`,
            },
            {
              title: '9. Governing Law',
              content: `These Terms shall be governed by applicable law. Any disputes shall be resolved through binding arbitration. By using Meta Trading Option, you waive any right to a jury trial.`,
            },
            {
              title: '10. Contact',
              content: `For questions about these Terms, contact us at support@metatradingoption.com.`,
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
