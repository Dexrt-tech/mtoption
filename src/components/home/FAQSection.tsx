'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I get started with Meta Trading Option?',
    a: 'Sign up for an account, complete verification if required, and fund your account via the deposit options. Explore investment plans, stocks, or copytrading from your dashboard.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Bitcoin (BTC), Ethereum (ETH), USDT (ERC20 and TRC20), and other major cryptocurrencies.',
  },
  {
    q: 'How long do withdrawals take?',
    a: 'Withdrawal requests are processed within 24 hours of submission. Once approved, funds are immediately sent to your provided wallet address.',
  },
  {
    q: 'Is my account and data secure?',
    a: 'Yes. Meta Trading Option uses bank-level encryption and security protocols. Your data is protected at all times, and we are fully regulatory compliant.',
  },
  {
    q: 'What are investment plans and how do they work?',
    a: "Investment plans are structured profit-sharing contracts. You deposit an amount, select a plan, and your earnings are automatically credited to your wallet based on the plan's ROI and duration.",
  },
  {
    q: 'Can I have multiple active investments?',
    a: 'Yes, you can activate multiple investment plans simultaneously. Each plan runs independently and credits earnings to your main wallet balance.',
  },
  {
    q: 'What is copytrading?',
    a: 'Copytrading allows you to automatically mirror the trades of experienced and successful traders on our platform. You share in their profits proportionally to your investment.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="landing-section-bg relative border-t px-4 py-16 md:px-8 md:py-24" style={{ borderColor: '#1d222b' }}>
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="section-heading mb-4">FREQUENTLY ASKED QUESTIONS</h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed" style={{ color: '#62748e' }}>
            Can't find the answer? Contact our 24/7 support team.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="card-dark overflow-hidden"
              style={{ borderColor: openIndex === i ? 'rgba(255,106,94,0.3)' : undefined }}
            >
              <button
                className="flex w-full items-center justify-between p-6 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="pr-4 text-sm font-semibold text-white">{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{ color: 'var(--primary)', flexShrink: 0, transition: 'transform 0.3s', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)' }}
                />
              </button>

              {openIndex === i && (
                <div className="border-t px-6 pb-6 pt-4" style={{ borderColor: '#1d222b' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#62748e' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card-dark mt-10 p-8 text-center">
          <p className="mb-2 font-semibold text-white">Still have questions?</p>
          <p className="mb-6 text-sm" style={{ color: '#62748e' }}>Our support team is available 24/7 to help you.</p>
          <a href="/contact" className="btn-primary">Contact Support</a>
        </div>
      </div>
    </section>
  );
}
