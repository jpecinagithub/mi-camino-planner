import { Check } from "lucide-react";

export function CaminoSelector() {
  return (
    <div className="bg-white rounded-[24px] border border-stone-200 p-5 sm:p-6 shadow-sm">
      <h2 className="text-[18px] font-bold text-stone-800 mb-1">Camino Francés</h2>
      <p className="text-sm text-stone-500 mb-4">Por ahora solo el Camino Francés — el más completo y mejor señalizado.</p>
      <div className="rounded-2xl border-2 border-camino-green bg-camino-green-light p-4 flex items-center gap-3">
        <span className="text-[22px] leading-none">⛪</span>
        <span className="text-[15px] font-semibold flex-1 text-camino-green-dark">Camino Francés</span>
        <span className="w-6 h-6 rounded-full bg-camino-green flex items-center justify-center text-white shrink-0">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
      </div>
      <p className="text-xs text-stone-400 mt-3">Pronto añadiremos Portugués, Norte y más. La IA ahora se centra solo en el Francés para evitar alucinaciones.</p>
    </div>
  );
}
