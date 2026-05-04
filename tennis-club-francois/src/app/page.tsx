import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PhilosophySection } from '@/components/landing/PhilosophySection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { AmbianceSection } from '@/components/landing/AmbianceSection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="bg-surface font-body text-on-surface flex-1">
      <Navbar />
      
      <main className="pt-20 flex-1">
        <HeroSection />
        <PhilosophySection />
        <ServicesSection />
        <AmbianceSection />
      </main>
      
      <Footer />
    </div>
  );
}
