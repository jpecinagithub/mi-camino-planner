import { Loader2, Compass, MapPinned, Mountain, Route } from "lucide-react";

const icons = [Compass, MapPinned, Mountain, Route];

export function LoadingState({ message, index = 0 }: { message: string; index?: number }) {
  const Icon = icons[index % icons.length];
  return (
    <div className="bg-white rounded-[24px] border border-stone-200 p-8 sm:p-10 shadow-sm text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-camino-green-light border border-emerald-100 flex items-center justify-center text-camino-green">
        <Icon className="w-7 h-7 animate-pulse" />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-camino-green" />
        <p className="text-[15px] font-semibold text-stone-700">{message}</p>
      </div>
      <div className="mt-5 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-camino-green to-camino-yellow rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: "60%" }} />
      </div>
      <p className="mt-3 text-xs text-stone-500">Esto puede tardar unos segundos…</p>
    </div>
  );
}
