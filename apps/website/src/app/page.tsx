import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import GetStartedSection from '../components/sections/GetStartedSection';
import HeroSection from '../components/sections/HeroSection';
import ProductSection from '../components/sections/ProductSection';
import ResourcesSection from '../components/sections/ResourcesSection';
import TroubleshootingSection from '../components/sections/TroubleshootingSection';
import UseCasesSection from '../components/sections/UseCasesSection';

export default function Index() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProductSection />
        <UseCasesSection />
        <GetStartedSection />
        <TroubleshootingSection />
        <ResourcesSection />
      </main>
      <Footer />
    </>
  );
}
