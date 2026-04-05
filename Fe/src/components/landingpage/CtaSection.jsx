// components/landingpage/CTASection.jsx
import CircuitLineUngu from "../../assets/images/Circuit_Ungu_Kiri.png";

export default function CTASection() {
  return (
    <section className="relative py-16 overflow-hidden">
      <img
        src={CircuitLineUngu}
        alt=""
        className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
        style={{
          filter: "invert(20%) sepia(100%) saturate(5000%) hue-rotate(270deg) brightness(0.8)",
          maxWidth: "45%",
        }}
      />
      <img
        src={CircuitLineUngu}
        alt=""
        className="hidden lg:block absolute right-0 top-1/2 pointer-events-none select-none z-0"
        style={{
          filter: "invert(20%) sepia(100%) saturate(5000%) hue-rotate(270deg) brightness(0.8)",
          maxWidth: "45%",
          transform: "translateY(-50%) scaleX(-1)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 lg:gap-8 px-6 text-center">
        <h2 className="text-white text-xl lg:text-3xl font-semibold max-w-[600px] leading-snug">
          Tertarik untuk menjadi bagian dari Neo Telemetri?
        </h2>
        <a
          href="/register"
          className="px-8 lg:px-10 py-3 rounded-full text-white font-semibold text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_32px_4px_#FF00FF55]"
          style={{
            background: "linear-gradient(135deg, #FF00FF 0%, #990099 100%)",
            boxShadow: "0 4px 24px 0 #FF00FF44, inset 0 1px 0 rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,0,255,0.4)",
          }}
        >
          Ayo Daftar !
        </a>
      </div>
    </section>
  );
}