import { Link } from "react-router-dom";
import Hero from "../../components/landingpage/Hero";
import OrganisasiSection from "../../components/landingpage/OrganisasiSection";
import OperasionalSection from "../../components/landingpage/OperasionalSection";
import ProjectSection from "../../components/landingpage/ProjectSection";
import AchievementSection from "../../components/landingpage/AchievementSection";
import CountdownSection from "../../components/landingpage/TimerSection";
import FooterSection from "../../components/landingpage/FooterSection";
import FaqSection from "../../components/landingpage/FaqSection";
import Navbar from "../../components/landingpage/Navbar";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function LandingPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });

    AOS.refresh();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#070012] text-white overflow-hidden">
      <>
        <Navbar />
      </>

      <Hero />

      <div data-aos="fade-up" data-aos-delay="100">
        <OperasionalSection />
      </div>

      <div data-aos="fade-up" data-aos-delay="200">
        <OrganisasiSection />
      </div>
      <div data-aos="fade-up" data-aos-delay="300">
        <ProjectSection />
      </div>

      <div data-aos="fade-up" data-aos-delay="400">
        <AchievementSection />
      </div>
      <div data-aos="fade-up" data-aos-delay="500">
        <CountdownSection />
      </div>

      <div data-aos="fade-up" data-aos-delay="600">
        <FaqSection />
      </div>

      <div data-aos="fade-up" data-aos-delay="700">
        <FooterSection />
      </div>

      {/* KEYFRAME */}
      <style>
        {`
        @keyframes circuit {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300px); }
        }
        `}
      </style>
    </div>
  );
}
