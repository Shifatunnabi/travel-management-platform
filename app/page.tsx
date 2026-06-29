import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import PopularHotels from "@/components/home/PopularHotels";
import PromoSection from "@/components/home/PromoSection";
import TrustSection from "@/components/home/TrustSection";
import Testimonials from "@/components/home/Testimonials";
import TravelPartners from "@/components/home/TravelPartners";
import FAQ from "@/components/home/FAQ";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TravelPartners />
        <FeaturedDestinations />
        <PromoSection />
        <PopularHotels />
        <TrustSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
