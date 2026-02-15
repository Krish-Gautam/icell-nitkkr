import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/layout/HeroSection";
import EventSection from "./components/layout/EventSection";
import TeamSection from "./components/layout/TeamSection";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">

      <div className="fixed top-6 w-full z-50 flex justify-center">
        <Navbar />
      </div>

      <div className="h-24"></div>

      <main className="flex-1">
        <HeroSection />
        <EventSection />
        <TeamSection />
      </main>

      <Footer />
    </div>
  );
}
