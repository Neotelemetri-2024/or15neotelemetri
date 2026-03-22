import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search, SlidersHorizontal } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

const dummyData = [
  { id: 1, namaKegiatan: "wawancara",         tanggal: "DD/MM/YYY", hadir: 0, alfa: 0, sakit: 0, izin: 0 },
  { id: 2, namaKegiatan: "Opening Ceremony",  tanggal: "DD/MM/YYY", hadir: 0, alfa: 0, sakit: 0, izin: 0 },
  { id: 3, namaKegiatan: "gatau",             tanggal: "DD/MM/YYY", hadir: 0, alfa: 0, sakit: 0, izin: 0 },
  { id: 4, namaKegiatan: "Chapstone project", tanggal: "DD/MM/YYY", hadir: 0, alfa: 0, sakit: 0, izin: 0 },
  { id: 5, namaKegiatan: "Get Investor",      tanggal: "DD/MM/YYY", hadir: 0, alfa: 0, sakit: 0, izin: 0 },
];

const columns = ["No", "Nama Kegiatan", "Tanggal", "Hadir", "Alfa", "Sakit", "Izin", "Action"];

export default function ListAbsensiAdmin() {
  const navigate = useNavigate();
  const [activeDivision, setActiveDivision] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = dummyData.filter((row) =>
    row.namaKegiatan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4">

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">NamaUser</span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* TABS + CARD */}
        <div className="mt-6">
          <DivisionTabs
            activeDivision={activeDivision}
            setActiveDivision={setActiveDivision}
          />

          <div
            className="flex flex-col"
            style={{
              background: "white",
              borderRadius: "0 0 16px 16px",
              boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              position: "relative",
              zIndex: 15,
            }}
          >
            {/* FILTER + SEARCH */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <button
                className="flex items-center gap-2 px-4 py-[7px] rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 shrink-0"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                }}
              >
                <SlidersHorizontal size={13} />
                Filter
              </button>

              <div
                className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1"
                style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.10)" }}
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

            {/* TABLE — 8 kolom, min-w lebih besar */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="p-5 text-xs font-bold text-gray-700 whitespace-nowrap"
                        style={{ textAlign: col === "Nama Kegiatan" ? "left" : "center" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      className="transition-colors duration-150 hover:bg-purple-50"
                      style={{
                        borderBottom: i < filtered.length - 1
                          ? "1px solid rgba(0,0,0,0.05)"
                          : "none",
                      }}
                    >
                      <td className="p-5 text-gray-500 text-xs text-center">{row.id}</td>
                      <td className="p-5 text-gray-800 text-xs whitespace-nowrap">{row.namaKegiatan}</td>
                      <td className="p-5 text-gray-500 text-xs text-center whitespace-nowrap">{row.tanggal}</td>
                      <td className="p-5 text-gray-600 text-xs text-center">{row.hadir}</td>
                      <td className="p-5 text-gray-600 text-xs text-center">{row.alfa}</td>
                      <td className="p-5 text-gray-600 text-xs text-center">{row.sakit}</td>
                      <td className="p-5 text-gray-600 text-xs text-center">{row.izin}</td>

                      {/* ACTION */}
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/absensi/${row.id}/edit`)}
                            className="px-4 py-1 rounded-full text-xs font-semibold transition-all hover:brightness-110 whitespace-nowrap"
                            style={{
                              background: "#F0C000",
                              color: "white",
                              boxShadow: "0 2px 8px rgba(200,160,0,0.3)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/admin/absensi/${row.id}/scan`)}
                            className="px-4 py-1 rounded-full text-xs font-semibold transition-all hover:brightness-110 whitespace-nowrap"
                            style={{
                              background: "linear-gradient(135deg,#00BB66,#007744)",
                              color: "white",
                              boxShadow: "0 2px 8px rgba(0,150,80,0.3)",
                            }}
                          >
                            Scan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}