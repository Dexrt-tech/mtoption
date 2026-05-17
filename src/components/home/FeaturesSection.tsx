import { Users, BarChart2, Smartphone, PieChart, LineChart, Shield } from 'lucide-react';

const features = [
  { icon: Users,     title: 'COMMUNITY',                       desc: 'Discover the transformative power of joining a vibrant community of thousands of successful traders.' },
  { icon: BarChart2, title: 'REAL-TIME MARKET DATA',           desc: 'Enabling traders to stay connected to the dynamic markets and make well-informed decisions in real time.' },
  { icon: Smartphone,title: 'CONVENIENCE',                     desc: 'Trading apps offer the advantage of convenience by allowing users to trade on-the-go from their mobile devices.' },
  { icon: PieChart,  title: 'EASY PORTFOLIO MANAGEMENT',       desc: 'Designed with simplicity and efficiency in mind, this powerful tool will revolutionize the way you manage your investments.' },
  { icon: LineChart, title: 'ADVANCED CHARTING AND ANALYSIS',  desc: 'Provides a comprehensive suite of tools and features to help you navigate the complex world of trading with confidence.' },
  { icon: Shield,    title: 'SECURE & COMPLIANT',              desc: 'Bank-level security and regulatory compliance so you can trade with peace of mind.' },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="landing-section-bg relative border-t px-4 py-16 md:px-8 md:py-24"
      style={{ borderColor: 'var(--landing-border)' }}
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 md:mb-16">
          <h2 className="section-heading mb-4">
            UNLOCK THE POWER OF <span style={{ color: 'var(--primary)' }}>TRADING.</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed" style={{ color: '#62748e' }}>
            Everything you need to take control of your financial future, all in one powerful platform.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-dark flex items-start gap-4 px-5 py-5 transition-colors">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(252,73,54,0.1)', border: '1px solid rgba(252,73,54,0.2)' }}
                >
                  <Icon size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#62748e' }}>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
