import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import purpleRing from "../../assets/images/purple_ring.png";
import cyanSide from "../../assets/images/Blue_Side.png";
import logoORWhite from "../../assets/images/Logo_OR_White.png";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { register } from "../../services/authServices";

import { useNavigate } from "react-router-dom";

const CIRCUIT_LINES = [
  {
    x: 0,
    y: 150,
    segments: [
      { dx: 60, dy: 0 },
      { dx: 0, dy: -40 },
      { dx: 80, dy: 0 },
    ],
    delay: 0.0,
  },
  {
    x: 0,
    y: 190,
    segments: [
      { dx: 90, dy: 0 },
      { dx: 0, dy: 30 },
      { dx: 60, dy: 0 },
    ],
    delay: 0.15,
  },
  {
    x: 0,
    y: 230,
    segments: [
      { dx: 50, dy: 0 },
      { dx: 0, dy: -40 },
      { dx: 100, dy: 0 },
    ],
    delay: 0.3,
  },
  {
    x: 0,
    y: 270,
    segments: [
      { dx: 120, dy: 0 },
      { dx: 0, dy: 30 },
      { dx: 80, dy: 0 },
    ],
    delay: 0.45,
  },
  {
    x: 0,
    y: 310,
    segments: [
      { dx: 70, dy: 0 },
      { dx: 0, dy: -30 },
      { dx: 110, dy: 0 },
    ],
    delay: 0.6,
  },
  {
    x: 0,
    y: 350,
    segments: [
      { dx: 100, dy: 0 },
      { dx: 0, dy: 40 },
      { dx: 70, dy: 0 },
    ],
    delay: 0.75,
  },
  {
    x: 0,
    y: 390,
    segments: [
      { dx: 60, dy: 0 },
      { dx: 0, dy: -50 },
      { dx: 90, dy: 0 },
    ],
    delay: 0.9,
  },
  {
    x: 0,
    y: 430,
    segments: [
      { dx: 130, dy: 0 },
      { dx: 0, dy: 40 },
      { dx: 60, dy: 0 },
    ],
    delay: 1.05,
  },
  {
    x: 0,
    y: 470,
    segments: [
      { dx: 80, dy: 0 },
      { dx: 0, dy: -40 },
      { dx: 100, dy: 0 },
    ],
    delay: 1.2,
  },
  {
    x: 0,
    y: 510,
    segments: [
      { dx: 50, dy: 0 },
      { dx: 0, dy: 50 },
      { dx: 90, dy: 0 },
    ],
    delay: 1.35,
  },
  {
    x: 0,
    y: 550,
    segments: [
      { dx: 110, dy: 0 },
      { dx: 0, dy: -40 },
      { dx: 80, dy: 0 },
    ],
    delay: 1.5,
  },
  {
    x: 40,
    y: 100,
    segments: [
      { dx: 0, dy: 200 },
      { dx: 40, dy: 0 },
      { dx: 0, dy: 150 },
    ],
    delay: 0.2,
  },
  {
    x: 100,
    y: 80,
    segments: [
      { dx: 0, dy: 180 },
      { dx: -40, dy: 0 },
      { dx: 0, dy: 200 },
    ],
    delay: 0.5,
  },
  {
    x: 160,
    y: 120,
    segments: [
      { dx: 0, dy: 160 },
      { dx: 50, dy: 0 },
      { dx: 0, dy: 140 },
    ],
    delay: 0.8,
  },
  {
    x: 0,
    y: 80,
    segments: [
      { dx: 80, dy: 0 },
      { dx: 0, dy: 50 },
      { dx: 60, dy: 0 },
    ],
    delay: 1.65,
  },
  {
    x: 0,
    y: 110,
    segments: [
      { dx: 120, dy: 0 },
      { dx: 0, dy: -30 },
    ],
    delay: 1.8,
  },
  {
    x: 30,
    y: 60,
    segments: [
      { dx: 60, dy: 0 },
      { dx: 0, dy: 80 },
    ],
    delay: 1.95,
  },
  {
    x: 0,
    y: 590,
    segments: [
      { dx: 90, dy: 0 },
      { dx: 0, dy: -50 },
      { dx: 70, dy: 0 },
    ],
    delay: 2.1,
  },
  {
    x: 0,
    y: 630,
    segments: [
      { dx: 140, dy: 0 },
      { dx: 0, dy: -60 },
    ],
    delay: 2.25,
  },
  {
    x: 50,
    y: 670,
    segments: [
      { dx: 100, dy: 0 },
      { dx: 0, dy: -80 },
      { dx: 80, dy: 0 },
    ],
    delay: 2.4,
  },
  {
    x: 140,
    y: 200,
    segments: [
      { dx: 80, dy: 0 },
      { dx: 0, dy: -40 },
      { dx: 60, dy: 0 },
    ],
    delay: 2.55,
  },
  {
    x: 200,
    y: 320,
    segments: [
      { dx: 60, dy: 0 },
      { dx: 0, dy: 40 },
      { dx: 50, dy: 0 },
    ],
    delay: 2.7,
  },
  {
    x: 170,
    y: 440,
    segments: [
      { dx: 70, dy: 0 },
      { dx: 0, dy: -30 },
      { dx: 50, dy: 0 },
    ],
    delay: 2.85,
  },
];

