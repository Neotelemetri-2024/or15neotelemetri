import { Link } from "react-router-dom";
import Hero from "../../components/landingpage/Hero";
import OrganisasiSection from "../../components/landingpage/OrganisasiSection";
import OperasionalSection from "../../components/landingpage/OperasionalSection";
import ProjectSection from "../../components/landingpage/ProjectSection";
import AchievementSection from "../../components/landingpage/AchievementSection";
import CountdownSection from "../../components/landingpage/TimerSection";
import FooterSection from "../../components/landingpage/FooterSection";
import CTASection from "../../components/landingpage/CtaSection";
import FaqSection from "../../components/landingpage/FaqSection";
import Navbar from "../../components/landingpage/Navbar";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Helmet } from "react-helmet-async";

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
    <>
      <Helmet>
        <title>Open Recruitment Neo Telemetri 15 UNAND</title>
        <meta
          name="description"
          content="Ayo bergabung dengan angkatan ke-15 Neo Telemetri!"
        />
      </Helmet>
      <div className="relative min-h-screen bg-[#070012] text-white overflow-hidden">
        <>
          <Navbar />
        </>

        <Hero />

        <div id="division" data-aos="fade-up">
          <OperasionalSection />
        </div>

        <div id="organisasi" data-aos="fade-up">
          <OrganisasiSection />
        </div>
        <div id="project" data-aos="fade-up">
          <ProjectSection />
        </div>

        <div id="achievement" data-aos="fade-up">
          <AchievementSection />
        </div>
        <div data-aos="fade-up">
          <CountdownSection />
        </div>
        <div data-aos="fade-up">
          <CTASection />
        </div>

        <div id="faq" data-aos="fade-up">
          <FaqSection />
        </div>

        <div data-aos="fade-up">
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
    </>
  );
}
