'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#features',      label: 'Features' },
  { href: '#how-it-works',  label: 'How It Works' },
  { href: '#chart',         label: 'Chart Overview' },
  { href: '#products',      label: 'Products' },
  { href: '#testimonials',  label: 'Testimonials' },
  { href: '#faq',           label: 'FAQ' },
  { href: '/contact',       label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b px-4 py-4 md:px-8"
      style={{ background: 'oklch(0.09 0.01 264.695)', borderColor: 'oklch(0.25 0.02 264.695)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Logo — plain text like original */}
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          <span className="text-white">META</span>
          <span style={{ color: 'var(--primary)' }}>TRADING</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: 'var(--muted-fg)' }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex shrink-0 items-center gap-2">
          <Link href="/login" className="btn-ghost text-sm px-4 py-2">
            LOGIN
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-4 py-2">
            GET STARTED
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden border-t mt-3 pt-4 pb-4 px-4 flex flex-col gap-2"
          style={{ borderColor: 'oklch(0.25 0.02 264.695)' }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-2 px-3 rounded-md hover:bg-white/5 transition-colors"
              style={{ color: 'var(--muted-fg)' }}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: 'oklch(0.25 0.02 264.695)' }}>
            <Link href="/login" className="btn-ghost text-center text-sm" onClick={() => setOpen(false)}>LOGIN</Link>
            <Link href="/signup" className="btn-primary text-center text-sm" onClick={() => setOpen(false)}>GET STARTED</Link>
          </div>
        </div>
      )}
    </header>
  );
}
