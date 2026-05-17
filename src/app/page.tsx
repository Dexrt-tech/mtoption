import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import MarketTicker from '@/components/home/MarketTicker';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import InvestmentOpportunitiesSection from '@/components/home/InvestmentOpportunitiesSection';
import TradingViewSection from '@/components/home/TradingViewSection';
import ProductsSection from '@/components/home/ProductsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <MarketTicker />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InvestmentOpportunitiesSection />
        <TradingViewSection />
        <ProductsSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
