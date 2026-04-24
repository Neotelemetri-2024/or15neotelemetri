import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search, SlidersHorizontal, Trash2, Plus } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import {
  getAllActivities,
  deleteActivity,
} from "../../services/attendanceService";

const columns = [
  "No",
  "Nama Kegiatan",
  "Tanggal",
  "Hadir",
  "Alfa",
  "Sakit",
  "Izin",
  "Action",
];

export default function ListAbsensiAdmin() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id kegiatan yang akan dihapus

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await getAllActivities();
      setActivities(res.data);
    } catch (err) {
      console.error("Gagal mengambil data aktivitas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteActivity(id);
      setDeleteConfirm(null);
      fetchActivities();
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filtered = activities.filter((row) =>
    row.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4">
        {/* TOP RIGHT */}
        <div className="flex justify-between items-center gap-3">
          <h1 className="text-white font-bold text-lg">Absensi</h1>
        </div>

        {/* CARD */}
        <div
          className="flex flex-col"
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
          }}
        >
          {/* HEADER CARD */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <p className="text-gray-800 font-bold text-sm">List Absen</p>
            <button
              onClick={() => navigate("/admin/addabsensi")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold transition-all hover:brightness-110"
              style={{ background: "#6E3FBF" }}
            >
              <Plus size={13} />
              Add List Absen
            </button>
          </div>

          {/* FILTER + SEARCH */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            
            <div
              className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1"
              style={{
                background: "rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.10)",
              }}
            >
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
              />
              <Search size={13} className="text-gray-400 shrink-0" />
            </div>
          </div>

          {/* TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                      style={{
                        textAlign: col === "Nama Kegiatan" ? "left" : "center",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      className="transition-colors duration-150 hover:bg-purple-50 cursor-pointer"
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "none",
                      }}
                      // onClick={() =>
                      //   navigate(`/admin/absensi/${row.id}/detail`)
                      // }
                    >
                      <td className="p-4 text-gray-500 text-xs text-center">
                        {i + 1}
                      </td>
                      <td className="p-4 text-gray-800 text-xs whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="p-4 text-gray-500 text-xs text-center whitespace-nowrap">
                        {formatDate(row.deadline)}
                      </td>
                      <td className="p-4 text-gray-600 text-xs text-center">
                        {row.stats?.present ?? 0}
                      </td>
                      <td className="p-4 text-gray-600 text-xs text-center">
                        {row.stats?.absent ?? 0}
                      </td>
                      <td className="p-4 text-gray-600 text-xs text-center">
                        {row.stats?.sick ?? 0}
                      </td>
                      <td className="p-4 text-gray-600 text-xs text-center">
                        {row.stats?.excused ?? 0}
                      </td>
                      <td
                        className="p-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/absensi/${row.id}/edit`)
                            }
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: "#F0C000" }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(row.id)}
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: "#ef4444" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden flex flex-col divide-y divide-black/5">
            {loading ? (
              <p className="text-center py-10 text-gray-400 text-sm">
                Memuat data...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">
                Tidak ada data.
              </p>
            ) : (
              filtered.map((row, i) => (
                <div
                  key={row.id}
                  className="px-5 py-4 flex flex-col gap-2 hover:bg-purple-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/absensi/${row.id}/detail`)}
                >
                  {/* NAMA + TANGGAL */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-800 text-sm font-semibold">
                      {row.name}
                    </p>
                    <p className="text-gray-400 text-xs shrink-0">
                      {formatDate(row.deadline)}
                    </p>
                  </div>

                  {/* STATS BADGES */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "Hadir",
                        value: row.stats?.present ?? 0,
                        color: "#16a34a",
                        bg: "#dcfce7",
                      },
                      {
                        label: "Alfa",
                        value: row.stats?.absent ?? 0,
                        color: "#dc2626",
                        bg: "#fee2e2",
                      },
                      {
                        label: "Sakit",
                        value: row.stats?.sick ?? 0,
                        color: "#d97706",
                        bg: "#fef3c7",
                      },
                      {
                        label: "Izin",
                        value: row.stats?.excused ?? 0,
                        color: "#2563eb",
                        bg: "#dbeafe",
                      },
                    ].map((s) => (
                      <span
                        key={s.label}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ color: s.color, background: s.bg }}
                      >
                        {s.label}: {s.value}
                      </span>
                    ))}
                  </div>

                  {/* ACTION */}
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    
                    <button
                      onClick={() => navigate(`/admin/absensi/${row.id}/edit`)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: "#F0C000" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(row.id)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: "#ef4444" }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl px-8 py-7 flex flex-col items-center gap-4 max-w-xs w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <p className="text-gray-800 font-bold text-sm text-center">
              Hapus Kegiatan?
            </p>
            <p className="text-gray-500 text-xs text-center">
              Data absensi kegiatan ini akan ikut terhapus.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                style={{ background: "#ef4444" }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
