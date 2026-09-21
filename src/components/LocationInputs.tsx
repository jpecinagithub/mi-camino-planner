import { MapPin, Flag } from "lucide-react";

const suggestionsStart = [
  "Saint-Jean-Pied-de-Port",
  "Roncesvalles",
  "Pamplona",
  "Logroño",
  "Burgos",
  "León",
  "Sarria",
];

export function LocationInputs({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
}: {
  origin: string;
  destination: string;
  onOriginChange: (v: string) => void;
  onDestinationChange: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-stone-200 p-5 sm:p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-stone-800 mb-1 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-camino-green" />
          ¿Desde dónde empiezas?
        </h2>
        <input
          value={origin}
          onChange={(e) => onOriginChange(e.target.value)}
          placeholder="Ej. Logroño"
          className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-[16px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-camino-green focus:border-camino-green"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestionsStart.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onOriginChange(s)}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
                origin === s
                  ? "bg-camino-green text-white border-camino-green"
                  : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-stone-100" />

      <div>
        <h2 className="text-[18px] font-bold text-stone-800 mb-1 flex items-center gap-2">
          <Flag className="w-5 h-5 text-camino-yellow" />
          ¿Dónde quieres terminar?
        </h2>
        <p className="text-xs text-stone-500">Por defecto: Santiago de Compostela</p>
        <input
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="Santiago de Compostela"
          className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-[16px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-camino-green focus:border-camino-green"
        />
      </div>
    </div>
  );
}
