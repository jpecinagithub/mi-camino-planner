import { CAMINOS } from "../types";
import { Check } from "lucide-react";

const CaminoIcons: Record<string, string> = {
  "Camino Francés": "⛪",
  "Camino Portugués": "🌊",
  "Camino del Norte": "🏔️",
  "Camino Primitivo": "🌲",
  "Camino Inglés": "⛴️",
  "Vía de la Plata": "🏛️",
  Otro: "✏️",
};

export function CaminoSelector({
  value,
  onChange,
  otroValue,
  onOtroChange,
}: {
  value: string;
  onChange: (v: string) => void;
  otroValue: string;
  onOtroChange: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-stone-200 p-5 sm:p-6 shadow-sm">
      <h2 className="text-[18px] font-bold text-stone-800 mb-1">¿Qué Camino quieres hacer?</h2>
      <p className="text-sm text-stone-500 mb-4">Elige tu ruta. Puedes cambiarla después.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CAMINOS.map((camino) => {
          const selected = value === camino;
          return (
            <button
              key={camino}
              type="button"
              onClick={() => onChange(camino)}
              className={`text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-camino-green focus-visible:ring-offset-2 ${
                selected
                  ? "border-camino-green bg-camino-green-light shadow-sm"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <span className="text-[22px] leading-none">{CaminoIcons[camino] || "🥾"}</span>
              <span className={`text-[15px] font-semibold flex-1 ${selected ? "text-camino-green-dark" : "text-stone-700"}`}>
                {camino}
              </span>
              {selected && (
                <span className="w-6 h-6 rounded-full bg-camino-green flex items-center justify-center text-white shrink-0">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {value === "Otro" && (
        <div className="mt-4 animate-fadeIn">
          <label className="text-sm font-medium text-stone-700">Nombre de tu Camino</label>
          <input
            value={otroValue}
            onChange={(e) => onOtroChange(e.target.value)}
            placeholder="Ej. Camino de Invierno"
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-[15px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-camino-green focus:border-camino-green"
          />
        </div>
      )}
    </div>
  );
}
