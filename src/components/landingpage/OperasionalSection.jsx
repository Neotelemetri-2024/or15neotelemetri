import { useState } from "react";
import { operasional } from "../../data/Division";
import circleBlue from "../../assets/images/Bulat_Biru.png";
import CircuitLine from "../../assets/images/Circuit_Line.png";

export default function OperasionalSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippingCards, setFlippingCards] = useState([]);

  const changeDivision = (direction) => {
    if (flippingCards.length > 0) return;

    const total = operasional[currentIndex].subDivisions.length;

    // flip satu-satu
    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        setFlippingCards((prev) => [...prev, i]);
      }, i * 120);
    }

    // setelah flip selesai → ganti divisi
    setTimeout(
      () => {
        setCurrentIndex((prev) => {
          if (direction === "next") {
            return (prev + 1) % operasional.length;
          } else {
            return prev === 0 ? operasional.length - 1 : prev - 1;
          }
        });

        setFlippingCards([]);
      },
      total * 120 + 300,
    );
  };

  const currentDivision = operasional[currentIndex];

  return (
    <section id="division" className="relative overflow-hidden py-32">
      {/* ================= BACKGROUND ================= */}

      {/* TOP RIGHT CIRCLE (SETENGAH) */}
      <img
        src={circleBlue}
        alt=""
        className="absolute  -right-20  pointer-events-none select-none"
      />

      {/* BOTTOM LEFT CIRCLE (SETENGAH) */}
      <img
        src={circleBlue}
        alt=""
        className="absolute bottom-20 -left-20  pointer-events-none select-none"
      />

      {/* TITLE */}
      <p className="text-center font-semibold text-4xl mb-16 relative z-10">
        Operasional
      </p>

      {/* BLUR GLOW */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[200px] w-[1500px] h-[400px] bg-[#0D8A9E] blur-[120px] opacity-40 rounded-full" />
      <img
        src={CircuitLine}
        alt=""
        className="absolute left-0 top-1/2 -translate-y-1/4 w-full max-w-none z-0 pointer-events-none select-none"
        style={{
          filter: "invert(1) sepia(1) saturate(5) hue-rotate(150deg)",
        }}
      />
      <div className="relative z-10 max-w-[1200px] mx-auto px-16">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <img src={currentDivision.logo} className="w-[60px]" />
          <h2 className="text-3xl font-semibold">{currentDivision.name}</h2>
        </div>

        {/* ================= CARD AREA ================= */}
        <div className="relative ">
          {/* OPTIONAL FADE (BIAR LEBIH HALUS) */}
          <div className="absolute inset-0 z-[1]" />

          {/* GRID */}
          <div className="relative px-4 z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {currentDivision.subDivisions.map((item, index) => {
              const isFlipped = flippingCards.includes(index);

              return (
                <div
                  key={index}
                  className="h-full"
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className="relative transition-all duration-500"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                    }}
                  >
                    {/* FRONT */}
                    <div
                      className=" rounded-[24px] border border-white border-4 h-full backdrop-blur-3xl"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="flex flex-col h-[400px] rounded-[24px]  px-8 py-10 text-center">
                        <h3 className="text-2xl font-semibold pb-8">
                          {item.title}
                        </h3>

                        <p className="text-white/70 text-justify flex-1 overflow-hidden">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      className="absolute inset-0 p-[2px] rounded-[24px] border border-cyan-400/40 backdrop-blur-3xl"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="h-[400px] w-full rounded-[24px]  flex items-center justify-center ">
                        <span className="text-cyan-300 text-lg">
                          Loading...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* BUTTON LEFT */}
            <button
              onClick={() => changeDivision("prev")}
              className="absolute -left-12 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/70 border border-[#01FFFF]/40 flex items-center justify-center text-[#01FFFF] text-xl font-bold hover:scale-110 transition"
            >
              ❮
            </button>

            {/* BUTTON RIGHT */}
            <button
              onClick={() => changeDivision("next")}
              className="absolute -right-12 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/70 border border-[#01FFFF]/40 flex items-center justify-center text-[#01FFFF] text-xl font-bold hover:scale-110 transition"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
