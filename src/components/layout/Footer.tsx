import Link from 'next/link';
import { X, MessageCircle, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      id="footer"
      className="border-t px-4 py-10 md:px-8"
      style={{
        borderColor: 'var(--landing-border)',
        background: `radial-gradient(ellipse 70% 50% at 0% 100%, oklch(0.12 0.02 264.695), transparent 55%), var(--landing-bg)`,
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        {/* Left */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <a href="mailto:support@metatradingoption.com" className="text-sm font-medium text-white uppercase tracking-wide transition-colors hover:text-[color:var(--primary)]">
            SUPPORT@META TRADING OPTION.COM
          </a>
          <div className="rounded border px-2 py-1" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
            <span className="text-xs" style={{ color: '#62748e' }}>VISA</span>
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm" style={{ color: '#62748e' }}>2025 © Meta Trading Option</p>
          <nav className="flex flex-wrap justify-center gap-4">
            {[
              { href: '/contact', label: 'Contact' },
              { href: '/cookies-policy', label: 'Cookies policy' },
              { href: '/terms-of-service', label: 'Terms of Service' },
              { href: '/privacy-policy', label: 'Privacy Policy' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm transition-colors hover:text-white" style={{ color: '#62748e' }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right — Social icons */}
        <div className="flex items-center gap-3">
          {[
            { Icon: X, label: 'Twitter' },
            { Icon: MessageCircle, label: 'Discord' },
            { Icon: Send, label: 'Telegram' },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border text-white transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