function CircuitBackground() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll(".circuit-path");
    const dots = svg.querySelectorAll(".circuit-dot");
    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      const delay = parseFloat(path.dataset.delay || 0);
      path.style.animation = `drawLine 1.0s ease forwards ${delay}s`;
    });
    dots.forEach((dot) => {
      const delay = parseFloat(dot.dataset.delay || 0) + 0.8;
      dot.style.opacity = 0;
      dot.style.animation = `fadeDot 0.4s ease forwards ${delay}s`;
    });
  }, []);

  const buildPath = (line) => {
    let d = `M ${line.x} ${line.y}`;
    let cx = line.x,
      cy = line.y;
    for (const seg of line.segments) {
      cx += seg.dx;
      cy += seg.dy;
      d += ` L ${cx} ${cy}`;
    }
    return { d, endX: cx, endY: cy };
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes fadeDot  { to { opacity: 1; } }
      `}</style>
      <defs>
        <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-dot" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {CIRCUIT_LINES.map((line, i) => {
        const { d, endX, endY } = buildPath(line);
        return (
          <g key={i}>
            <path
              className="circuit-path"
              d={d}
              stroke="#00d4ff"
              strokeWidth="1.5"
              fill="none"
              opacity="0.65"
              filter="url(#glow-cyan)"
              data-delay={line.delay}
            />
            <circle
              className="circuit-dot"
              cx={line.x}
              cy={line.y}
              r="2.5"
              fill="#00d4ff"
              filter="url(#glow-dot)"
              data-delay={line.delay}
            />
            <circle
              className="circuit-dot"
              cx={endX}
              cy={endY}
              r="2.5"
              fill="#00d4ff"
              filter="url(#glow-dot)"
              data-delay={line.delay}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  // Di dalam komponen Register():
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", nim: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* CYAN GLOW */}
      <img
        src={cyanSide}
        alt=""
        className="absolute lg:block pointer-events-none select-none"
        style={{
          top: "50%",
          left: "10px",
          transform: "translateY(-50%) scale(1.25)",
          height: "120vh",
          width: "auto",
          opacity: 0.9,
          zIndex: 0,
          filter: "blur(2px) drop-shadow(0 0 40px rgba(0,212,255,0.35))",
          WebkitMaskImage:
            "linear-gradient(to right, black 25%, rgba(0,0,0,0.9) 45%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, black 25%, rgba(0,0,0,0.9) 45%, transparent 100%)",
        }}
      />

      {/* LOGO — kanan atas */}
      <img
        src={logoORWhite}
        alt="Open Recruitment UKM Neo Telemetri 2026"
        className="absolute pointer-events-none select-none"
        style={{
          top: "20px",
          right: "24px",
          height: "40px",
          width: "auto",
          zIndex: 20,
          opacity: 1,
        }}
      />

      {/* PURPLE ARC — kanan atas */}
      <img
        src={purpleRing}
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          top: "-16%",
          right: "-10%",
          width: "540px",
          opacity: 0.92,
          zIndex: 0,
        }}
      />

      {/* PURPLE ARC — bawah tengah */}
      <img
        src={purpleRing}
        alt=""
        className="absolute lg:block pointer-events-none select-none"
        style={{
          bottom: "-16%",
          left: "33%",
          width: "500px",
          opacity: 0.85,
          transform: "rotate(180deg)",
          zIndex: 0,
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)",
        }}
      />

      {/* CIRCUIT LINES */}
      <CircuitBackground />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 items-center gap-8 lg:gap-12 py-24 lg:py-6">
        {/* LEFT */}
        <div
          className="text-white space-y-3 text-center hidden lg:block"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0.6) 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          }}
        >
          <p className="text-3xl tracking-widest font-bold">
            Hello! Welcome to
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Open Recruitment XV
            <br />
            <span>UKM Neo Telemetri</span>
          </h1>
        </div>

        {/* RIGHT — Card */}
        <div className="flex justify-center">
          <div
            className="w-full max-w-md rounded-3xl p-6 lg:p-8 text-white"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow:
                "0 0 40px rgba(0,200,255,0.08), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 tracking-wide">
              Daftar
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama */}
              <div>
                <label className="block text-white font-semibold mb-1 tracking-wide text-sm">
                  Nama Lengkap
                </label>
                <input
                  name="fullName"
                  onChange={handleChange}
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 rounded-full text-sm text-white placeholder-white/40 focus:outline-none transition"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(0,210,255,0.6)";
                    e.target.style.boxShadow = "0 0 12px rgba(0,210,255,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-1 tracking-wide text-sm">
                  Nim
                </label>
                <input
                  name="nim"
                  onChange={handleChange}
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 rounded-full text-sm text-white placeholder-white/40 focus:outline-none transition"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(0,210,255,0.6)";
                    e.target.style.boxShadow = "0 0 12px rgba(0,210,255,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-semibold mb-1 tracking-wide text-sm">
                  Email
                </label>
                <input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  placeholder="Masukkan email"
                  className="w-full px-4 py-3 rounded-full text-sm text-white placeholder-white/40 focus:outline-none transition"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(0,210,255,0.6)";
                    e.target.style.boxShadow = "0 0 12px rgba(0,210,255,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-white font-semibold mb-1 tracking-wide text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    className="w-full px-4 py-3 pr-12 rounded-full text-sm text-white placeholder-white/40 focus:outline-none transition"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(0,210,255,0.6)";
                      e.target.style.boxShadow = "0 0 12px rgba(0,210,255,0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(255,255,255,0.2)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Button */}
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full font-bold text-white transition-all duration-300 mt-4"
                style={{
                  background: "linear-gradient(to right, #A305A6, #12B2C1)",
                  boxShadow: "0 4px 20px rgba(163,5,166,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 6px 30px rgba(163,5,166,0.7)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(163,5,166,0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400 tracking-wider">
                Sudah memiliki akun?{" "}
                <Link
                  to="/login"
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
