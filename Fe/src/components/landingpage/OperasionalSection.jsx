import { useState } from "react";
import { operasional } from "../../data/Division";
import circleBlue from "../../assets/images/Bulat_Biru.png";
import CircuitLine from "../../assets/images/Circuit_Line.png";

export default function id() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippingCards, setFlippingCards] = useState([]);

  const changeDivision = (direction) => {
    if (flippingCards.length > 0) return;

    const total = operasional[currentIndex].subDivisions.length;

    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        setFlippingCards((prev) => [...prev, i]);
      }, i * 120);
    }

    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (direction === "next") {
          return (prev + 1) % operasional.length;
        } else {
          return prev === 0 ? operasional.length - 1 : prev - 1;
        }
      });
      setFlippingCards([]);
    }, total * 120 + 300);
  };

  const currentDivision = operasional[currentIndex];

  return (
    <section  className="relative overflow-hidden py-20 lg:py-32">
      {/* BACKGROUND */}
      <img
        src={circleBlue}
        alt=""
        className="absolute -right-20 pointer-events-none select-none"
      />
      <img
        src={circleBlue}
        alt=""
        className="absolute bottom-20 -left-20 pointer-events-none select-none"
      />

      {/* TITLE */}
      <p className="text-center font-semibold text-3xl lg:text-4xl mb-12 lg:mb-16 relative z-10">
        Operasional
      </p>

      {/* BLUR GLOW */}
      <div className="absolute left-1/2 -translate-x-1/2 top-50 w-375 h-100 bg-[#0D8A9E] blur-[120px] opacity-40 rounded-full" />
      <img
        src={CircuitLine}
        alt=""
        className="absolute left-0 top-1/2 -translate-y-1/4 w-full max-w-none z-0 pointer-events-none select-none"
        style={{ filter: "invert(1) sepia(1) saturate(5) hue-rotate(150deg)" }}
      />

      <div className="relative z-10 max-w-300 mx-auto px-6 lg:px-16">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <img src={currentDivision.logo} className="w-12 lg:w-15" />
          <h2 className="text-2xl lg:text-3xl font-semibold">
            {currentDivision.name}
          </h2>
        </div>

        {/* CARD AREA */}
        <div className="relative">
          {/* GRID */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch px-0 lg:px-4">
            {currentDivision.subDivisions.map((item, index) => {
              const isFlipped = flippingCards.includes(index);

              return (
                <div key={index} className="h-full" style={{ perspective: "1000px" }}>
                  <div
                    className="relative transition-all duration-500"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* FRONT */}
                    <div
                      className="rounded-3xl border-4 border-white h-full backdrop-blur-3xl"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="flex flex-col h-110 rounded-3xl px-6 lg:px-8 py-8 lg:py-10 text-center">
                        <h3 className="text-xl lg:text-2xl font-semibold pb-6 lg:pb-8">
                          {item.title}
                        </h3>
                        <p className="text-white/70 text-justify flex-1 overflow-hidden">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      className="absolute inset-0 p-0.5 rounded-3xl border border-cyan-400/40 backdrop-blur-3xl"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="h-110 w-full rounded-3xl flex items-center justify-center">
                        <span className="text-cyan-300 text-lg">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BUTTON LEFT */}
          <button
            onClick={() => changeDivision("prev")}
            className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-black/70 border border-[#01FFFF]/40 flex items-center justify-center text-[#01FFFF] text-lg lg:text-xl font-bold hover:scale-110 transition z-20"
          >
            ❮
          </button>

          {/* BUTTON RIGHT */}
          <button
            onClick={() => changeDivision("next")}
            className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-black/70 border border-[#01FFFF]/40 flex items-center justify-center text-[#01FFFF] text-lg lg:text-xl font-bold hover:scale-110 transition z-20"
          >
            ❯
          </button>
        </div>
      </div>
    </section>
  );
}