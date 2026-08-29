import HeroSection from "@/components/home/HeroSection";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import PopularHotels from "@/components/home/PopularHotels";
import PromoSection from "@/components/home/PromoSection";
import TrustSection from "@/components/home/TrustSection";
import Testimonials from "@/components/home/Testimonials";
import TravelPartners from "@/components/home/TravelPartners";
import TutorialVideos from "@/components/home/TutorialVideos";
import FAQ from "@/components/home/FAQ";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <TravelPartners />
        <FeaturedDestinations />
        <PromoSection />
        <PopularHotels />
        <TrustSection />
        <TutorialVideos />
        <Testimonials />
        <FAQ />
      </main>
    </>
  );
}
