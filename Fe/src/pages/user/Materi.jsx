import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import { getMyProfile } from "../../services/userServices";
import api from "../../components/api/axios";

import logoProgramming from "../../assets/images/Logo_Programming.png";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import logoSkj from "../../assets/images/logo_Skj.svg";

const getLogoByDivisionName = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("programming")) return logoProgramming;
  if (
    lower.includes("multimedia") ||
    lower.includes("mmd") ||
    lower.includes("desain")
  )
    return logoMmd;
  if (
    lower.includes("sistem") ||
    lower.includes("jaringan") ||
    lower.includes("skj")
  )
    return logoSkj;
  return logoProgramming;
};

const getModules = () => api.get("/learning-modules");

export default function Materi() {
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Tambah setelah useState declarations
  const handleDownload = async (url, filename) => {
    try {
      const ext = url.split(".").pop().split("?")[0];
      const filenameWithExt = filename.endsWith(`.${ext}`)
        ? filename
        : `${filename}.${ext}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filenameWithExt;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Gagal download:", err);
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, modulesRes] = await Promise.all([
          getMyProfile(),
          getModules(),
        ]);
        setProfile(profileRes.data);
        setModules(modulesRes.data);
      } catch (err) {
        console.error("Gagal load materi:", err);
        // BE akan throw 403 jika belum submit ujian
        if (err.response?.status === 403) {
          setErrorMsg(
            err.response.data?.message ||
              "Kamu harus menyelesaikan ujian terlebih dahulu untuk mengakses materi.",
          );
        } else {
          setErrorMsg("Gagal memuat materi.");
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const divisionName =
    profile?.division?.name || profile?.subDivision?.division?.name || "";
  const subDivName = profile?.subDivision?.name || "-";
  const logo = getLogoByDivisionName(divisionName);

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">
            Memuat materi...
          </p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10">
        {/* TITLE */}
        <h1 className="text-white text-lg md:text-xl font-bold">
          Materi OR 15 Neotelemetri XV
        </h1>

        {/* INFO DIVISI */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo divisi"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div>
            <p className="text-white text-sm font-semibold">
              {divisionName || "Divisi"}
            </p>
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

        {/* LIST MATERI */}
        {!errorMsg && (
          <div className="flex flex-col gap-3 w-full">
            {modules.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-10">
                Belum ada materi tersedia untuk sub divisimu.
              </p>
            ) : (
              modules.map((materi) => (
                <button
                  key={materi.id}
                  onClick={() =>
                    materi.fileUrl &&
                    handleDownload(materi.fileUrl, materi.title)
                  }
                  className="flex items-center gap-4 px-5 py-4 rounded-full text-left text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
                  style={{
                    background:
                      "linear-gradient(90deg, #FF00FF 0%, #CC00CC 50%, #990099 100%)",
                    boxShadow: "0 4px 24px rgba(255,0,255,0.40)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,0,0,0.25)" }}
                  >
                    <BookOpen size={15} className="text-white" />
                  </div>
                  <span className="flex-1 truncate">{materi.title}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
