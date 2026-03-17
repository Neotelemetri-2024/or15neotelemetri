import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserLayout from "../../components/user/LayoutUser";

const dummyQuestions = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  question: `Pertanyaan ${i + 1} :\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu massa arcu. Aliquam`,
  options: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu massa arcu. Aliquam",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu massa arcu. Aliquam",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu massa arcu. Aliquam",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu massa arcu. Aliquam",
  ],
}));

const TOTAL_SECONDS = 60 * 60; // 60 menit

function formatTime(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function UjianPengerjaan() {
  const { divisi } = useParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);

  const divisiLabel =
    {
      programming: "Programming",
      mmd: "Multimedia & Desain",
      skj: "Sistem Komputer dan Jaringan",
    }[divisi] ?? "Ujian";

  // ===== TIMER =====
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const currentQ = dummyQuestions[currentIndex];

  const handleAnswer = (optIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
  };

  const handleNext = () => {
    if (currentIndex < dummyQuestions.length - 1) setCurrentIndex((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
  };

  return (
    <UserLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-6">
        {/* ===== TOP BAR ===== */}
        <div className="flex items-center justify-between">
          {/* JUDUL DIVISI */}
          <div
            className="px-10 py-3 rounded-full text-white font-semibold text-base"
            style={{
              background: "rgba(180,60,220,0.25)",
              border: "1.5px solid rgba(255,0,255,0.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {divisiLabel}
          </div>

          {/* TIMER */}
          <div
            className="px-8 py-3 rounded-full text-white font-semibold text-base tracking-widest"
            style={{
              background: "rgba(180,60,220,0.20)",
              border: "1.5px solid rgba(255,0,255,0.35)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              color: timeLeft < 300 ? "#FF6666" : "white",
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* ===== NOMOR SOAL ===== */}
        <div className="flex gap-3">
          {dummyQuestions.map((q, i) => {
            const isActive = i === currentIndex;
            const isAnswered = answers[q.id] !== undefined;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-110"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg,#FF00FF,#990099)"
                    : isAnswered
                      ? "rgba(255,0,255,0.25)"
                      : "rgba(255,255,255,0.12)",
                  border: isActive
                    ? "none"
                    : isAnswered
                      ? "1px solid rgba(255,0,255,0.5)"
                      : "1px solid rgba(255,255,255,0.2)",
                  color:
                    isActive || isAnswered ? "white" : "rgba(255,255,255,0.6)",
                  boxShadow: isActive ? "0 0 12px #FF00FF55" : "none",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* ===== SOAL BOX ===== */}
        <div
          className="flex-1 rounded-2xl px-8 py-7 flex flex-col gap-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,0,255,0.25)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* PERTANYAAN */}
          <div>
            <p className="text-white/60 text-xs mb-2">
              Pertanyaan {currentQ.id} :
            </p>
            <p className="text-white/90 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              eu massa arcu. Aliquam
            </p>
          </div>

          {/* OPSI JAWABAN */}
          <div className="flex flex-col gap-3">
            {currentQ.options.map((opt, oi) => {
              const isChosen = answers[currentQ.id] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(oi)}
                  className="flex items-center gap-4 px-5 py-4 rounded-full text-left text-sm transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: isChosen
                      ? "rgba(255,0,255,0.25)"
                      : "rgba(255,255,255,0.06)",
                    border: isChosen
                      ? "1.5px solid #FF00FF"
                      : "1.5px solid rgba(255,255,255,0.12)",
                    color: isChosen ? "white" : "rgba(255,255,255,0.70)",
                    boxShadow: isChosen
                      ? "0 0 16px rgba(255,0,255,0.2)"
                      : "none",
                  }}
                >
                  {/* RADIO INDICATOR */}
                  <span
                    className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{
                      border: isChosen
                        ? "2px solid #FF00FF"
                        : "2px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    {isChosen && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#FF00FF" }}
                      />
                    )}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== BOTTOM NAV ===== */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-10 py-3 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background:
                currentIndex === 0
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(90deg,#FF00FF,#990099)",
              border:
                currentIndex === 0
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "none",
              opacity: currentIndex === 0 ? 0.4 : 1,
              boxShadow:
                currentIndex === 0 ? "none" : "0 3px 16px rgba(255,0,255,0.3)",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            Sebelumnya
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === dummyQuestions.length - 1}
            className="px-10 py-3 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background:
                currentIndex === dummyQuestions.length - 1
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(90deg,#FF00FF,#990099)",
              border:
                currentIndex === dummyQuestions.length - 1
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "none",
              opacity: currentIndex === dummyQuestions.length - 1 ? 0.4 : 1,
              boxShadow:
                currentIndex === dummyQuestions.length - 1
                  ? "none"
                  : "0 3px 16px rgba(255,0,255,0.3)",
              cursor:
                currentIndex === dummyQuestions.length - 1
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
