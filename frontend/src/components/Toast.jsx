import React, { useEffect } from "react";

function Toast({ message, type = "info", duration = 3500, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styleMap = {
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-slate-900",
    error: "bg-rose-600 text-white",
    info: "bg-slate-900 text-white",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl shadow-2xl p-4 ${styleMap[type] || styleMap.info}`}
    >
      <div className="flex items-start gap-3">
        <div className="font-semibold">
          {type === "success"
            ? "Başarılı"
            : type === "warning"
              ? "Uyarı"
              : type === "error"
                ? "Hata"
                : "Bilgi"}
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-sm font-bold opacity-80 hover:opacity-100"
        >
          Kapat
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{message}</p>
    </div>
  );
}

export default Toast;
