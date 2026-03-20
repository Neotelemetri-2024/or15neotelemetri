// import { useState } from "react";

// const divisions = [
//   "Programming",
//   "Multimedia dan Desain",
//   "Sistem Komputer dan Jaringan",
// ];

// export default function DivisionTabs() {
//   const [activeDivision, setActiveDivision] = useState(0);

// components/shared/DivisionTabs.jsx

import { useState } from "react";

const DEFAULT_DIVISIONS = [
  "Programming",
  "Multimedia dan Desain",
  "Sistem Komputer dan Jaringan",
];

export default function DivisionTabs({
  divisions = DEFAULT_DIVISIONS,
  bgColor = "#1a0023",
  onChange,
  children,
}) {
  const [active, setActive] = useState(0);

  function handleClick(i) {
    setActive(i);
    onChange?.(divisions[i], i); // opsional: kalau halaman butuh tau divisi aktif
  }

  return (
    <div className="relative rounded-2xl overflow-visible">
      {/* TAB BAR */}
      <div className="relative z-10">
        <div
          className="relative w-full h-[70px] bg-white rounded-t-2xl border-b flex items-center justify-center"
          style={{ borderColor: "rgba(0,0,0,0.06)" }}
        >
          <ul className="flex w-full relative">
            {divisions.map((div, i) => {
              const isActive = active === i;
              return (
                <li
                  key={div}
                  onClick={() => handleClick(i)}
                  className="relative flex-1 h-[70px] list-none z-10 cursor-pointer"
                >
                  <div className="flex items-center justify-center w-full h-full text-center px-2">
                    <span
                      className={`text-[11px] font-semibold transition-all duration-500 leading-tight text-center
                        ${isActive ? "-translate-y-8 text-white" : "text-[#501A5E] opacity-70"}`}
                    >
                      {div}
                    </span>
                  </div>
                </li>
              );
            })}

            {/* INDICATOR */}
            <div
              className="absolute top-[-50%] h-[70px] rounded-full border-[6px] transition-all duration-500"
              style={{
                width: `${100 / divisions.length}%`,
                transform: `translateX(${active * 100}%)`,
                background: "linear-gradient(45deg, #7B2FBE, #501A5E)",
                borderColor: bgColor,
              }}
            >
              <div
                className="absolute top-1/2 left-[-22px] w-[20px] h-[20px] bg-transparent rounded-tr-[20px]"
                style={{ boxShadow: `1px -10px 0 ${bgColor}` }}
              />
              <div
                className="absolute top-1/2 right-[-22px] w-[20px] h-[20px] bg-transparent rounded-tl-[20px]"
                style={{ boxShadow: `-1px -10px 0 ${bgColor}` }}
              />
            </div>
          </ul>
        </div>
      </div>

      {/* KONTEN — apapun yang ada di dalam tag DivisionTabs */}
      <div className="rounded-b-2xl overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}