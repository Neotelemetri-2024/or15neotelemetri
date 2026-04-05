import { useState, useRef, useEffect } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Upload, User } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import {
  getMyVerification,
  submitVerification,
  getMyProfile,
} from "../../services/userServices";

const uploadFields = [
  { key: "krsScan",     fieldName: "krsScan",                  label: "Kartu Rencana Studi (JPG, PNG, JPEG)" },
  { key: "fotoFormal",  fieldName: "formalPhoto",              label: "Foto Formal (JPG, PNG, JPEG)" },
  { key: "igNeo",       fieldName: "instagramProof",           label: "Bukti Follow Instagram Neo Telemetri (JPG, PNG, JPEG)" },
  { key: "igMarketing", fieldName: "instagramMarketingProof",  label: "Bukti Follow Instagram Marketing Neo Telemetri (JPG, PNG, JPEG)" },
];

// Cek apakah semua 4 berkas sudah ada (file baru ATAU url tersimpan)
const allFilesReady = (files, verification) => {
  return (
    (files.krsScan     || verification?.krsScanUrl)               &&
    (files.fotoFormal  || verification?.formalPhotoUrl)           &&
    (files.igNeo       || verification?.instagramProofUrl)        &&
    (files.igMarketing || verification?.instagramMarketingProofUrl)
  );
};

function UploadBox({ label, file, existingUrl, onFileChange, locked }) {
  const inputRef = useRef();
  const preview = file ? URL.createObjectURL(file) : existingUrl || null;

  return (
    <div className="flex flex-col gap-2 h-full">
      <label className="text-white/70 text-xs min-h-[32px] flex items-start">{label}</label>

      <div
        className="w-full flex-1 min-h-[140px] max-h-[200px] rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: preview
            ? "1.5px solid rgba(255,0,255,0.35)"
            : "1.5px dashed rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          cursor: locked ? "default" : "pointer",
        }}
        onClick={() => !locked && inputRef.current.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={28} className="text-white/20" />
            <span className="text-white/20 text-xs">Belum diupload</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files[0])}
        disabled={locked}
      />

      {/* Tombol upload hanya muncul jika belum APPROVED */}
      {!locked && (
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
      )}

      {/* Keterangan terkunci */}
      {locked && preview && (
        <p className="text-white/30 text-[10px] text-center">Berkas telah diverifikasi</p>
      )}
    </div>
  );
}

