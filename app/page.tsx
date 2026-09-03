import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { LiveMicroDemo } from "@/components/landing/live-micro-demo";
import { Navbar } from "@/components/landing/navbar";
import { ValueProposition } from "@/components/landing/value-proposition";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ValueProposition />
        <LiveMicroDemo />
      </main>
      <Footer />
    </>
  );
}
