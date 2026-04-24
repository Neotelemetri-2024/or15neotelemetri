import api from "../components/api/axios";

export const getSecureFileUrl = async (apiEndpoint) => {
  try {
    const response = await api.get("/auth/file-token");
    const { file_token } = response.data;
    return `https://b3or15.neotelemetri.id/api${apiEndpoint}?token=${file_token}`;
  } catch (error) {
    console.error("Secure URL Error:", error);
    return null;
  }
};

export const previewFile = async (id, type = "learning-modules") => {
  try {
    const newTab = window.open("", "_blank");
    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html><html>
          <head><title>Memuat file...</title>
          <style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#1a0023;color:white;font-size:14px;}</style>
          </head><body>Memuat file, harap tunggu...</body>
        </html>`);
    }

    const secureUrl = await getSecureFileUrl(`/${type}/${id}/preview`);
    if (!secureUrl) { newTab?.close(); return; }

    const res = await fetch(secureUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const localUrl = URL.createObjectURL(blob);

    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html><html>
          <head><title>Preview</title>
          <style>*{margin:0;padding:0;}body{width:100vw;height:100vh;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style>
          </head><body><iframe src="${localUrl}"></iframe></body>
        </html>`);
      newTab.document.close();
    }
  } catch (err) {
    console.error("Gagal preview:", err);
  }
};

export const downloadFile = async (id, type = "learning-modules") => {
  try {
    const secureUrl = await getSecureFileUrl(`/${type}/${id}/download`);
    if (!secureUrl) return;
    window.location.href = secureUrl;
  } catch (err) {
    console.error("Gagal download:", err);
  }
};
// import api from "../components/api/axios";

// export const getSecureFileUrl = async (apiEndpoint) => {
//   try {
//     const response = await api.get("/auth/file-token");
//     const { file_token } = response.data;
//     return `https://b3or15.neotelemetri.id/api${apiEndpoint}?token=${file_token}`;
//   } catch (error) {
//     console.error("Secure URL Error:", error);
//     return null;
//   }
// };

// // Preview — URL di browser tidak tampilkan endpoint BE
// export const previewFile = async (id, type = "learning-modules") => {
//   try {
//     // 1. Buka tab baru DULU sebelum fetch — user langsung dapat feedback
//     const newTab = window.open("", "_blank");
//     if (newTab) {
//       newTab.document.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>Memuat file...</title>
//             <style>
//               body { 
//                 margin: 0; 
//                 display: flex; 
//                 align-items: center; 
//                 justify-content: center; 
//                 height: 100vh; 
//                 font-family: sans-serif;
//                 background: #1a0023;
//                 color: white;
//                 font-size: 14px;
//               }
//             </style>
//           </head>
//           <body>Memuat file, harap tunggu...</body>
//         </html>
//       `);
//     }

//     // 2. Fetch paralel: token + file sekaligus
//     const secureUrl = await getSecureFileUrl(`/${type}/${id}/preview`);
//     if (!secureUrl) {
//       newTab?.close();
//       return;
//     }

//     const res = await fetch(secureUrl);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const blob = await res.blob();
//     const localUrl = URL.createObjectURL(blob);

//     // 3. Tampilkan file di tab yang sudah terbuka
//     if (newTab) {
//       newTab.document.body.innerHTML = "";
//       newTab.document.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>Preview</title>
//             <style>
//               * { margin: 0; padding: 0; }
//               body { width: 100vw; height: 100vh; overflow: hidden; }
//               iframe { width: 100%; height: 100%; border: none; }
//             </style>
//           </head>
//           <body>
//             <iframe src="${localUrl}"></iframe>
//           </body>
//         </html>
//       `);
//       newTab.document.close();
//     }
//   } catch (err) {
//     console.error("Gagal preview:", err);
//   }
// };

// // Download
// export const downloadFile = async (id, type = "learning-modules") => {
//   try {
//     const secureUrl = await getSecureFileUrl(`/${type}/${id}/download`);
//     if (!secureUrl) return;
//     window.location.href = secureUrl;
//   } catch (err) {
//     console.error("Gagal download:", err);
//   }
// };