export default function VerifikasiPage() {
  const [profile,      setProfile]      = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");
  const [errorMsg,     setErrorMsg]     = useState("");

  const [files, setFiles] = useState({
    krsScan: null, fotoFormal: null, igNeo: null, igMarketing: null,
  });

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

  const MAX_SIZE = 5 * 1024 * 1024;

  const setFile = (key) => (file) => {
    if (!file) return;
    if (file.size > MAX_SIZE) { setErrorMsg("Ukuran file maksimal 5MB"); return; }
    setErrorMsg("");
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  // ── BANNER STATUS ────────────────────────────────────────────────
  // Aturan badge:
  // - APPROVED  → banner hijau (tidak bisa ubah)
  // - REJECTED  → banner merah
  // - PENDING   → hanya jika semua 4 berkas sudah ada (URL atau file baru)
  // - belum submit / sebagian → banner "belum lengkap"
  const renderBanner = () => {
    const status   = verification?.status;
    const allReady = allFilesReady(files, verification);

    if (status === "APPROVED") {
      return (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-xl"
          style={{
            background: "linear-gradient(90deg,#CC00CC 0%,#7B2FBE 60%,#501A5E 100%)",
            border: "1px solid rgba(255,0,255,0.3)",
            boxShadow: "0 0 24px rgba(255,0,255,0.2)",
          }}
        >
          <ShieldCheck size={18} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium">
            Verifikasi Berhasil! Selamat bergabung 🎉
          </span>
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
            <p className="text-white/60 text-xs mt-1">Upload ulang semua berkas untuk mencoba lagi.</p>
          </div>
        </div>
      );
    }

    // PENDING hanya jika semua berkas sudah ada
    if (status === "PENDING" && allReady) {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-yellow-500/80">
          <ShieldAlert size={18} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium">
            Dokumen sedang ditinjau oleh admin. Mohon tunggu.
          </span>
        </div>
      );
    }

    // Belum semua berkas diupload (termasuk status null / PENDING tapi belum lengkap)
    const missingCount = uploadFields.filter(({ key }) => {
      const existingUrlMap = {
        krsScan:     verification?.krsScanUrl,
        fotoFormal:  verification?.formalPhotoUrl,
        igNeo:       verification?.instagramProofUrl,
        igMarketing: verification?.instagramMarketingProofUrl,
      };
      return !files[key] && !existingUrlMap[key];
    }).length;

    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-xl"
        style={{
          background: "rgba(255,0,255,0.20)",
          border: "1px solid rgba(255,0,255,0.3)",
        }}
      >
        <ShieldAlert size={18} className="text-white shrink-0" />
        <div>
          <span className="text-white text-sm font-medium">
            {missingCount > 0
              ? `${missingCount} berkas belum diupload.`
              : "Upload semua berkas untuk melanjutkan."}
          </span>
          {missingCount > 0 && (
            <p className="text-white/60 text-xs mt-0.5">
              Semua berkas wajib diupload sebelum dikirim ke admin.
            </p>
          )}
        </div>
      </div>
    );
  };

  // ── KIRIM DOKUMEN ───────────────────────────────────────────────
  const handleKirim = async () => {
    // Validasi: semua berkas harus ada sebelum bisa kirim
    if (!allFilesReady(files, verification)) {
      setErrorMsg("Lengkapi semua berkas terlebih dahulu sebelum mengirim.");
      return;
    }

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    for (const key in files) {
      if (files[key] && files[key].size > MAX_SIZE) {
        setErrorMsg("File terlalu besar (maksimal 5MB)");
        setSaving(false);
        return;
      }
    }

    try {
      const fd = new FormData();
      if (files.krsScan)     fd.append("krsScan",                 files.krsScan);
      if (files.fotoFormal)  fd.append("formalPhoto",             files.fotoFormal);
      if (files.igNeo)       fd.append("instagramProof",          files.igNeo);
      if (files.igMarketing) fd.append("instagramMarketingProof", files.igMarketing);

      await submitVerification(fd);

      const verifRes = await getMyVerification().catch(() => ({ data: null }));
      setVerification(verifRes.data);

      setFiles({ krsScan: null, fotoFormal: null, igNeo: null, igMarketing: null });
      setSuccessMsg("Dokumen berhasil dikirim! Tunggu review dari admin.");
    } catch (err) {
      console.error("Gagal kirim dokumen:", err);
      setErrorMsg(err.response?.data?.message || "Gagal mengirim dokumen.");
    } finally {
      setSaving(false);
    }
  };

  // APPROVED = berkas terkunci, tidak bisa diubah
  const isApproved = verification?.status === "APPROVED";
  const allReady   = allFilesReady(files, verification);

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
      <div className="min-h-screen flex flex-col gap-6 pt-10 auto-rows-fr md:pt-4">

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">{profile?.fullName || "-"}</span>
          <div
            className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-white/70" />
            )}
          </div>
        </div>

        {/* BANNER */}
        {renderBanner()}

        {/* TITLE */}
        <h2 className="text-white text-lg md:text-xl font-semibold -mt-2">
          {isApproved
            ? "Dokumen Verifikasi Kamu"
            : "Upload berkas yang diperlukan di sini"}
        </h2>

        {/* UPLOAD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
          {uploadFields.map(({ key, label }) => {
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
                onFileChange={setFile(key)}
                locked={isApproved}   // kunci semua box jika APPROVED
              />
            );
          })}
        </div>

        {successMsg && <p className="text-green-400 text-sm text-center">{successMsg}</p>}
        {errorMsg   && <p className="text-red-400   text-sm text-center">{errorMsg}</p>}

        {/* TOMBOL KIRIM — sembunyikan jika APPROVED */}
        {!isApproved && (
          <button
            onClick={handleKirim}
            disabled={saving || !allReady}
            className="w-full md:w-[160px] py-4 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_32px_#FF00FF66] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{
              background: "linear-gradient(90deg,#FF00FF 0%,#CC00CC 100%)",
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