import { useCallback, useState } from "react";
import { plannerService } from "../services/planner";
import type { AppState, CaminoPlan, PlannerInput } from "../types";

export function usePlan() {
  const [state, setState] = useState<AppState>("initial");
  const [plan, setPlan] = useState<CaminoPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const generate = useCallback(async (input: PlannerInput) => {
    setState("loading");
    setError(null);
    const messages = [
      "Analizando tu Camino…",
      "Buscando las mejores etapas…",
      "Consultando rutas…",
      "Equilibrando distancias y desniveles…",
      "Preparando tu plan…",
    ];
    let idx = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMessage(messages[idx]);
    }, 650);

    try {
      const result = await plannerService.generatePlan(input);
      setPlan(result);
      setState("success");
      localStorage.setItem("mi-camino:lastPlan", JSON.stringify(result));
      localStorage.setItem("mi-camino:lastInput", JSON.stringify(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No hemos podido preparar tu Camino. Inténtalo de nuevo.");
      setState("error");
    } finally {
      clearInterval(interval);
    }
  }, []);

  const regenerate = useCallback(async (input: PlannerInput) => {
    setState("regenerating");
    setError(null);
    setLoadingMessage("Reequilibrando etapas…");
    try {
      const result = await plannerService.generatePlan(input);
      setPlan({ ...result, id: `regen-${Date.now()}` });
      setState("success");
      localStorage.setItem("mi-camino:lastPlan", JSON.stringify(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No hemos podido reequilibrar tu Camino.");
      setState("error");
    }
  }, []);

  const clear = useCallback(() => {
    setPlan(null);
    setState("initial");
    setError(null);
    localStorage.removeItem("mi-camino:lastPlan");
    localStorage.removeItem("mi-camino:lastInput");
  }, []);

  return { state, plan, error, loadingMessage, generate, regenerate, clear, setPlan, setState };
}
