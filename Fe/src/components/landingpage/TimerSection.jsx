import { useState, useEffect } from "react";
import TimerUngu from "../../assets/images/Timer_Ungu.png";

const TARGET_DATE = new Date("2026-04-04T00:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBox({ value, label }) {
  const padded = String(value).padStart(2, "0");
  const digits = padded.split("");

  return (
    <div className="flex flex-col items-center gap-1 md:gap-3">
      <div className="flex gap-1 md:gap-2">
        {digits.map((digit, i) => (
          <div
            key={i}
            className="w-[40px] h-[40px] md:w-[70px] md:h-[70px] flex items-center justify-center text-white text-lg md:text-3xl font-bold rounded-lg"
            style={{
              background: "rgba(80, 40, 120, 0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.5px solid rgba(180, 100, 255, 0.35)",
              boxShadow:
                "0 4px 24px 0 rgba(160,60,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            {digit}
          </div>
        ))}
      </div>
      <span className="text-white/60 text-[10px] md:text-sm tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-screen py-12 md:py-24 flex flex-col items-center justify-center overflow-hidden">
      
      {/* BACKGROUND */}
      <img
        src={TimerUngu}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 overflow-hidden"
      />

      {/* TITLE */}
      <p className="relative z-10 text-white text-lg md:text-3xl font-bold mb-6 md:mb-12 text-center px-4">
        We Are coming <span className="text-white/60">Soon!</span>
      </p>

      {/* COUNTDOWN */}
      <div className="relative z-10 flex flex-wrap justify-center items-center gap-3 md:gap-8 px-4">
        
        <TimeBox value={timeLeft.days} label="Days" />

        <span className="hidden md:block text-white/60 text-4xl">:</span>

        <TimeBox value={timeLeft.hours} label="Hours" />

        <span className="hidden md:block text-white/60 text-4xl">:</span>

        <TimeBox value={timeLeft.minutes} label="Minutes" />

        <span className="hidden md:block text-white/60 text-4xl">:</span>

        <TimeBox value={timeLeft.seconds} label="Seconds" />
      </div>
    </section>
  );
}