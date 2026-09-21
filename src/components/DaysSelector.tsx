import { Minus, Plus } from "lucide-react";

export function DaysSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const dec = () => onChange(Math.max(1, value - 1));
  const inc = () => onChange(Math.min(60, value + 1));

  return (
    <div className="bg-white rounded-[24px] border border-stone-200 p-5 sm:p-6 shadow-sm">
      <h2 className="text-[18px] font-bold text-stone-800 mb-1">¿Cuántos días tienes?</h2>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={dec}
          aria-label="Disminuir días"
          className="w-12 h-12 rounded-full border-2 border-stone-200 bg-white flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-camino-green"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center min-w-[140px]">
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min={1}
              max={60}
              value={value}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n)) onChange(Math.min(60, Math.max(1, n)));
                else onChange(1);
              }}
              className="w-[70px] text-center text-[36px] font-extrabold text-stone-800 bg-transparent focus:outline-none"
            />
            <span className="text-[18px] font-semibold text-stone-600">días</span>
          </div>
          <span className="text-xs font-medium text-stone-400 mt-1">1 – 60 días</span>
        </div>

        <button
          type="button"
          onClick={inc}
          aria-label="Aumentar días"
          className="w-12 h-12 rounded-full bg-camino-green text-white flex items-center justify-center hover:bg-camino-green-dark active:scale-95 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-camino-green"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-sm text-stone-500 mt-4 bg-stone-50 rounded-xl py-2.5 px-3">
        Intentaremos distribuir las etapas de forma equilibrada durante <span className="font-semibold text-stone-700">{value} días</span>.
      </p>
    </div>
  );
}
