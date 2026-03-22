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

export default function LandingPage() {
  
  return (
    <div className="relative min-h-screen bg-[#070012] text-white overflow-hidden">
      <>
        <Navbar />
      </>
      <>
        <Hero />
      </>
      <>
        <OperasionalSection />
      </>
      <>
        <OrganisasiSection />
      </>
      <>
        <ProjectSection />
      </>
      <>
        <AchievementSection />
      </>
      <>
        <CountdownSection />
      </>
      <>
        <FaqSection />
      </>
      <>
        <FooterSection />
      </>

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
