import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";
import UserLayout from "../../components/user/LayoutUser";

const divisions = [
  { key: "programming", label: "Programming", logo: logoProgramming },
  { key: "mmd", label: "Multimedia & Desain", logo: logoMmd },
  { key: "skj", label: "Sistem Komputer dan Jaringan", logo: logoSkj },
];

const rules = [
  "Setiap peserta diberikan waktu maksimal 60 menit untuk menyelesaikan seluruh soal. Pastikan memanfaatkan waktu dengan baik.",
  "Ujian harus dikerjakan menggunakan koneksi jaringan yang stabil untuk menghindari kendala teknis selama pengerjaan.",
  "Peserta wajib menjawab semua soal secara jujur dan mandiri tanpa bantuan pihak lain atau sumber eksternal.",
  "Selama ujian berlangsung, peserta tidak diperbolehkan keluar atau berpindah dari halaman ujian, kecuali jika telah selesai mengerjakan.",
  "Setiap peserta hanya memiliki satu kali kesempatan untuk mengikuti ujian, jadi pastikan mempersiapkan diri dengan baik.",
  "Peserta yang terbukti melakukan kecurangan, keluar dari halaman ujian tanpa alasan jelas, atau melanggar aturan akan didiskualifikasi dari proses seleksi.",
  "Jika ada pertanyaan atau kendala, hubungi Azizah (083183879726), Fadhila (081363681138)",
];

export default function Ujian() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleMulai = () => {
    if (!selected) return;
    navigate(`/ujian/${selected}`);
  };

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

        {/* DIVISION CARDS — 1 kolom di mobile, 3 kolom di desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {divisions.map((div) => {
            const isSelected = selected === div.key;
            return (
              <div key={div.key} className="flex flex-col gap-3">
                {/* CARD */}
                <button
                  onClick={() => setSelected(div.key)}
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
                    src={div.logo}
                    alt={div.label}
                    className="w-[48px] h-[48px] lg:w-[72px] lg:h-[72px] object-contain shrink-0"
                  />
                  <p
                    className="text-sm text-left lg:text-center leading-snug"
                    style={{ color: isSelected ? "white" : "rgba(255,255,255,0.75)" }}
                  >
                    {div.label}
                  </p>
                </button>

                {/* TOMBOL PILIH */}
                <button
                  onClick={() => setSelected(div.key)}
                  className="w-full py-3 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: isSelected
                      ? "linear-gradient(90deg,#FF00FF,#990099)"
                      : "rgba(255,255,255,0.1)",
                    border: isSelected ? "none" : "1px solid rgba(255,255,255,0.2)",
                    boxShadow: isSelected ? "0 3px 16px rgba(255,0,255,0.35)" : "none",
                  }}
                >
                  Pilih
                </button>
              </div>
            );
          })}
        </div>

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
          disabled={!selected}
          className="w-full md:w-[160px] py-4 rounded-2xl text-white font-semibold text-base mt-2 transition-all duration-200"
          style={{
            background: selected
              ? "linear-gradient(90deg,#FF00FF,#CC00CC)"
              : "rgba(255,255,255,0.1)",
            boxShadow: selected ? "0 4px 24px rgba(255,0,255,0.35)" : "none",
            border: selected ? "none" : "1px solid rgba(255,255,255,0.15)",
            cursor: selected ? "pointer" : "not-allowed",
            opacity: selected ? 1 : 0.5,
          }}
        >
          Mulai Ujian
        </button>
      </div>
    </UserLayout>
  );
}