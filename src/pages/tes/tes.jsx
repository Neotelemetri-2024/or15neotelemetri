import { useEffect } from "react";

export default function PurpleBlobBackground() {

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes blobMove {
        0% { transform: translate(0px,0px) scale(1); }
        33% { transform: translate(40px,-60px) scale(1.1); }
        66% { transform: translate(-30px,20px) scale(0.9); }
        100% { transform: translate(0px,0px) scale(1); }
      }

      .animate-blob {
        animation: blobMove 12s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#080b14] overflow-hidden flex items-center justify-center">

      {/* BLOB 1 */}
      <div
        className="
        absolute 
        top-[-120px] 
        left-[20%] 
        w-[420px] 
        h-[420px] 
        bg-purple-500/30 
        rounded-full 
        blur-[120px] 
        animate-blob
        "
      />

      {/* BLOB 2 */}
      <div
        className="
        absolute 
        bottom-[-150px] 
        right-[10%] 
        w-[460px] 
        h-[460px] 
        bg-fuchsia-500/25 
        rounded-full 
        blur-[140px] 
        animate-blob
        "
        style={{ animationDelay: "4s" }}
      />

      {/* BLOB 3 */}
      <div
        className="
        absolute 
        top-[40%] 
        left-[-120px] 
        w-[380px] 
        h-[380px] 
        bg-indigo-500/25 
        rounded-full 
        blur-[120px] 
        animate-blob
        "
        style={{ animationDelay: "2s" }}
      />

      {/* CONTENT EXAMPLE */}
      <div className="relative z-10 text-center text-white">
        <h1 className="text-4xl font-semibold mb-3">
          AI Style Background
        </h1>
        <p className="text-white/70">
          Purple animated blob background with Tailwind
        </p>
      </div>

    </div>
  );
}