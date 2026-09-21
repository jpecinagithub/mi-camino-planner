import { Footprints, MapPinned } from "lucide-react";

export function Header({ onNewCamino, hasPlan }: { onNewCamino?: () => void; hasPlan?: boolean }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-[840px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-camino-green flex items-center justify-center text-white">
            <MapPinned className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-bold text-[17px] leading-none text-stone-800 tracking-tight flex items-center gap-1.5">
              Mi Camino <Footprints className="w-4 h-4 text-camino-yellow" />
            </div>
            <div className="text-[11px] text-stone-500 font-medium tracking-wide">Tu Camino, etapa a etapa</div>
          </div>
        </div>
        {hasPlan && onNewCamino && (
          <button
            onClick={onNewCamino}
            className="text-sm font-medium text-camino-green hover:text-camino-green-dark px-3 py-2 rounded-xl hover:bg-camino-green-light transition-colors"
          >
            Nuevo Camino
          </button>
        )}
      </div>
    </header>
  );
}
