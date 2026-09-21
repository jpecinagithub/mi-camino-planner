import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { CaminoSelector } from "../components/CaminoSelector";
import { LocationInputs } from "../components/LocationInputs";
import { TransportSelector } from "../components/TransportSelector";
import { DaysSelector } from "../components/DaysSelector";
import { PlanSummary } from "../components/PlanSummary";
import { Timeline } from "../components/Timeline";
import { StageCard } from "../components/StageCard";
import { WikilocDrawer } from "../components/WikilocDrawer";
import { LoadingState } from "../components/LoadingState";
import { usePlan } from "../hooks/usePlan";
import type { CaminoStage, PlannerInput, TransportMode } from "../types";
import { Sparkles, RefreshCcw, Download, Pencil, AlertCircle, MapPinned } from "lucide-react";
import { downloadPlanPdf } from "../utils/pdf";

export function Home() {
  const [camino, setCamino] = useState("Camino Francés");
  const [otroCamino, setOtroCamino] = useState("");
  const [origin, setOrigin] = useState("Logroño");
  const [destination, setDestination] = useState("Santiago de Compostela");
  const [transportMode, setTransportMode] = useState<TransportMode>("walking");
  const [days, setDays] = useState(10);

  const { state, plan, error, loadingMessage, generate, regenerate, clear, setPlan, setState } = usePlan();
  const [wikilocStage, setWikilocStage] = useState<CaminoStage | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);

  // Rehydration from localStorage
  useEffect(() => {
    try {
      const rawPlan = localStorage.getItem("mi-camino:lastPlan");
      const rawInput = localStorage.getItem("mi-camino:lastInput");
      if (rawPlan && rawInput && !plan) {
        const parsedPlan = JSON.parse(rawPlan);
        const parsedInput = JSON.parse(rawInput) as PlannerInput;
        setCamino(parsedInput.camino);
        if (parsedInput.camino !== "Camino Francés" && parsedInput.camino !== "Camino Portugués" && parsedInput.camino !== "Camino del Norte" && parsedInput.camino !== "Camino Primitivo" && parsedInput.camino !== "Camino Inglés" && parsedInput.camino !== "Vía de la Plata") {
          setCamino("Otro");
          setOtroCamino(parsedInput.camino);
        }
        setOrigin(parsedInput.origin);
        setDestination(parsedInput.destination);
        setTransportMode(parsedInput.transportMode);
        setDays(parsedInput.days);
        setPlan(parsedPlan);
        setState("success");
      }
    } catch {
      // ignore
    }
  }, [plan, setPlan, setState]);

  const displayPlan = plan;
  const isLoading = state === "loading" || state === "regenerating";

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setLoadingIdx((i) => (i + 1) % 4), 650);
    return () => clearInterval(id);
  }, [isLoading]);

  const handleCreate = () => {
    const finalCamino = camino === "Otro" ? (otroCamino.trim() || "Otro") : camino;
    if (!origin.trim() || !destination.trim()) {
      alert("Por favor, indica origen y destino.");
      return;
    }
    const input: PlannerInput = {
      camino: finalCamino,
      origin: origin.trim(),
      destination: destination.trim(),
      transportMode,
      days,
    };
    generate(input);
    setShowEdit(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRebalance = () => {
    if (!displayPlan) return;
    const input: PlannerInput = {
      camino: displayPlan.camino,
      origin: displayPlan.origin,
      destination: displayPlan.destination,
      transportMode: displayPlan.transportMode,
      days: displayPlan.days,
    };
    regenerate(input);
  };

  const handleModify = () => {
    if (displayPlan) {
      setCamino(displayPlan.camino === "Otro" || !["Camino Francés","Camino Portugués","Camino del Norte","Camino Primitivo","Camino Inglés","Vía de la Plata"].includes(displayPlan.camino) ? "Otro" : displayPlan.camino);
      if (!["Camino Francés","Camino Portugués","Camino del Norte","Camino Primitivo","Camino Inglés","Vía de la Plata"].includes(displayPlan.camino)) {
        setOtroCamino(displayPlan.camino);
      }
      setOrigin(displayPlan.origin);
      setDestination(displayPlan.destination);
      setTransportMode(displayPlan.transportMode);
      setDays(displayPlan.days);
    }
    setShowEdit(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewCamino = () => {
    clear();
    setShowEdit(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header onNewCamino={displayPlan ? handleNewCamino : undefined} hasPlan={!!displayPlan} />

      <main className="max-w-[840px] mx-auto px-4 sm:px-6 pb-12">
        {(!displayPlan || showEdit) && (
          <div className="pt-8 sm:pt-10 text-center">
            <h1 className="text-[28px] sm:text-[36px] font-extrabold text-stone-800 tracking-tight leading-none">
              Tu Camino de Santiago, <span className="text-camino-green">etapa a etapa.</span>
            </h1>
            <p className="mt-3 text-[16px] sm:text-[17px] text-stone-500 max-w-[560px] mx-auto leading-relaxed">
              Dinos cómo quieres hacerlo y prepararemos tu Camino.
            </p>
            <p className="mt-2 inline-flex items-center gap-2 bg-camino-yellow-light border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> En 30 segundos tienes organizado tu Camino
            </p>
          </div>
        )}

        {(!displayPlan || showEdit) && (
          <div className="mt-8 space-y-4">
            <CaminoSelector value={camino} onChange={setCamino} otroValue={otroCamino} onOtroChange={setOtroCamino} />
            <LocationInputs origin={origin} destination={destination} onOriginChange={setOrigin} onDestinationChange={setDestination} />
            <TransportSelector value={transportMode} onChange={setTransportMode} />
            <DaysSelector value={days} onChange={setDays} />

            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full bg-camino-green hover:bg-camino-green-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[17px] py-4 rounded-2xl shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-camino-green"
            >
              <Sparkles className="w-5 h-5" /> {isLoading ? "Creando tu Camino…" : "Crear mi Camino"}
            </button>

            {showEdit && displayPlan && (
              <button
                onClick={() => setShowEdit(false)}
                className="w-full bg-white border-2 border-stone-200 text-stone-700 font-semibold py-3.5 rounded-2xl hover:bg-stone-50 transition-colors"
              >
                Cancelar edición
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="mt-8">
            <LoadingState message={loadingMessage} index={loadingIdx} />
          </div>
        )}

        {state === "error" && error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">No hemos podido preparar tu Camino. Inténtalo de nuevo.</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button onClick={handleCreate} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800 underline">
                Reintentar
              </button>
            </div>
          </div>
        )}

        {displayPlan && state !== "loading" && !showEdit && (
          <div className="mt-8 space-y-4 animate-fadeIn">
            <PlanSummary plan={displayPlan} />
            <Timeline plan={displayPlan} />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleModify}
                className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <Pencil className="w-4 h-4" /> Modificar plan
              </button>
              <button
                onClick={handleRebalance}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                <RefreshCcw className="w-4 h-4" /> Reequilibrar etapas
              </button>
              <button
                onClick={() => downloadPlanPdf(displayPlan)}
                className="inline-flex items-center gap-1.5 bg-stone-800 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-stone-900 transition-colors"
              >
                <Download className="w-4 h-4" /> Descargar PDF
              </button>
            </div>

            <div className="space-y-3">
              {displayPlan.stages.map((stage) => (
                <StageCard key={stage.day} stage={stage} onWikiloc={setWikilocStage} />
              ))}
            </div>

            <div className="bg-camino-green-light border border-emerald-100 rounded-2xl p-4 flex gap-3">
              <MapPinned className="w-5 h-5 text-camino-green shrink-0 mt-0.5" />
              <div className="text-sm text-stone-700">
                <span className="font-semibold">¡Buen Camino!</span> Guarda este plan en tu móvil. Cada etapa termina en localidades con servicios.
                <br />
                <span className="text-stone-500 text-xs">Distancias orientativas: a pie 20–30 km, MTB 40–70 km, carretera 60–100 km. Ajustadas por desnivel y disponibilidad de alojamiento.</span>
              </div>
            </div>
          </div>
        )}

        {state === "regenerating" && displayPlan && (
          <div className="mt-4">
            <LoadingState message="Reequilibrando etapas…" index={2} />
          </div>
        )}
      </main>

      <WikilocDrawer stage={wikilocStage} onClose={() => setWikilocStage(null)} />

      <footer className="mt-8 border-t border-stone-200 bg-white">
        <div className="max-w-[840px] mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-stone-500">Mi Camino Planner • Sin cuentas, sin base de datos • Tu plan se guarda solo en tu navegador</p>
          <p className="text-[11px] text-stone-400 mt-1">Las rutas de Wikiloc se abren en un visor integrado. Nunca inventamos URLs de embed.</p>
        </div>
      </footer>
    </div>
  );
}
