import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import { getMyProfile } from "../../services/userServices";
import api from "../../components/api/axios";

import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";

const getLogoByDivisionName = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("programming")) return logoProgramming;
  if (lower.includes("multimedia") || lower.includes("mmd") || lower.includes("desain")) return logoMmd;
  if (lower.includes("sistem") || lower.includes("jaringan") || lower.includes("skj")) return logoSkj;
  return logoProgramming;
};

const getAssignments = () => api.get("/assignments");

export default function Tugas() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, assignmentsRes] = await Promise.all([
          getMyProfile(),
          getAssignments(),
        ]);
        setProfile(profileRes.data);
        setAssignments(assignmentsRes.data);
      } catch (err) {
        console.error("Gagal load tugas:", err);
        if (err.response?.status === 403) {
          setErrorMsg(
            err.response.data?.message ||
            "Kamu harus menyelesaikan ujian terlebih dahulu untuk mengakses tugas."
          );
        } else {
          setErrorMsg("Gagal memuat tugas.");
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const divisionName = profile?.division?.name || profile?.subDivision?.division?.name || "";
  const subDivName   = profile?.subDivision?.name || "-";
  const logo         = getLogoByDivisionName(divisionName);

  // Format deadline
  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Cek apakah tugas sudah dikumpulkan (dari submissions yang include di response)
  const isSubmitted = (tugas) =>
    tugas.submissions && tugas.submissions.length > 0;

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat tugas...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TITLE */}
        <h1 className="text-white text-lg md:text-xl font-bold">
          Tugas OR 15 Neotelemetri XV
        </h1>

        {/* INFO DIVISI */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo divisi"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div>
            <p className="text-white text-sm font-semibold">{divisionName || "Divisi"}</p>
            <p className="text-white/50 text-xs">{subDivName}</p>
          </div>
        </div>

        {/* ERROR — belum selesai ujian */}
        {errorMsg && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <span className="text-red-400 text-sm">{errorMsg}</span>
          </div>
        )}

        {/* LIST TUGAS */}
        {!errorMsg && (
          <div className="flex flex-col gap-3 w-full">
            {assignments.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-10">
                Belum ada tugas tersedia untuk sub divisimu.
              </p>
            ) : (
              assignments.map((tugas) => {
                const isOpen = openId === tugas.id;
                const submitted = isSubmitted(tugas);

                return (
                  <div key={tugas.id} className="flex flex-col rounded-[24px] overflow-hidden">

                    {/* HEADER CARD */}
                    <div
                      className="flex flex-col px-5 py-4 gap-3"
                      style={{
                        background: "linear-gradient(90deg, #FF00FF 0%, #CC00CC 50%, #990099 100%)",
                        boxShadow: "0 4px 24px rgba(255,0,255,0.40)",
                      }}
                    >
                      {/* BARIS ATAS */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(0,0,0,0.25)" }}
                        >
                          <Folder size={16} className="text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm leading-tight">
                            {tugas.title}
                          </p>
                          <p className="text-white/70 text-xs truncate">
                            {tugas.subDivision?.name || subDivName}
                          </p>
                        </div>

                        {/* Badge sudah kumpul */}
                        {submitted && (
                          <span
                            className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: "rgba(34,197,94,0.25)",
                              border: "1px solid rgba(34,197,94,0.5)",
                              color: "#86efac",
                            }}
                          >
                            ✓ Terkumpul
                          </span>
                        )}

                        {/* TOMBOL LIHAT */}
                        <button
                          onClick={() => toggle(tugas.id)}
                          className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-full text-white text-xs font-semibold transition-all duration-200 hover:scale-105 hover:brightness-110"
                          style={{
                            background: "rgba(0,0,0,0.35)",
                            border: "1.5px solid rgba(255,255,255,0.30)",
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                          }}
                        >
                          {isOpen ? (
                            <><ChevronUp size={12} /> Tutup</>
                          ) : (
                            <><ChevronDown size={12} /> Lihat</>
                          )}
                        </button>
                      </div>

                      {/* DEADLINE */}
                      <div className="pl-12">
                        <span className="text-white/80 text-xs">
                          Deadline {formatDeadline(tugas.dueAt)}
                        </span>
                      </div>
                    </div>

                    {/* DETAIL PANEL */}
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? "500px" : "0px" }}
                    >
                      <div
                        className="px-6 py-5 flex flex-col gap-4"
                        style={{
                          background: "rgba(255,255,255,0.97)",
                          borderRadius: "0 0 24px 24px",
                        }}
                      >
                        {/* DESKRIPSI */}
                        <div>
                          <p className="text-gray-700 font-semibold text-sm mb-1">
                            Deskripsi Tugas :
                          </p>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {tugas.description || "Tidak ada deskripsi."}
                          </p>
                        </div>

                        {/* FILE TEMPLATE dari admin (jika ada) */}
                        {tugas.fileUrl && (
                          <div>
                            <p className="text-gray-700 font-semibold text-sm mb-1">
                              File Template :
                            </p>
                            <a
                              href={tugas.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold transition-all hover:brightness-110"
                              style={{
                                background: "linear-gradient(135deg,#0077CC,#004499)",
                                boxShadow: "0 2px 8px rgba(0,100,200,0.3)",
                              }}
                            >
                              <ExternalLink size={12} />
                              Download Template
                            </a>
                          </div>
                        )}

                        {/* Jika sudah kumpul — tampilkan info nilai */}
                        {submitted && tugas.submissions[0]?.score != null && (
                          <div
                            className="flex items-center justify-between px-4 py-3 rounded-xl"
                            style={{
                              background: "rgba(34,197,94,0.08)",
                              border: "1px solid rgba(34,197,94,0.2)",
                            }}
                          >
                            <span className="text-gray-600 text-sm">Nilai kamu:</span>
                            <span className="text-green-600 font-bold text-base">
                              {parseFloat(tugas.submissions[0].score).toFixed(1)}
                            </span>
                          </div>
                        )}

                        {/* TOMBOL KUMPULKAN */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => navigate("/pengumpulan", {
                              state: {
                                assignmentId: tugas.id,
                                title: tugas.title,
                                deadline: formatDeadline(tugas.dueAt),
                                existingSubmission: tugas.submissions?.[0] || null,
                              }
                            })}
                            className="px-7 py-[10px] rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(120,0,200,0.4)]"
                            style={{
                              background: "linear-gradient(135deg, #7B2FBE 0%, #501A5E 100%)",
                              boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
                            }}
                          >
                            {submitted ? "Kumpul Ulang" : "Kumpul Tugas"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}