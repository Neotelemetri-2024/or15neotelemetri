import { useState, useRef, useEffect } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Upload, User } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import { getMyVerification, submitVerification } from "../../services/userServices";
import { getMyProfile } from "../../services/userServices";

// Field upload gambar
const uploadFields = [
  { key: "krsScan",               fieldName: "krsScan",               label: "Kartu Rencana Studi (KRS)" },
  { key: "fotoFormal",            fieldName: "formalPhoto",           label: "Foto Formal" },
  { key: "igNeo",                 fieldName: "instagramProof",        label: "Bukti Follow Instagram Neo Telemetri" },
  { key: "igMarketing",           fieldName: "instagramMarketingProof", label: "Bukti Follow Instagram Marketing Neo Telemetri" },
];

function UploadBox({ label, file, existingUrl, onFileChange }) {
  const inputRef = useRef();

  // Preview: gunakan file baru jika ada, fallback ke URL yang sudah tersimpan
  const preview = file
    ? URL.createObjectURL(file)
    : existingUrl || null;

  return (
    <div className="flex flex-col gap-2 h-full">
      <label className="text-white/70 text-xs min-h-[32px] flex items-start">
        {label}
      </label>

      <div
        className="w-full flex-1 min-h-[140px] rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={() => inputRef.current.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <Upload size={28} className="text-white/20" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current.click()}
        className="w-full py-[10px] rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_#FF00FF55]"
        style={{
          background: "linear-gradient(90deg, #FF00FF 0%, #990099 100%)",
          boxShadow: "0 3px 16px rgba(255,0,255,0.3)",
        }}
      >
        {existingUrl || file ? "Ganti File" : "Upload File"}
      </button>
    </div>
  );
}

export default function VerifikasiPage() {
  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // File baru yang dipilih user (null = tidak diganti)
  const [files, setFiles] = useState({
    krsScan: null,
    fotoFormal: null,
    igNeo: null,
    igMarketing: null,
  });

  // ── FETCH DATA AWAL ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, verifRes] = await Promise.all([
          getMyProfile(),
          getMyVerification().catch(() => ({ data: null })),
        ]);
        setProfile(profileRes.data);
        setVerification(verifRes.data);
      } catch (err) {
        console.error("Gagal load data verifikasi:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const setFile = (key) => (file) =>
    setFiles((prev) => ({ ...prev, [key]: file }));

  // ── RENDER BANNER STATUS ────────────────────────────────────────
  const renderBanner = () => {
    const status = verification?.status;

    if (status === "APPROVED") {
      return (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-xl"
          style={{
            background: "linear-gradient(90deg, #CC00CC 0%, #7B2FBE 60%, #501A5E 100%)",
            border: "1px solid rgba(255,0,255,0.3)",
            boxShadow: "0 0 24px rgba(255,0,255,0.2)",
          }}
        >
          <ShieldCheck size={18} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium">Verifikasi Berhasil! Selamat bergabung 🎉</span>
        </div>
      );
    }

    if (status === "REJECTED") {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-600/80">
          <ShieldX size={18} className="text-white shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Verifikasi Ditolak</p>
            {verification?.rejectionReason && (
              <p className="text-white/80 text-xs mt-0.5">
                Alasan: {verification.rejectionReason}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (status === "PENDING") {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-yellow-500/80">
          <ShieldAlert size={18} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium">
            Dokumen sedang ditinjau oleh admin. Mohon tunggu.
          </span>
        </div>
      );
    }

    // Belum submit
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#FF00FF]/20"
        style={{ border: "1px solid rgba(255,0,255,0.3)" }}
      >
        <ShieldAlert size={18} className="text-white shrink-0" />
        <span className="text-white text-sm font-medium">
          Kamu belum mengumpulkan dokumen verifikasi.
        </span>
      </div>
    );
  };

  // ── KIRIM DOKUMEN ───────────────────────────────────────────────
  const handleKirim = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const fd = new FormData();

      // Append file baru jika ada
      if (files.krsScan)    fd.append("krsScan", files.krsScan);
      if (files.fotoFormal) fd.append("formalPhoto", files.fotoFormal);
      if (files.igNeo)      fd.append("instagramProof", files.igNeo);
      if (files.igMarketing) fd.append("instagramMarketingProof", files.igMarketing);

      await submitVerification(fd);

      // Refresh data verifikasi setelah submit
      const verifRes = await getMyVerification().catch(() => ({ data: null }));
      setVerification(verifRes.data);

      // Reset file baru
      setFiles({ krsScan: null, fotoFormal: null, igNeo: null, igMarketing: null });
      setSuccessMsg("Dokumen berhasil dikirim! Tunggu review dari admin.");
    } catch (err) {
      console.error("Gagal kirim dokumen:", err);
      setErrorMsg(err.response?.data?.message || "Gagal mengirim dokumen.");
    } finally {
      setSaving(false);
    }
  };

  // User approved tidak bisa kirim ulang
  const isApproved = verification?.status === "APPROVED";

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat data...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TOP RIGHT: NAMA + AVATAR */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">
            {profile?.fullName || "-"}
          </span>
          <div
            className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center shrink-0"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-white/70" />
            )}
          </div>
        </div>

        {/* BANNER STATUS */}
        {renderBanner()}

        {/* TITLE */}
        <h2 className="text-white text-lg md:text-xl font-semibold -mt-2">
          {isApproved
            ? "Dokumen Verifikasi Kamu"
            : "Upload berkas yang diperlukan disini"}
        </h2>

        {/* UPLOAD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {uploadFields.map(({ key, fieldName, label }) => {
            // Mapping field name ke URL yang tersimpan di BE
            const existingUrlMap = {
              krsScan:     verification?.krsScanUrl,
              fotoFormal:  verification?.formalPhotoUrl,
              igNeo:       verification?.instagramProofUrl,
              igMarketing: verification?.instagramMarketingProofUrl,
            };

            return (
              <UploadBox
                key={key}
                label={label}
                file={files[key]}
                existingUrl={existingUrlMap[key]}
                onFileChange={isApproved ? () => {} : setFile(key)}
              />
            );
          })}
        </div>

        {/* PESAN SUKSES / ERROR */}
        {successMsg && (
          <p className="text-green-400 text-sm text-center">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="text-red-400 text-sm text-center">{errorMsg}</p>
        )}

        {/* TOMBOL KIRIM — sembunyikan jika sudah APPROVED */}
        {!isApproved && (
          <button
            onClick={handleKirim}
            disabled={saving}
            className="w-full md:w-[160px] py-4 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_32px_#FF00FF66] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{
              background: "linear-gradient(90deg, #FF00FF 0%, #CC00CC 100%)",
              boxShadow: "0 4px 24px rgba(255,0,255,0.35)",
            }}
          >
            {saving
              ? "Mengirim..."
              : verification?.status === "REJECTED"
              ? "Kirim Ulang"
              : "Kirim!"}
          </button>
        )}
      </div>
    </UserLayout>
  );
}