import { Project } from "../../data/Project";
import circlePurple from "../../assets/images/Bulat_Ungu.png";
import CircuitLine from "../../assets/images/Circuit_Line.png";

export default function ProjectSection() {
  const currentProject = Project[0];
  const allCards = currentProject.subDivisions.slice(0, 6); // maksimal 6 card

  return (
    <section id="project" className="relative py-32">
      {/* ================= BACKGROUND ================= */}

      {/* TOP RIGHT CIRCLE */}
      <img
        src={circlePurple}
        alt=""
        className="absolute -right-20 pointer-events-none select-none"
      />

      {/* BOTTOM LEFT CIRCLE */}
      <img
        src={circlePurple}
        alt=""
        className="absolute bottom-20 -left-20 pointer-events-none select-none"
      />

      {/* TITLE */}
      <p className="text-center font-semibold text-4xl mb-16 relative z-10">
        Our Project
      </p>

      {/* BLUR GLOW */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[400px] w-[1500px] h-[400px] bg-[#FF00FF] blur-[150px] opacity-40 rounded-full" />

      {/* CIRCUIT LINE */}
      <img
        src={CircuitLine}
        alt=""
        className="absolute left-0 top-1/2 -translate-y-1/4 w-full max-w-none z-0 pointer-events-none select-none"
      />

      {/* ================= CARD AREA ================= */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {allCards.map((item, index) => (
            <div
              key={index}
              className="rounded-[24px] p-8 border border-[#FF00FF] border-2 overflow-hidden"
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              {/* GAMBAR */}
              <div className="w-full h-[180px] bg-white/10 overflow-hidden">
                {item.gambar ? (
                  <img
                    src={item.gambar}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Placeholder kalau gambar belum ada
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* KONTEN */}
              <div className="py-6 flex flex-col gap-3">
                {/* TITLE */}
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>

                {/* DESC */}
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
