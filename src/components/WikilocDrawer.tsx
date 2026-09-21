import { X, ExternalLink, ArrowLeft } from "lucide-react";
import type { CaminoStage } from "../types";
import { useEffect } from "react";

export function WikilocDrawer({
  stage,
  onClose,
}: {
  stage: CaminoStage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (stage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  if (!stage) return null;

  const hasEmbed = !!stage.wikiloc?.embedUrl;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-[640px] bg-white h-full sm:h-auto sm:max-h-[92vh] sm:m-4 sm:rounded-[24px] shadow-2xl flex flex-col animate-fadeIn overflow-hidden max-sm:rounded-none">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-200 bg-white">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-stone-900 px-2 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a mi plan
          </button>
          <div className="flex items-center gap-2">
            {stage.wikiloc?.url && (
              <a
                href={stage.wikiloc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-camino-green hover:text-camino-green-dark px-3 py-2 rounded-xl hover:bg-camino-green-light transition-colors"
              >
                Abrir en Wikiloc <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="px-4 sm:px-6 py-4 bg-stone-50 border-b border-stone-100">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-camino-yellow text-stone-800 text-xs font-extrabold">DÍA {stage.day}</div>
          <h3 className="mt-2 text-[18px] font-bold text-stone-800">
            {stage.origin} → {stage.destination}
          </h3>
          <p className="text-sm text-stone-500">
            {stage.distance} km • {stage.estimatedDuration} • +{stage.elevationGain} m
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-white">
          {hasEmbed ? (
            <iframe
              title={`Wikiloc ${stage.wikiloc?.title || stage.destination}`}
              src={stage.wikiloc!.embedUrl}
              className="w-full h-[62vh] sm:h-[520px] border-0"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-stone-600 font-medium">Esta ruta se abrirá directamente en Wikiloc.</p>
              <p className="text-sm text-stone-500 mt-1">No hay vista embebida disponible para esta ruta.</p>
              {stage.wikiloc?.url && (
                <a
                  href={stage.wikiloc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-camino-green text-white px-5 py-3 rounded-xl font-semibold hover:bg-camino-green-dark transition-colors"
                >
                  Abrir en Wikiloc <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <div className="p-4 sm:p-6">
            <p className="text-sm leading-relaxed text-stone-600">{stage.description}</p>
            {stage.wikiloc?.title && <p className="mt-3 text-xs text-stone-500">Ruta: {stage.wikiloc.title}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
