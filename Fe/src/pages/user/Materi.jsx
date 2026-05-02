import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import { getMyProfile } from "../../services/userServices";
import { previewFile, downloadFile } from "../../utils/fileUtils";
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

const getModules = () =>
  api.get("/learning-modules", {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    params: { _: Date.now() },
  });

export default function Materi() {
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePreview = async (id) => {
    setLoadingFile((prev) => ({ ...prev, [id]: "preview" }));
    await previewFile(id, "learning-modules");
    setLoadingFile((prev) => ({ ...prev, [id]: null }));
  };

  const handleDownload = async (id) => {
    setLoadingFile((prev) => ({ ...prev, [id]: "download" }));
    await downloadFile(id, "learning-modules");
    setLoadingFile((prev) => ({ ...prev, [id]: null }));
  };
  const [loadingFile, setLoadingFile] = useState({});

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
          Materi OR 15 Neo Telemetri
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
              <>
                {/* HINT BANNER */}
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-white/60"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px dashed rgba(255,255,255,0.1)",
                  }}
                >
                  <span>💡</span>
                  <span>
                    Tekan materi untuk langsung{" "}
                    <strong className="text-white/80">mengunduh</strong> file,
                    atau tekan tombol{" "}
                    <strong className="text-white/80">Buka</strong> untuk
                    preview.
                  </span>
                </div>

                {modules.map((materi) => (
                  <div
                    key={materi.id}
                    className="flex items-center gap-3 px-5 py-4 rounded-full"
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

                    <span className="flex-1 truncate text-white font-semibold text-sm">
                      {materi.title}
                    </span>

                    {/* TOMBOL BUKA */}
                    <button
                      onClick={() => handlePreview(materi.id)}
                      disabled={!!loadingFile[materi.id]}
                      className="shrink-0 px-3 py-1.5 rounded-full text-white text-xs font-semibold disabled:opacity-60 transition-all hover:brightness-110"
                      style={{
                        background: "rgba(0,0,0,0.30)",
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}
                    >
                      {loadingFile[materi.id] === "preview"
                        ? "Membuka..."
                        : "Buka"}
                    </button>

                    {/* TOMBOL DOWNLOAD */}
                    <button
                      onClick={() => handleDownload(materi.id)}
                      disabled={!!loadingFile[materi.id]}
                      className="shrink-0 px-3 py-1.5 rounded-full text-white text-xs font-semibold disabled:opacity-60 transition-all hover:brightness-110"
                      style={{
                        background: "rgba(0,0,0,0.30)",
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}
                    >
                      {loadingFile[materi.id] === "download"
                        ? "Mengunduh..."
                        : "Unduh"}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
