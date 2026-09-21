import type { CaminoPlan } from "../types";

export function Timeline({ plan }: { plan: CaminoPlan }) {
  return (
    <div className="bg-white rounded-[20px] border border-stone-200 p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-bold text-stone-700 mb-3">Visualización general</h3>
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-camino-green text-white text-xs font-bold">
          ↑
        </span>
        <span className="shrink-0 text-xs font-semibold text-stone-600 max-w-[80px] truncate">{plan.origin}</span>
        {plan.stages.map((s) => (
          <div key={s.day} className="flex items-center gap-1 shrink-0">
            <span className="w-6 sm:w-8 h-px bg-stone-300" />
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-camino-yellow text-stone-800 text-[11px] font-extrabold border border-amber-200">
              {s.day}
            </span>
          </div>
        ))}
        <span className="w-6 sm:w-8 h-px bg-stone-300 shrink-0" />
        <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-camino-green-dark text-white text-xs font-bold">
          ★
        </span>
        <span className="shrink-0 text-xs font-semibold text-stone-600">Santiago</span>
      </div>
      <div className="mt-2 flex gap-1 overflow-x-auto">
        {plan.stages.map((s) => (
          <div key={s.day} className="shrink-0 text-[10px] text-stone-500 bg-stone-50 border border-stone-100 rounded-full px-2 py-1 text-center min-w-[72px]">
            {s.distance.toFixed(0)} km
          </div>
        ))}
      </div>
    </div>
  );
}
