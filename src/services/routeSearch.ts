import type { RouteSearchParams, RouteSearchResult, RouteSearchService } from "../types";

// Usa la misma única AI_API_KEY via /api/routes (serverless)
export class ApiRouteSearchService implements RouteSearchService {
  async searchRoute(params: RouteSearchParams): Promise<RouteSearchResult[]> {
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Search failed");
    return (await res.json()) as RouteSearchResult[];
  }
}

// Fallback local solo con 2 rutas reales verificadas, sin inventar
const REAL_WIKILOC: Record<string, RouteSearchResult> = {
  "logroño-nájera": {
    title: "Logroño a Najera (Camino de Santiago)",
    url: "https://es.wikiloc.com/rutas-senderismo/logrono-a-najera-camino-de-santiago-8372722",
    embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=8372722&elevation=off&images=off&maptype=H",
    routeId: "8372722",
    distance: 28.6,
  },
  "nájera-santo domingo de la calzada": {
    title: "Nájera - Santo Domingo de la Calzada - Camino de Santiago",
    url: "https://www.wikiloc.com/hiking-trails/najera-santo-domingo-de-la-calzada-camino-de-santiago-131645009",
    embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=131645009&elevation=off&images=off&maptype=H",
    routeId: "131645009",
    distance: 21.1,
  },
};

export function getRealWikiloc(origin: string, dest: string): RouteSearchResult | null {
  const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const key = `${n(origin)}-${n(dest)}`;
  return REAL_WIKILOC[key] || REAL_WIKILOC[`${n(dest)}-${n(origin)}`] || null;
}
