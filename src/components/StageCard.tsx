import { Clock3, TrendingUp, TrendingDown, Mountain, MapPinned } from "lucide-react";
import type { CaminoStage } from "../types";
import { DIFFICULTY_LABELS } from "../types";

const difficultyStyles: Record<CaminoStage["difficulty"], string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

export function StageCard({
  stage,
  onWikiloc,
}: {
  stage: CaminoStage;
  onWikiloc: (stage: CaminoStage) => void;
}) {
  return (
    <div className="bg-white rounded-[20px] border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-camino-yellow text-stone-800 text-xs font-extrabold tracking-wide">
          DÍA {stage.day}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${difficultyStyles[stage.difficulty]}`}>
          <Mountain className="w-3.5 h-3.5 mr-1" />
          {DIFFICULTY_LABELS[stage.difficulty]}
        </span>
      </div>

      <h3 className="font-bold text-stone-800 text-[17px] leading-tight flex items-center gap-2">
        <MapPinned className="w-4 h-4 text-camino-green shrink-0" />
        <span className="truncate">
          {stage.origin} <span className="text-stone-400 font-normal mx-1">→</span> {stage.destination}
        </span>
      </h3>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
          <div className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase">Distancia</div>
          <div className="text-[15px] font-bold text-stone-800">{stage.distance.toFixed(1).replace(".", ",")} km</div>
        </div>
        <div className="bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
          <div className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> Duración
          </div>
          <div className="text-[14px] font-bold text-stone-800">{stage.estimatedDuration || "—"}</div>
        </div>
        <div className="bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
          <div className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Desnivel +
          </div>
          <div className="text-[14px] font-bold text-stone-800">+{stage.elevationGain ?? 0} m</div>
        </div>
        <div className="bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
          <div className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Desnivel -
          </div>
          <div className="text-[14px] font-bold text-stone-800">-{stage.elevationLoss ?? 0} m</div>
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-stone-600">{stage.description}</p>

      {stage.wikiloc && (
        <button
          onClick={() => onWikiloc(stage)}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-camino-green hover:text-camino-green-dark bg-camino-green-light hover:bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-camino-green"
        >
          Ver ruta en Wikiloc <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );
}
