import { Footprints, Bike, PersonStanding } from "lucide-react";
import type { TransportMode } from "../types";

const options: { id: TransportMode; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: "walking",
    label: "A pie",
    sub: "20–30 km/día",
    icon: <Footprints className="w-7 h-7" />,
  },
  {
    id: "mtb",
    label: "Bicicleta MTB",
    sub: "40–70 km/día",
    icon: <Bike className="w-7 h-7" />,
  },
  {
    id: "road-bike",
    label: "Bicicleta de carretera",
    sub: "60–100 km/día",
    icon: <PersonStanding className="w-7 h-7" />,
  },
];

export function TransportSelector({
  value,
  onChange,
}: {
  value: TransportMode;
  onChange: (v: TransportMode) => void;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-stone-200 p-5 sm:p-6 shadow-sm">
      <h2 className="text-[18px] font-bold text-stone-800 mb-1">¿Cómo vas a hacer el Camino?</h2>
      <p className="text-sm text-stone-500 mb-4">Elige tu modo. Ajustaremos distancias y desniveles.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-2xl border-2 p-4 flex flex-col items-center text-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-camino-green ${
                selected
                  ? "border-camino-green bg-camino-green-light shadow-sm"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <span className={`${selected ? "text-camino-green" : "text-stone-600"}`}>{opt.icon}</span>
              <span className={`text-[15px] font-bold leading-tight ${selected ? "text-camino-green-dark" : "text-stone-800"}`}>{opt.label}</span>
              <span className="text-xs text-stone-500 font-medium">{opt.sub}</span>
              {selected && <span className="mt-1 w-2 h-2 rounded-full bg-camino-green" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
