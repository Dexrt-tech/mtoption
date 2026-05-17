import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CookiesPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-4xl font-black text-white mb-3">Cookies Policy</h1>
          <p className="text-gray-500 text-sm mb-12">Last updated: January 1, 2025</p>

          {[
            {
              title: 'What Are Cookies?',
              content: `Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience over time.`,
            },
            {
              title: 'How We Use Cookies',
              content: `Meta Trading Option uses cookies to maintain your login session, remember your preferences, secure your account, and analyze how our platform is used so we can improve it.`,
            },
            {
              title: 'Essential Cookies',
              content: `These cookies are necessary for the platform to function. They enable core features like authentication and session management. You cannot opt out of essential cookies while using the platform.`,
            },
            {
              title: 'Analytics Cookies',
              content: `We use analytics cookies to understand how visitors interact with our platform. This data is aggregated and anonymous, helping us improve user experience and performance.`,
            },
            {
              title: 'Managing Cookies',
              content: `You can control and delete cookies through your browser settings. Note that disabling certain cookies may affect the functionality of Meta Trading Option. Refer to your browser's help documentation for guidance on cookie settings.`,
            },
            {
              title: 'Contact Us',
              content: `For questions about our use of cookies, email us at support@metatradingoption.com.`,
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
