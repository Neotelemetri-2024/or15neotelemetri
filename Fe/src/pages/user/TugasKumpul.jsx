import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Upload, FileText } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import { downloadFile, previewFile } from "../../utils/fileUtils";
import api from "../../components/api/axios";

// Ganti fungsi API submit
const submitAssignmentFile = (assignmentId, formData) =>
  api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

const submitAssignmentText = (assignmentId, textContent) =>
  api.post(`/assignments/${assignmentId}/submit`, { textContent });

const inputStyle = {
  background: "white",
  border: "1.5px solid rgba(0,0,0,0.12)",
  borderRadius: "8px",
  color: "#333",
  width: "100%",
  padding: "10px 14px",
  fontSize: "13px",
  outline: "none",
};

const labelStyle = "text-gray-700 font-semibold text-sm mb-1 block";

export default function TugasKumpul() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef();
  const [submitType, setSubmitType] = useState("file"); // "file" | "link"
  const [linkUrl, setLinkUrl] = useState("");

  // Data dari halaman Tugas via navigate state
  const {
    assignmentId,
    title = "Tugas",
    deadline = "-",
    existingSubmission = null,
  } = location.state || {};

  // Ambil data user dari localStorage
  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Jika tidak ada assignmentId (akses langsung), redirect
  if (!assignmentId) {
    navigate("/tugas");
    return null;
  }

  const handleFile = (f) => {
    if (f) setFile(f);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (submitType === "file" && !file) {
      setErrorMsg("File tugas wajib diupload.");
      return;
    }
    if (submitType === "link" && !linkUrl.trim()) {
      setErrorMsg("Link tugas wajib diisi.");
      return;
    }
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (submitType === "file") {
        const fd = new FormData();
        fd.append("file", file);
        await submitAssignmentFile(assignmentId, fd);
      } else {
        await submitAssignmentText(assignmentId, linkUrl.trim());
      }
      setSuccessMsg("Tugas berhasil dikumpulkan!");
      setTimeout(() => navigate("/tugas"), 1500);
    } catch (err) {
      console.error("Gagal kumpul tugas:", err);
      setErrorMsg(err.response?.data?.message || "Gagal mengumpulkan tugas.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = (id) => previewFile(id, "assignments");
  const handleDownload = (id) => downloadFile(id, "assignments");

  return (
    <UserLayout>
      <div className="min-h-screen flex items-start lg:items-center justify-center">
        <div
          className="relative z-10 w-full rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 8px 48px rgba(180,0,255,0.25)",
          }}
        >
          {/* HEADER */}
          <div
            className="px-6 md:px-8 py-5 text-center border-b"
            style={{ borderColor: "rgba(0,0,0,0.10)" }}
          >
            <h2 className="text-gray-800 font-bold text-lg">Kumpul Tugas</h2>
          </div>

          {/* BODY */}
          <div className="px-6 md:px-8 py-6 flex flex-col gap-4">
            {/* JUDUL TUGAS */}
            <div>
              <p className="text-gray-800 font-bold text-sm">{title}</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Deadline: {deadline}
              </p>
            </div>

            {/* SUDAH DIKUMPULKAN SEBELUMNYA */}
            {existingSubmission && (
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.25)",
                }}
              >
                <div>
                  <p className="text-green-700 text-xs font-semibold">
                    ✓ Sudah dikumpulkan sebelumnya
                  </p>
                  {existingSubmission.score != null && (
                    <p className="text-green-600 text-xs mt-0.5">
                      Nilai: {parseFloat(existingSubmission.score).toFixed(1)}
                    </p>
                  )}
                </div>
                {existingSubmission.textContent &&
                /^https?:\/\//.test(existingSubmission.textContent) ? (
                  <a
                    href={existingSubmission.textContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate max-w-[150px]"
                  >
                    Lihat link lama
                  </a>
                ) : existingSubmission.fileUrl ? (
                  <button
                    onClick={() => previewFile(assignmentId, "assignments")}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Lihat file lama
                  </button>
                ) : null}
              </div>
            )}

            {/* Email — readonly dari localStorage */}
            <div>
              <label className={labelStyle}>Email</label>
              <input
                type="text"
                value={userLocal.email || ""}
                readOnly
                style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>

            {/* TOGGLE TIPE SUBMIT */}
            <div>
              <label className={labelStyle}>Jenis Pengumpulan</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSubmitType("file")}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border transition"
                  style={{
                    background:
                      submitType === "file"
                        ? "linear-gradient(135deg,#7B2FBE,#501A5E)"
                        : "transparent",
                    color: submitType === "file" ? "white" : "#666",
                    borderColor:
                      submitType === "file" ? "#7B2FBE" : "rgba(0,0,0,0.12)",
                  }}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setSubmitType("link")}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border transition"
                  style={{
                    background:
                      submitType === "link"
                        ? "linear-gradient(135deg,#7B2FBE,#501A5E)"
                        : "transparent",
                    color: submitType === "link" ? "white" : "#666",
                    borderColor:
                      submitType === "link" ? "#7B2FBE" : "rgba(0,0,0,0.12)",
                  }}
                >
                  Link URL
                </button>
              </div>
            </div>

            {/* INPUT LINK (jika pilih link) */}
            {submitType === "link" && (
              <div>
                <label className={labelStyle}>Link Tugas *</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            {submitType === "file" && (
              <div>
                <label className={labelStyle}>
                  File Tugas *{" "}
                  {existingSubmission
                    ? "(Upload file baru untuk mengganti)"
                    : ""}
                </label>
                <div
                  className="relative flex flex-col items-center justify-center gap-3 py-8 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{
                    border: `2px dashed ${dragging ? "#7B2FBE" : "rgba(0,0,0,0.12)"}`,
                    background: dragging
                      ? "rgba(120,0,200,0.04)"
                      : "rgba(0,0,0,0.02)",
                    minHeight: "130px",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.pptx,.zip,.rar,.doc,.ppt"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <div className="flex items-center gap-2 text-gray-600 text-xs font-medium px-4">
                      <FileText
                        size={16}
                        className="text-purple-500 shrink-0"
                      />
                      <span className="truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                        }}
                      >
                        <Upload size={18} className="text-white" />
                      </div>
                      <p className="text-gray-400 text-xs text-center px-4">
                        Seret dan lepas file tugasmu di sini
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-2 md:mt-0 md:absolute md:right-4 md:bottom-4 px-5 py-2 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all"
                    style={{
                      background: "linear-gradient(135deg,#00AA55,#007733)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                    }}
                  >
                    Pilih File
                  </button>
                </div>
              </div>
            )}

            {/* UPLOAD FILE */}

            {/* PESAN */}
            {successMsg && (
              <p className="text-green-600 text-sm text-center font-semibold">
                {successMsg}
              </p>
            )}
            {errorMsg && (
              <p className="text-red-500 text-sm text-center">{errorMsg}</p>
            )}

            {/* SUBMIT */}
            <div className="flex justify-end mt-1">
              <button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  (submitType === "file" ? !file : !linkUrl.trim())
                }
                className="w-full md:w-auto px-7 py-[10px] rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(120,0,200,0.4)] disabled:opacity-50 disabled:scale-100"
                style={{
                  background:
                    "linear-gradient(135deg, #7B2FBE 0%, #501A5E 100%)",
                  boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
                }}
              >
                {submitting
                  ? "Mengumpulkan..."
                  : existingSubmission
                    ? "Kumpul Ulang"
                    : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
