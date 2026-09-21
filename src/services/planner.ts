import type { CaminoPlan, CaminoPlannerService, PlannerInput } from "../types";

export class ApiCaminoPlannerService implements CaminoPlannerService {
  async generatePlan(input: PlannerInput): Promise<CaminoPlan> {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error ${res.status}: no se pudo generar el plan`);
    }

    const data = (await res.json()) as CaminoPlan;
    if (!data.stages || data.stages.length !== input.days) {
      throw new Error("Plan inválido recibido de la IA");
    }
    return data;
  }
}

// Siempre usa la IA con la única AI_API_KEY (leída solo en serverless api/plan.ts)
export const plannerService = new ApiCaminoPlannerService();
