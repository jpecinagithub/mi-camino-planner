import type { CaminoPlan } from "../types";
import { TRANSPORT_LABELS } from "../types";
import { MapPinned, Calendar, Route, TrendingUp } from "lucide-react";

export function PlanSummary({ plan }: { plan: CaminoPlan }) {
  const avg = plan.totalDistance / plan.days;
  return (
    <div className="bg-white rounded-[24px] border border-stone-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-camino-green to-camino-green-dark p-6 text-white">
        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-camino-yellow animate-pulse" /> Tu Camino está listo
        </div>
        <h2 className="mt-3 text-[24px] sm:text-[26px] font-extrabold leading-tight">{plan.camino}</h2>
        <p className="mt-1.5 text-white/90 flex items-center gap-2 text-[15px] font-medium">
          <MapPinned className="w-4 h-4" /> {plan.origin} <span className="opacity-60">→</span> {plan.destination}
        </p>
        <div className="mt-2 inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-sm">
          <span>{TRANSPORT_LABELS[plan.transportMode]}</span>
          <span className="opacity-50">•</span>
          <span>{plan.days} días</span>
          <span className="opacity-50">•</span>
          <span>≈ {plan.totalDistance.toFixed(0)} km</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100 bg-stone-50/60">
        <div className="p-4 text-center">
          <div className="flex justify-center text-stone-500 mb-1">
            <Route className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase">Distancia</div>
          <div className="text-[18px] font-extrabold text-stone-800">{plan.totalDistance.toFixed(0)} km</div>
        </div>
        <div className="p-4 text-center">
          <div className="flex justify-center text-stone-500 mb-1">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase">Días</div>
          <div className="text-[18px] font-extrabold text-stone-800">{plan.days}</div>
        </div>
        <div className="p-4 text-center">
          <div className="flex justify-center text-stone-500 mb-1">
            <Route className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase">Media</div>
          <div className="text-[18px] font-extrabold text-stone-800">{avg.toFixed(1).replace(".", ",")} km/día</div>
        </div>
        <div className="p-4 text-center">
          <div className="flex justify-center text-stone-500 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase">Desnivel</div>
          <div className="text-[18px] font-extrabold text-stone-800">+{plan.totalElevationGain?.toLocaleString("es-ES") || 0} m</div>
        </div>
      </div>
    </div>
  );
}
