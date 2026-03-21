import { useState } from "react";
import { Search, SlidersHorizontal, User } from "lucide-react";
import { CheckCircle2, XCircle } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

const dummyData = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  nama: "Bahlil",
  krs: i % 3 === 0,
  fotoFormal: i % 2 !== 0,
  igNeo: i % 3 !== 1,
  igMarketing: i % 2 === 0,
}));

const columns = [
  "Nama",
  "KRS",
  "Foto Formal",
  "Bukti follow IG Neo",
  "Bukti follow IG Marketing",
];

function StatusIcon({ value }) {
  return value ? (
    <CheckCircle2 size={20} className="text-green-500 mx-auto" />
  ) : (
    <XCircle size={20} className="text-red-500 mx-auto" />
  );
}

export default function VerifikasiAdmin() {
  const [search, setSearch] = useState("");

  const filtered = dummyData.filter((row) =>
    row.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">NamaUser</span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-6">
          <DivisionTabs bgColor="#1a0023">
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
                className="flex items-center gap-3 p-4 "
                
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                  }}
                >
                  <SlidersHorizontal size={13} />
                  Filter
                </button>

                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-full flex-1"
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

              {/* TABLE — scroll horizontal di mobile */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{ textAlign: col === "Nama" ? "left" : "center" }}
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
                          borderBottom: i < filtered.length - 1
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "none",
                        }}
                      >
                        <td className="p-5 text-gray-800 text-xs whitespace-nowrap">{row.nama}</td>
                        <td className="p-5 text-center"><StatusIcon value={row.krs} /></td>
                        <td className="p-5 text-center"><StatusIcon value={row.fotoFormal} /></td>
                        <td className="p-5 text-center"><StatusIcon value={row.igNeo} /></td>
                        <td className="p-5 text-center"><StatusIcon value={row.igMarketing} /></td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
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
    </AdminLayout>
  );
}