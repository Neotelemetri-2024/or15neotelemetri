import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 min-h-screen pt-24 lg:pt-0 pb-12 lg:pb-0"
    >
      {/* GLOW BACKGROUND */}
      <div className="absolute -left-25 lg:-left-50 lg:top-1/2 top-1/4 -translate-y-1/2 w-70 h-70 lg:w-105 lg:h-105 rounded-full bg-[#FF00FF] blur-[80px] opacity-70 pointer-events-none" />

      {/* LEFT TEXT */}
      <div className="max-w-135 text-center lg:text-left z-10">
        <h1
          className="text-3xl lg:text-4xl leading-tight mb-8"
          style={{ fontFamily: "LandepzGlitch" }}
        >
          OPEN RECRUITMENT XV <br />
          UKM NEO TELEMETRI
        </h1>

        <p className="text-gray-300 my-8">
          Ayo! menjadi bagian dari Unit Kegiatan Mahasiswa berbasis IT terbesar
          di Universitas Andalas.
        </p>

        <div className="flex gap-6 lg:gap-16 justify-center lg:justify-start">
          <Link
            to="/register"
            className="px-8 lg:px-10 py-3 rounded-full font-bold bg-linear-to-r from-[#FF00FF] to-[#990099] shadow-lg shadow-purple-900/40 hover:scale-105 hover:shadow-xl active:scale-95 active:shadow-inner transition duration-200"
          >
            Daftar
          </Link>

          <Link
            to="/login"
            className="px-8 lg:px-10 py-3 rounded-full font-bold bg-[#2a2733] shadow-lg shadow-black/40 hover:bg-[#3a3647] hover:scale-105 active:scale-95 active:shadow-inner transition duration-200"
          >
            Masuk
          </Link>
        </div>
      </div>

      <div className="hidden lg:block absolute -right-75 top-1/2 -translate-y-1/2 w-155 h-155">
        {/* BLACK CIRCLE */}
        <div className="absolute inset-0 rounded-full bg-black border-2 border-cyan-400 shadow-[0_0_35px_#00ffff]" />

        {/* ORBIT SYSTEM */}
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] flex items-center justify-center">
          <div className="absolute rotate-0">
            <div className="-translate-y-90">
              <img src={logoProgramming} className="w-17.5" alt="Programming" />
            </div>
          </div>
          <div className="absolute rotate-120">
            <div className="-translate-y-90">
              <img src={logoMmd} className="w-17.5" alt="MMD" />
            </div>
          </div>
          <div className="absolute rotate-240">
            <div className="-translate-y-90">
              <img src={logoSkj} className="w-17.5" alt="SKJ" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE — orbit kecil di bawah teks */}
      <div className="lg:hidden relative w-65 h-65 mt-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-black border-2 border-cyan-400 shadow-[0_0_20px_#00ffff]" />
        <div className="absolute inset-0 animate-[spin_20s_linear_infinite] flex items-center justify-center">
          <div className="absolute rotate-0">
            <div className="-translate-y-36.25">
              <img
                src={logoProgramming}
                className="w-11.25"
                alt="Programming"
              />
            </div>
          </div>
          <div className="absolute rotate-120">
            <div className="-translate-y-36.25">
              <img src={logoMmd} className="w-11.25" alt="MMD" />
            </div>
          </div>
          <div className="absolute rotate-240">
            <div className="-translate-y-36.25">
              <img src={logoSkj} className="w-11.25" alt="SKJ" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
