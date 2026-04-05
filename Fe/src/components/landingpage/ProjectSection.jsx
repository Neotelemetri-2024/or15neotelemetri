import { Project } from "../../data/Project";
import circlePurple from "../../assets/images/Bulat_Ungu.png";
import CircuitLine from "../../assets/images/Circuit_Line.png";
import Project1 from "../../assets/images/Project1.png";
import Project2 from "../../assets/images/Project2.png";
import Project3 from "../../assets/images/Project3.png";
import Project4 from "../../assets/images/Project4.png";
import Project5 from "../../assets/images/Project5.png";
import Project6 from "../../assets/images/Project6.png";

const projectImages = [
  Project1,
  Project2,
  Project3,
  Project4,
  Project5,
  Project6,
];
const projectNames = [
  "PORTAL PKM UNAND",
  "Angka Ceria",
  "SIRAMI",
  "Portal TPB",
  "SIMSAPRAS",
  "Bakti Unand 2025",
];

const projectDescs = [
  "Sistem terintegrasi yang menghubungkan mahasiswa, dosen, reviewer, hingga administrator dalam satu ekosistem digital — 100% paperless, dengan auto assignment reviewer, dashboard monitoring real-time, dan workflow approval terstruktur.",
  "Game edukatif berbasis kuis untuk anak-anak yang membuat belajar berhitung jadi menyenangkan. Dilengkapi integrasi mikrokontroler dan push button fisik untuk pengalaman belajar yang interaktif dan melatih koordinasi motorik.",
  "Desain antarmuka aplikasi mobile terintegrasi IoT untuk memantau kualitas air minum secara real-time — memantau pH, suhu, dan status kelayakan air dengan tampilan yang ringkas dan mudah dipahami.",
  "Portal nilai mahasiswa untuk Departemen Teknik Pertanian dan Biosistem yang mengikuti standar kurikulum OBE. Mendukung manajemen CPL, CPMK, komponen penilaian, hingga pelaporan berbasis capaian pembelajaran untuk akreditasi IABEE.",
  "Sistem Informasi Peminjaman Sarana & Prasarana Universitas Andalas. Memudahkan pengecekan ketersediaan gedung dan ruangan secara real-time, lengkap dengan detail kapasitas, jadwal, dan panduan penggunaan.",
  "Platform digital untuk pelaksanaan kegiatan BAKTI UNAND — menyediakan informasi acara, jadwal, pendaftaran peserta dan kelompok secara online, serta manajemen data panitia yang terintegrasi.",
];

export default function ProjectSection() {
  const currentProject = Project[0];
  const allCards = currentProject.subDivisions.slice(0, 6);

  return (
    <section  className="relative py-8 lg:py-16">
      {/* BACKGROUND */}
      <img
        src={circlePurple}
        alt=""
        className="absolute -right-20 pointer-events-none select-none"
      />
      <img
        src={circlePurple}
        alt=""
        className="absolute bottom-20 -left-20 pointer-events-none select-none"
      />

      {/* TITLE */}
      <p className="text-center font-semibold text-3xl lg:text-4xl mb-12 lg:mb-16 relative z-10">
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

      {/* CARD AREA */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {allCards.map((item, index) => (
            <div
              key={index}
              className="rounded-[24px] overflow-hidden border border-[#FF00FF]/60 flex flex-col group hover:border-[#FF00FF] hover:scale-[1.02] transition-all duration-300"
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                backgroundColor: "rgba(255,255,255,0.05)",
                boxShadow: "0 0 24px rgba(255,0,255,0.08)",
              }}
            >
              {/* GAMBAR */}
              {/* GAMBAR dengan overlay deskripsi */}
              <div className="w-full h-[200px] overflow-hidden relative">
                <img
                  src={projectImages[index]}
                  alt={projectNames[index]}
                  className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient normal */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Overlay deskripsi saat hover */}
                <div
                  className="absolute inset-0 flex items-end
    opacity-0 group-hover:opacity-100
    transition-all duration-400"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(10,0,20,0.95) 60%, rgba(10,0,20,0.5) 100%)",
                  }}
                >
                  <p className="text-white/80 text-xs leading-relaxed p-4 line-clamp-6">
                    {projectDescs[index]}
                  </p>
                </div>
              </div>

              {/* KONTEN — tetap seperti biasa di bawah */}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="text-base font-bold text-[#FF00FF] tracking-wide uppercase">
                  {projectNames[index]}
                </h3>
              </div>

              {/* BOTTOM ACCENT */}
              <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#FF00FF] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
