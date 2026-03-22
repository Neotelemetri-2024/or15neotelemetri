import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import { startExam, submitExam } from "../../services/examServices";
import api from "../../components/api/axios";

export default function UjianPengerjaan() {
  const navigate = useNavigate();
  const location = useLocation();
  const examId = location.state?.examId;

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef(null);

  // ── START EXAM ─────────────────────────────────────────────────
  useEffect(() => {
    if (!examId) {
      navigate("/ujian");
      return;
    }

    const init = async () => {
      try {
        // 1. Mulai attempt
        const attemptRes = await startExam(examId);
        console.log("=== startExam response ===", attemptRes.data);
        setAttempt(attemptRes.data);

        // 2. Fetch soal dari endpoint user (GET /exams/user/:id)
        const examRes = await api.get(`/exams/user/${examId}`);
        console.log("=== exam detail response ===", examRes.data);

        const qs = examRes.data.questions || [];
        setQuestions([...qs].sort((a, b) => a.orderIndex - b.orderIndex));

        const duration = examRes.data.durationMinutes || 60;
        setTimeLeft(duration * 60);
      } catch (err) {
        console.log("=== ERROR ===", err.response?.status, err.response?.data);
        setErrorMsg(err.response?.data?.message || "Gagal memulai ujian.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [examId]);

  // ── SUBMIT ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (isTimeout = false) => {
      if (submitting) return;
      setSubmitting(true);
      clearInterval(timerRef.current);

      try {
        const formattedAnswers = Object.entries(answers).map(
          ([questionId, ans]) => ({
            questionId,
            ...(ans.chosenChoiceId && { chosenChoiceId: ans.chosenChoiceId }),
            ...(ans.textAnswer && { textAnswer: ans.textAnswer }),
          })
        );

        const res = await submitExam(attempt.id, formattedAnswers);
        navigate("/ujianhasil", {
          state: { result: res.data, isTimeout },
          replace: true,
        });
      } catch (err) {
        console.error("Gagal submit:", err);
        setErrorMsg("Gagal mengirim jawaban. Coba lagi.");
        setSubmitting(false);
      }
    },
    [answers, attempt, submitting, navigate]
  );

  // ── TIMER ──────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0 || loading) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, timeLeft > 0]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (questionId, value, type = "choice") => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]:
        type === "choice" ? { chosenChoiceId: value } : { textAnswer: value },
    }));
  };

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeLeft <= 300;

  // ── LOADING ────────────────────────────────────────────────────
  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat soal ujian...</p>
        </div>
      </UserLayout>
    );
  }

  // ── ERROR ──────────────────────────────────────────────────────
  if (errorMsg && !attempt) {
    return (
      <UserLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-sm">{errorMsg}</p>
          <button
            onClick={() => navigate("/ujian")}
            className="px-6 py-3 rounded-full text-white text-sm"
            style={{ background: "linear-gradient(90deg,#FF00FF,#CC00CC)" }}
          >
            Kembali
          </button>
        </div>
      </UserLayout>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4 pb-10">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-base">
              {attempt?.exam?.title || "Ujian"}
            </h1>
            <p className="text-white/50 text-xs mt-0.5">
              {answeredCount}/{questions.length} soal dijawab
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
            style={{
              background: isTimeWarning ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.1)",
              border: isTimeWarning ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.15)",
              color: isTimeWarning ? "#ef4444" : "white",
            }}
          >
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
              background: "linear-gradient(90deg,#FF00FF,#CC00CC)",
            }}
          />
        </div>

        {/* NOMOR SOAL */}
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isCurrent
                    ? "linear-gradient(135deg,#FF00FF,#990099)"
                    : isAnswered
                    ? "rgba(255,0,255,0.2)"
                    : "rgba(255,255,255,0.1)",
                  border: isCurrent
                    ? "none"
                    : isAnswered
                    ? "1px solid rgba(255,0,255,0.4)"
                    : "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  boxShadow: isCurrent ? "0 0 10px rgba(255,0,255,0.4)" : "none",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* SOAL */}
        {currentQ ? (
          <div
            className="flex flex-col gap-5 p-6 rounded-2xl flex-1"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-white text-sm leading-relaxed flex-1">
                <span className="font-bold text-[#FF00FF] mr-2">{currentIdx + 1}.</span>
                {currentQ.prompt}
              </p>
              <span className="text-white/40 text-xs shrink-0">{currentQ.points} poin</span>
            </div>

            {/* MCQ */}
            {currentQ.type === "MCQ" && (
              <div className="flex flex-col gap-3">
                {[...currentQ.choices]
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((choice) => {
                    const isChosen = answers[currentQ.id]?.chosenChoiceId === choice.id;
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleAnswer(currentQ.id, choice.id, "choice")}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                        style={{
                          background: isChosen ? "rgba(255,0,255,0.2)" : "rgba(255,255,255,0.06)",
                          border: isChosen ? "1.5px solid #FF00FF" : "1px solid rgba(255,255,255,0.12)",
                          color: isChosen ? "white" : "rgba(255,255,255,0.75)",
                          boxShadow: isChosen ? "0 0 12px rgba(255,0,255,0.2)" : "none",
                        }}
                      >
                        {choice.label}
                      </button>
                    );
                  })}
              </div>
            )}

            {/* TRUE/FALSE */}
            {currentQ.type === "TRUE_FALSE" && (
              <div className="flex gap-3">
                {["Benar", "Salah"].map((opt) => {
                  const isChosen = answers[currentQ.id]?.textAnswer === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(currentQ.id, opt, "text")}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: isChosen ? "rgba(255,0,255,0.2)" : "rgba(255,255,255,0.06)",
                        border: isChosen ? "1.5px solid #FF00FF" : "1px solid rgba(255,255,255,0.12)",
                        color: isChosen ? "white" : "rgba(255,255,255,0.75)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* SHORT TEXT */}
            {currentQ.type === "SHORT_TEXT" && (
              <textarea
                value={answers[currentQ.id]?.textAnswer || ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value, "text")}
                placeholder="Tulis jawabanmu di sini..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-white/40 text-sm">Tidak ada soal tersedia.</p>
          </div>
        )}

        {/* NAVIGASI */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIdx((p) => Math.max(p - 1, 0))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm text-white transition disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((p) => Math.min(p + 1, questions.length - 1))}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm text-white transition"
              style={{ background: "linear-gradient(90deg,#FF00FF,#990099)" }}
            >
              Selanjutnya <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg,#FF00FF,#CC00CC)",
                boxShadow: "0 4px 20px rgba(255,0,255,0.4)",
              }}
            >
              {submitting ? "Mengirim..." : "Kumpulkan Ujian"}
            </button>
          )}
        </div>

        {errorMsg && (
          <p className="text-red-400 text-sm text-center">{errorMsg}</p>
        )}
      </div>
    </UserLayout>
  );
}