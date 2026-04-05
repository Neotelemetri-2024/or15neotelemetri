import { useState } from "react";
import circleBlue from "../../assets/images/Bulat_Biru.png";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const faqs = [
    {
      question: "Apa itu Neo Telemetri?",
      answer:
        "Neo Telemetri adalah organisasi yang berfokus pada pengembangan teknologi, riset, dan project berbasis engineering serta digital. Di sini kamu bisa belajar, berkembang, dan terlibat langsung dalam berbagai project nyata.",
    },
    {
      question: "Siapa saja yang boleh mendaftar Open Recruitment ini?",
      answer:
        "Open Recruitment Neo Telemetri 15 terbuka untuk seluruh mahasiswa aktif angkatan 2024 dan 2025 yang memiliki semangat belajar tinggi, komitmen, dan ketertarikan di bidang teknologi maupun organisasi, tanpa memandang jurusan.",
    },
    {
      question: "Apakah harus punya skill atau pengalaman sebelumnya?",
      answer:
        "Tidak harus. Kami membuka kesempatan bagi pemula maupun yang sudah berpengalaman. Yang terpenting adalah kemauan belajar, konsistensi, dan kesiapan untuk berkembang bersama.",
    },

    {
      question: "Apa keuntungan bergabung dengan Neo Telemetri?",
      answer:
        "Kamu akan mendapatkan pengalaman mengerjakan project nyata, meningkatkan skill teknis dan soft skill, memperluas relasi, serta menjadi bagian dari tim yang suportif dan berkembang bersama.",
    },
    {
      question: "Apakah kegiatan di Neo Telemetri akan mengganggu kuliah?",
      answer:
        "Tidak. Kegiatan dirancang fleksibel dan menyesuaikan dengan jadwal kuliah anggota. Justru kami mendorong anggota untuk tetap memprioritaskan akademik sambil tetap aktif berorganisasi.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* ===== FAQ BLOCK ===== */}
      <div className="relative">
        <img
          src={circleBlue}
          alt=""
          className="absolute -top-10 -right-10 pointer-events-none select-none z-0"
        />
        <img
          src={circleBlue}
          alt=""
          className="absolute -bottom-15 -left-28 lg:-left-20 pointer-events-none select-none z-0 lg:block"
          style={{ opacity: 0.35 }}
        />

        {/* Title */}
        <h2 className="relative z-10 text-center text-2xl lg:text-4xl font-bold text-white mb-10 lg:mb-12">
          <span className="font-extrabold">Frequently</span>{" "}
          <span className="font-light text-white/80">Asked Question</span>
        </h2>

        {/* FAQ List */}
        <div className="relative z-10 max-w-[900px] mx-auto px-6 lg:px-6 flex flex-col gap-0">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b-[3px] border-[#01FFFF]">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between py-4 lg:py-5 text-left"
              >
                <span className="text-white text-sm lg:text-base pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className="shrink-0 transition-transform duration-500"
                  style={{
                    color: "#01FFFF",
                    transform:
                      openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              <div
                className="overflow-hidden transition-all duration-500"
                style={{
                  maxHeight: openIndex === i ? "200px" : "0px",
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <p className="text-white/55 text-sm pb-4 lg:pb-5 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
