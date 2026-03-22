import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";

const achievements = [
  { title: "", desc: "" },
  { title: "", desc: "" },
  { title: "", desc: "" },
  { title: "", desc: "" },
  { title: "", desc: "" },
  { title: "", desc: "" },
];

export default function AchievementSection() {
  return (
    <section id="achievement" className="relative py-8">

      {/* LOGO KANAN ATAS */}
      <img
        src={logoSkj}
        alt="Logo SKJ"
        className="absolute top-6 -right-6 opacity-50 pointer-events-none select-none z-10"
      />

      {/* LOGO KIRI TENGAH */}
      <img
        src={logoMmd}
        alt="Logo MMD"
        className="absolute top-1/2 -translate-y-1/2 -left-4 opacity-50 pointer-events-none select-none z-10"
      />

      {/* LOGO KANAN BAWAH */}
      <img
        src={logoProgramming}
        alt="Logo Programming"
        className="absolute bottom-0 -right-4 opacity-50 rotate-12 pointer-events-none select-none z-10"
      />

      {/* TITLE */}
      <p className="text-center font-bold text-3xl lg:text-4xl mb-10 lg:mb-14 relative z-10 text-white">
        Our Achievement
      </p>

      {/* GRID */}
      <div className="relative z-10 mx-auto px-6 lg:px-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {achievements.map((item, index) => (
            <div
              key={index}
              className="relative rounded-[14px] px-6 py-5 min-h-[64px] flex flex-col justify-center"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid transparent",
                backgroundClip: "padding-box",
                boxShadow: `
                  0 0 0 1.5px #01D6D618,
                  0 4px 0 1.5px #01D6D640,
                  0 8px 0 1.5px #01D6D666,
                  0 12px 24px 0 #01D6D630
                `,
              }}
            >
              {/* Border atas */}
              <div
                className="absolute inset-x-0 top-0 h-[1.5px] rounded-t-[14px]"
                style={{
                  background: "linear-gradient(90deg, transparent, #01D6D6AA, transparent)",
                }}
              />

              {/* Border kiri */}
              <div
                className="absolute inset-y-0 left-0 w-[1.5px] rounded-l-[14px]"
                style={{
                  background: "linear-gradient(180deg, #01D6D640 0%, #01D6D666 100%)",
                }}
              />

              {/* Border kanan */}
              <div
                className="absolute inset-y-0 right-0 w-[1.5px] rounded-r-[14px]"
                style={{
                  background: "linear-gradient(180deg, #01D6D640 0%, #01D6D666 100%)",
                }}
              />

              {/* Border bawah */}
              <div
                className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-[14px]"
                style={{
                  background: "linear-gradient(90deg, transparent, #01D6D6CC, transparent)",
                  boxShadow: "0 2px 12px 0 #01D6D688",
                }}
              />

              {/* Konten */}
              {item.title && (
                <h4 className="text-white font-semibold text-base">{item.title}</h4>
              )}
              {item.desc && (
                <p className="text-white/60 text-sm mt-1">{item.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}