import { useState } from "react";
import { Search, SlidersHorizontal, User } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

const stats = [
  { label: "Total Pendaftar", value: 150 },
  { label: "Lulus verifikasi", value: 90 },
  { label: "Sudah Bayar", value: 72 },
  { label: "Tugas Masuk", value: 43 },
];



const dummyData = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  nama: "Bahliliiiiiii",
  nim: "2311121001",
  email: "bahlil@gamil.com",
  phone: "088888888888",
  programStudi: "Teknik komputer",
  subDivisi: "Machine Learning",
}));

const columns = [
  "Nama",
  "NIM",
  "Email",
  "Phone",
  "Program Studi",
  "Sub Divisi",
];

export default function DashboardAdmin() {
  
  const [search, setSearch] = useState("");

  const filtered = dummyData.filter((row) =>
    Object.values(row).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <AdminLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-6">
        {/* ===== TOP RIGHT ===== */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">NamaUser</span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-1 py-5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span className="text-white font-bold text-3xl">{s.value}</span>
              <span className="text-white/60 text-xs text-center">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          {/* ===== WRAPPER (BIAR INDICATOR GA KE POTONG) ===== */}
          <div className="relative rounded-2xl overflow-visible">
            {/* ===== DIVISION TABS ===== */}
            <DivisionTabs bgColor="#1a0023">

            {/* ===== MAIN CARD (ISI TABLE) ===== */}
            <div
              className="rounded-b-2xl overflow-hidden flex flex-col bg-white"
              
            >
              {/* FILTER + SEARCH */}
              <div
                className="flex items-center gap-3 px-5 py-3 border-b"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                <button
                  className="flex items-center gap-2 px-4 py-[7px] rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                  }}
                >
                  <SlidersHorizontal size={13} />
                  Filter
                </button>

                <div
                  className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1 max-w-[220px]"
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
                  <Search size={13} className="text-gray-400" />
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                    >
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="text-left px-5 py-3 text-xs font-bold text-gray-700"
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
                        className="transition-colors duration-150 hover:bg-purple-50 cursor-pointer"
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        <td className="px-5 py-3 text-gray-800 text-xs">
                          {row.nama}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {row.nim}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {row.email}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {row.phone}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {row.programStudi}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {row.subDivisi}
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          Tidak ada data ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
            </div>
            </DivisionTabs>
          </div>
          
        </div>
      </div>
    </AdminLayout>
  );
}
