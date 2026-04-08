// src/context/NotifContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAllVerifications } from "../../services/adminServices";
import api from "../api/axios";

const NotifContext = createContext({
  verifikasiCount: 0,
  pembayaranCount: 0,
  refresh: () => {},
});

export function NotifProvider({ children }) {
  const [verifikasiCount, setVerifikasiCount] = useState(0);
  const [pembayaranCount, setPembayaranCount] = useState(0);

  const fetchCounts = useCallback(async () => {
    try {
      const [verifRes, payRes] = await Promise.all([
        getAllVerifications(),
        api.get("/payments"),
      ]);
      setVerifikasiCount(
        verifRes.data.filter((v) => v.status === "PENDING").length
      );
      setPembayaranCount(
        payRes.data.filter((p) => p.status === "PENDING").length
      );
    } catch (err) {
      console.error("Gagal fetch notif count:", err);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <NotifContext.Provider
      value={{ verifikasiCount, pembayaranCount, refresh: fetchCounts }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);