import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import api from "../../components/api/axios";

const getMyPayment = () => api.get("/payments/my-payment");
const uploadProof = (formData) =>
  api.post("/payments/upload-proof", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

const getMyVerification = () => api.get("/verification/me");

const AMOUNT = "40000";
const AMOUNT_DISPLAY = "Rp40.000";
const MAX_SIZE = 5 * 1024 * 1024;

export default function PembayaranBukti() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState(null); // null | "pending" | "success" | "failed"
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const isBlocked = verificationStatus !== "APPROVED";

  // Cek status pembayaran saat halaman dibuka
  useEffect(() => {
    const init = async () => {
      try {
        const [paymentRes, verifRes] = await Promise.all([
          getMyPayment().catch(() => null),
          getMyVerification().catch(() => null),
        ]);

        const payment = paymentRes?.data;
        const verification = verifRes?.data;

        setVerificationStatus(verification?.status);

        if (payment?.status === "APPROVED") setModal("success");
        else if (payment?.status === "PENDING") setModal("pending");
        else if (payment?.status === "REJECTED") {
          setRejectionReason(payment.rejectionReason || "");
          setModal("failed");
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setModal("failed");
      setRejectionReason("Ukuran file maksimal 5MB");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleKirim = async () => {
    if (!preview || !fileInputRef.current?.files[0]) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", fileInputRef.current.files[0]);
      fd.append("amount", AMOUNT);
      await uploadProof(fd);
      setModal("pending");
    } catch (err) {
      const msg = err.response?.data?.message || "";
      // Mapping pesan error BE ke status modal
      if (
        msg.toLowerCase().includes("file too large") ||
        msg.toLowerCase().includes("limit") ||
        err.response?.status === 413
      ) {
        setModal("failed");
        setRejectionReason("Ukuran file terlalu besar (maksimal 5MB)");
        return;
      }
      if (
        msg.toLowerCase().includes("lunas") ||
        msg.toLowerCase().includes("approved")
      ) {
        setModal("success");
      } else if (
        msg.toLowerCase().includes("pending") ||
        msg.toLowerCase().includes("peninjauan")
      ) {
        setModal("pending");
      } else {
        setRejectionReason(
          msg || "Terjadi kesalahan pada bukti pembayaran Anda.",
        );
        setModal("failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (modal === "success" || modal === "pending") {
      navigate("/dashboard");
    } else {
      setModal(null);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen px-6 py-8 text-white flex flex-col gap-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white text-sm font-medium w-fit hover:opacity-70 transition-opacity"
        >
          <span className="text-base">←</span>
          <span>Back</span>
        </button>

        {/* Title */}
        <h2 className="text-lg font-bold text-white">
          Pembayaran OR 15 Neo Telemetri
        </h2>

        {verificationStatus !== "APPROVED" && (
          <div className="bg-yellow-500/20 border border-yellow-400/40 text-yellow-200 text-sm px-4 py-3 rounded-xl">
            ⚠️ Kamu harus menyelesaikan verifikasi terlebih dahulu sebelum
            melakukan pembayaran.
          </div>
        )}
        {/* Upload Area */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-white/70">
            Bukti Pembayaran OR 15 Neo Telemetri
          </p>

          {/* Preview Box */}
          <div
            className="w-full h-48 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all hover:opacity-90"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              opacity: isBlocked ? 0.5 : 1,
              cursor: isBlocked ? "not-allowed" : "pointer",
            }}
            onClick={() => !isBlocked && fileInputRef.current.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-white/30" />
                <span className="text-white/30 text-xs">
                  Klik untuk pilih gambar
                </span>
              </div>
            )}
          </div>

          {/* Hidden input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Ganti File Button */}
          <button
            onClick={() => !isBlocked && fileInputRef.current.click()}
            disabled={isBlocked}
            className="self-start text-white text-sm font-semibold px-6 py-2 rounded-full transition-all hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: "#FF00FF",
              boxShadow: "0 2px 12px rgba(255,0,255,0.35)",
            }}
          >
            Ganti File
          </button>

          {fileName && (
            <p className="text-purple-300 text-xs truncate">{fileName}</p>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Kirim Button */}
        <button
          onClick={handleKirim}
          disabled={!preview || submitting}
          className="w-full py-4 rounded-full font-bold text-sm text-white transition-all duration-200 hover:opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#FF00FF" }}
        >
          {submitting ? "Mengirim..." : "Kirim"}
        </button>
      </div>

      {/* ── MODAL STATUS ────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6"
          onClick={handleCloseModal}
        >
          <div
            className="bg-gradient-to-b from-[#2a0a4a] to-[#1a0535] border border-purple-500/50 rounded-2xl px-8 py-10 flex flex-col items-center gap-5 max-w-xs w-full shadow-[0_8px_40px_rgba(139,92,246,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PENDING */}
            {modal === "pending" && (
              <>
                <h3 className="text-base font-bold text-white text-center">
                  Verifikasi Pembayaran : Pending
                </h3>
                <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                  <span className="text-black text-2xl font-black">!</span>
                </div>
                <p className="text-xs text-white/70 text-center leading-relaxed">
                  Pembayaran Anda sedang dalam proses verifikasi oleh panitia.
                  Mohon ditunggu :D
                </p>
                <button
                  onClick={handleCloseModal}
                  className="mt-1 text-white text-xs font-semibold px-8 py-2 rounded-full transition-all hover:opacity-80"
                  style={{ backgroundColor: "#FF00FF" }}
                >
                  OK
                </button>
              </>
            )}

            {/* SUCCESS */}
            {modal === "success" && (
              <>
                <h3 className="text-base font-bold text-white text-center">
                  Verifikasi Pembayaran Berhasil!
                </h3>
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/80 font-medium">
                    Terima kasih sudah mendaftar!
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Pembayaran Anda sebanyak {AMOUNT_DISPLAY} telah berhasil
                    diverifikasi.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="mt-1 text-white text-xs font-semibold px-8 py-2 rounded-full transition-all hover:opacity-80"
                  style={{ backgroundColor: "#FF00FF" }}
                >
                  OK
                </button>
              </>
            )}

            {/* FAILED */}
            {modal === "failed" && (
              <>
                <h3 className="text-base font-bold text-white text-center">
                  Verifikasi Pembayaran Gagal!
                </h3>
                <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-xs text-white/70 text-center leading-relaxed">
                  {rejectionReason ||
                    "Terjadi kesalahan dalam bukti pembayaran Anda!"}
                </p>
                <button
                  onClick={handleCloseModal}
                  className="mt-1 text-white text-xs font-semibold px-8 py-2 rounded-full transition-all hover:opacity-80"
                  style={{ backgroundColor: "#FF00FF" }}
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </UserLayout>
  );
}
