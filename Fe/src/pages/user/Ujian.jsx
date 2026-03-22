import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";
import UserLayout from "../../components/user/LayoutUser";
import { getMyProfile } from "../../services/userServices";
import { getAvailableExams } from "../../services/examServices";

const rules = [
  "Setiap peserta diberikan waktu maksimal 60 menit untuk menyelesaikan seluruh soal. Pastikan memanfaatkan waktu dengan baik.",
  "Ujian harus dikerjakan menggunakan koneksi jaringan yang stabil untuk menghindari kendala teknis selama pengerjaan.",
  "Peserta wajib menjawab semua soal secara jujur dan mandiri tanpa bantuan pihak lain atau sumber eksternal.",
  "Selama ujian berlangsung, peserta tidak diperbolehkan keluar atau berpindah dari halaman ujian, kecuali jika telah selesai mengerjakan.",
  "Setiap peserta hanya memiliki satu kali kesempatan untuk mengikuti ujian, jadi pastikan mempersiapkan diri dengan baik.",
  "Peserta yang terbukti melakukan kecurangan, keluar dari halaman ujian tanpa alasan jelas, atau melanggar aturan akan didiskualifikasi dari proses seleksi.",
  "Jika ada pertanyaan atau kendala, hubungi Hafid (0831-8195-9775), Daffa (0877-3905-9370)",
];

// Mapping nama divisi ke logo
const DIVISION_LOGOS = {
  programming:  logoProgramming,
  mmd:          logoMmd,
  multimedia:   logoMmd,
  skj:          logoSkj,
  sistem:       logoSkj,
};

const getLogoByName = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("programming")) return logoProgramming;
  if (lower.includes("multimedia") || lower.includes("mmd") || lower.includes("desain")) return logoMmd;
  if (lower.includes("sistem") || lower.includes("jaringan") || lower.includes("skj")) return logoSkj;
  return logoProgramming; // fallback
};

export default function Ujian() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, examsRes] = await Promise.all([
          getMyProfile(),
          getAvailableExams(),
        ]);

        const p = profileRes.data;
        const availableExams = examsRes.data;

        setProfile(p);
        setExams(availableExams);

        // Auto-pilih exam yang sesuai sub divisi user
        if (p.subDivisionId && availableExams.length > 0) {
          const matched = availableExams.find(
            (e) => e.subDivisionId === p.subDivisionId
          );
          if (matched) setSelectedExamId(matched.id);
        }
      } catch (err) {
        console.error("Gagal load ujian:", err);
        setErrorMsg("Gagal memuat data ujian.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleMulai = () => {
    if (!selectedExamId) return;
    navigate(`/ujianpengerjaan`, { state: { examId: selectedExamId } });
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat ujian...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TITLE */}
        <div className="mt-6">
          <h1 className="text-white text-lg md:text-xl font-bold">
            Ujian Online OR Neotelemetri XIV
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Silahkan pilih sesuai divisimu!
          </p>
        </div>

        {errorMsg && (
          <p className="text-red-400 text-sm">{errorMsg}</p>
        )}

        {exams.length === 0 ? (
          <div
            className="flex items-center justify-center py-16 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p className="text-white/40 text-sm">Belum ada ujian tersedia untuk divisimu.</p>
          </div>
        ) : (
          /* EXAM CARDS */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            {exams.map((exam) => {
              const isSelected = selectedExamId === exam.id;
              const logo = getLogoByName(exam.subDivision?.division?.name || "");

              return (
                <div key={exam.id} className="flex flex-col gap-3">
                  {/* CARD */}
                  <button
                    onClick={() => setSelectedExamId(exam.id)}
                    className="w-full flex lg:flex-col items-center justify-start lg:justify-center gap-4 py-5 lg:py-8 px-5 lg:px-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: isSelected
                        ? "rgba(255,0,255,0.15)"
                        : "rgba(255,255,255,0.07)",
                      border: isSelected
                        ? "2px solid #FF00FF"
                        : "1.5px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: isSelected ? "0 0 24px rgba(255,0,255,0.25)" : "none",
                    }}
                  >
                    <img
                      src={logo}
                      alt={exam.title}
                      className="w-[48px] h-[48px] lg:w-[72px] lg:h-[72px] object-contain shrink-0"
                    />
                    <div className="text-left lg:text-center">
                      <p
                        className="text-sm leading-snug font-semibold"
                        style={{ color: isSelected ? "white" : "rgba(255,255,255,0.75)" }}
                      >
                        {exam.title}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {exam.durationMinutes} menit · {exam.subDivision?.name || ""}
                      </p>
                    </div>
                  </button>

                  {/* TOMBOL PILIH */}
                  <button
                    onClick={() => setSelectedExamId(exam.id)}
                    className="w-full py-3 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: isSelected
                        ? "linear-gradient(90deg,#FF00FF,#990099)"
                        : "rgba(255,255,255,0.1)",
                      border: isSelected ? "none" : "1px solid rgba(255,255,255,0.2)",
                      boxShadow: isSelected ? "0 3px 16px rgba(255,0,255,0.35)" : "none",
                    }}
                  >
                    {isSelected ? "Dipilih ✓" : "Pilih"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* PERATURAN UJIAN */}
        <div className="flex flex-col gap-3 mt-2">
          <h2 className="text-white font-bold text-base">Peraturan Ujian</h2>
          <ol className="flex flex-col gap-2">
            {rules.map((rule, i) => (
              <li key={i} className="flex gap-2 text-white/65 text-sm leading-relaxed">
                <span className="shrink-0">{i + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* TOMBOL MULAI */}
        <button
          onClick={handleMulai}
          disabled={!selectedExamId}
          className="w-full md:w-[160px] py-4 rounded-2xl text-white font-semibold text-base mt-2 transition-all duration-200"
          style={{
            background: selectedExamId
              ? "linear-gradient(90deg,#FF00FF,#CC00CC)"
              : "rgba(255,255,255,0.1)",
            boxShadow: selectedExamId ? "0 4px 24px rgba(255,0,255,0.35)" : "none",
            border: selectedExamId ? "none" : "1px solid rgba(255,255,255,0.15)",
            cursor: selectedExamId ? "pointer" : "not-allowed",
            opacity: selectedExamId ? 1 : 0.5,
          }}
        >
          Mulai Ujian
        </button>
      </div>
    </UserLayout>
  );
}