import { Link } from "react-router-dom";
import logoORWhite from "../../assets/images/Logo_OR_White.png";
import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";

// import circleBlue from "../../assets/images/Bulat_Biru.png";

import { useState, useEffect } from "react";
import OrganisasiSection from "../../components/landingpage/OrganisasiSection";
import OperasionalSection from "../../components/landingpage/OperasionalSection";
import ProjectSection from "../../components/landingpage/ProjectSection";
import AchievementSection from "../../components/landingpage/AchievementSection";
import CountdownSection from "../../components/landingpage/TimerSection";
import FooterSection from "../../components/landingpage/FooterSection";
import FaqSection from "../../components/landingpage/FaqSection";

export default function LandingPage() {
  const [active, setActive] = useState("home");

  const menus = [
    { name: "Home", id: "home" },
    { name: "Division", id: "division" },
    { name: "Project", id: "project" },
    { name: "Achievement", id: "achievement" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Cek tiap section, aktifkan yang paling banyak terlihat di viewport
      const offsets = menus.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { id, top: Infinity };
        const rect = el.getBoundingClientRect();
        return { id, top: Math.abs(rect.top) };
      });

      // Section dengan jarak paling dekat ke atas viewport = aktif
      const closest = offsets.reduce((prev, curr) =>
        curr.top < prev.top ? curr : prev,
      );
      setActive(closest.id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // set initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="relative min-h-screen bg-[#070012] text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-6">
        <img src={logoORWhite} className="w-[180px]" alt="Logo" />

        {/* Menu tengah — tanpa background */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex gap-2 items-center">
          {menus.map((menu) => (
            <a
              key={menu.id}
              onClick={() => handleClick(menu.id)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer select-none
              ${
                active === menu.id
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {menu.name}
            </a>
          ))}
        </div>

        {/* Spacer kanan agar logo tetap kiri */}
        <div className="w-[180px] hidden md:block" />
      </nav>

      {/* HERO */}
      <section
        id="home"
        className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 min-h-screen"
      >
        <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#FF00FF] blur-[80px] opacity-70" />
        {/* LEFT TEXT */}
        <div className="max-w-[540px] ">
          <h1
            className="text-3xl md:text-4xl  leading-tight mb-8"
            style={{ fontFamily: "LandepzGlitch" }}
          >
            OPEN RECRUITMENT XV <br />
            UKM NEO TELEMETRI
          </h1>

          <p className="text-gray-300 my-8">
            Ayo! menjadi bagian dari Unit Kegiatan Mahasiswa berbasis IT
            terbesar di Universitas Andalas.
          </p>

          <div className="flex gap-16">
            <Link
              to="/register"
              className="px-10 py-3 rounded-full font-bold bg-gradient-to-r from-[#FF00FF] to-[#990099] shadow-lg shadow-purple-900/40 hover:scale-105 hover:shadow-xl active:scale-95 active:shadow-inner transition duration-200"
            >
              Daftar
            </Link>

            <Link
              to="/login"
              className="px-10 py-3 rounded-full font-bold bg-[#2a2733] shadow-lg shadow-black/40 hover:bg-[#3a3647] hover:scale-105 active:scale-95 active:shadow-inner transition duration-200"
            >
              Masuk
            </Link>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="relative w-[500px] h-[500px] lg:w-[650px] lg:h-[650px] mt-16 lg:mt-0 flex items-center justify-center">
          {/* BLACK CIRCLE */}
          <div className="absolute right-[-400px] w-[620px] h-[620px] rounded-full bg-black border-2 border-cyan-400 shadow-[0_0_35px_#00ffff]" />

          {/* ORBIT SYSTEM */}
          <div className="absolute right-[-400px] w-[620px] h-[620px] animate-[spin_20s_linear_infinite] flex items-center justify-center">
            {/* PROGRAMMING */}
            <div className="absolute rotate-0">
              <div className="translate-y-[-360px]">
                <img src={logoProgramming} className="w-[70px]" />
              </div>
            </div>

            {/* MMD */}
            <div className="absolute rotate-[120deg]">
              <div className="translate-y-[-360px]">
                <img src={logoMmd} className="w-[70px]" />
              </div>
            </div>

            {/* SKJ */}
            <div className="absolute rotate-[240deg]">
              <div className="translate-y-[-360px]">
                <img src={logoSkj} className="w-[70px]" />
              </div>
            </div>
          </div>

          {/* CIRCUIT LINES */}
          <div className="absolute left-[40px] space-y-8">
            <div className="w-[160px] h-[2px] bg-cyan-400 relative overflow-hidden">
              <div className="absolute w-10 h-full bg-white animate-[circuit_3s_linear_infinite]" />
            </div>

            <div className="w-[220px] h-[2px] bg-cyan-400 relative overflow-hidden">
              <div className="absolute w-10 h-full bg-white animate-[circuit_4s_linear_infinite]" />
            </div>

            <div className="w-[150px] h-[2px] bg-cyan-400 relative overflow-hidden">
              <div className="absolute w-10 h-full bg-white animate-[circuit_2.5s_linear_infinite]" />
            </div>
          </div>
        </div>
      </section>

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
