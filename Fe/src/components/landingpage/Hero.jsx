import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

function CircularCarousel({ logos, alts, radius, logoSize }) {
  const containerRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const count = logos.length;
    const speed = 0.4;

    const render = () => {
      if (!containerRef.current) return;
      angleRef.current = (angleRef.current + speed) % 360;

      const items = containerRef.current.querySelectorAll(".orbit-item");
      items.forEach((el, i) => {
        const baseAngle = (angleRef.current + (360 / count) * i) % 360;
        const rad = (baseAngle * Math.PI) / 180;

        const x = radius * Math.cos(rad);
        const y = radius * Math.sin(rad);

        const cosVal = Math.cos(rad);
        const t = (-cosVal + 1) / 2;
        const scale = logoSize.min + (logoSize.max - logoSize.min) * t;
        const opacity = 0.4 + 0.6 * t;
        const zIndex = Math.round(10 + t * 20);

        // glow smooth mengikuti putaran
        const glowStrength = t;

        // easing biar halus (smoothstep)
        const smooth = glowStrength * glowStrength * (3 - 2 * glowStrength);

        // TANPA Math.round
        const glowSize = smooth * 22;
        const glowOpacity = smooth * 0.9;

        const glow = `drop-shadow(0 0 ${glowSize}px rgba(255, 0, 255, ${glowOpacity}))`;

        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.width = `${scale}px`;
        el.style.height = `${scale}px`;
        el.style.opacity = opacity;
        el.style.zIndex = zIndex;
        el.style.filter = glow;
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [logos, radius, logoSize]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center"
      style={{ pointerEvents: "none" }}
    >
      {logos.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={alts[i]}
          className="orbit-item absolute object-contain"
          style={{
            width: logoSize.min,
            height: logoSize.min,
            willChange: "transform, opacity, filter",
          }}
        />
      ))}
    </div>
  );
}

function CircularCarousel3D({ logos, alts, radius, logoSize, layer }) {
  const containerRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const count = logos.length;
    const speed = 0.4;

    const render = () => {
      if (!containerRef.current) return;
      angleRef.current = (angleRef.current + speed) % 360;

      const items = containerRef.current.querySelectorAll(".orbit-item-3d");
      items.forEach((el, i) => {
        const baseAngle = (angleRef.current + (360 / count) * i) % 360;
        const rad = (baseAngle * Math.PI) / 180;

        const x = radius * Math.cos(rad);
        const y = radius * Math.sin(rad) * 0.35 + radius * Math.cos(rad) * 0.25;

        const sinVal = Math.sin(rad);
        const cosVal = Math.cos(rad);
        const depth = sinVal - cosVal * 0.5;
        const t = (-depth + 1.5) / 3;
        const isFront = depth <= 0;
        const scale = logoSize.min + (logoSize.max - logoSize.min) * t;
        const opacity = 0.25 + 0.75 * t;
        // const glowSize = Math.round(t * 16);
        // glow mengikuti posisi (smooth in & out)
        const glowStrength = t; // langsung pakai t (0 → 1)

        // optional: biar lebih smooth pakai easing
        const smooth = glowStrength * glowStrength * (3 - 2 * glowStrength);
        // ini easing smoothstep

        const glowSize = smooth * 20; // besar glow
        const glowOpacity = smooth; // transparansi glow

        const glow = `drop-shadow(0 0 ${glowSize}px rgba(255, 0, 255, ${glowOpacity}))`;

        if (layer === "back") {
          el.style.display = isFront ? "none" : "block";
          el.style.zIndex = 5;
        } else {
          el.style.display = isFront ? "block" : "none";
          el.style.zIndex = 20;
        }

        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.width = `${scale}px`;
        el.style.height = `${scale}px`;
        el.style.opacity = opacity;
        el.style.filter = glow;
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [logos, radius, logoSize, layer]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center"
      style={{ pointerEvents: "none" }}
    >
      {logos.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={alts[i]}
          className="orbit-item-3d absolute object-contain"
          style={{
            width: logoSize.min,
            height: logoSize.min,
            willChange: "transform, opacity, filter",
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const logos = [logoProgramming, logoMmd, logoSkj];
  const alts = ["Programming", "MMD", "SKJ"];

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
          OPEN RECRUITMENT 15 <br />
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

      {/* DESKTOP */}
      <div className="hidden lg:block absolute -right-75 top-1/2 -translate-y-1/2 w-155 h-155">
        <div className="absolute inset-0 rounded-full bg-black border-2 border-cyan-400 shadow-[0_0_35px_#00ffff]" />
      </div>

      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 w-80 h-80 right-40">
        <CircularCarousel
          logos={logos}
          alts={alts}
          radius={180}
          logoSize={{ max: 150, min: 70 }}
        />
      </div>

      {/* MOBILE */}
      <div className="lg:hidden relative w-65 h-65 mt-10 flex items-center justify-center">
        <CircularCarousel3D
          logos={logos}
          alts={alts}
          radius={130}
          logoSize={{ max: 52, min: 20 }}
          layer="back"
        />

        <div
          className="absolute inset-0 rounded-full bg-black border-2 border-cyan-400 shadow-[0_0_20px_#00ffff]"
          style={{ zIndex: 15 }}
        />

        <CircularCarousel3D
          logos={logos}
          alts={alts}
          radius={130}
          logoSize={{ max: 80, min: 30 }}
          layer="front"
        />
      </div>
    </section>
  );
}
