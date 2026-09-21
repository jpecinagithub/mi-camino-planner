import type { VercelRequest, VercelResponse } from "@vercel/node";

// Búsqueda Wikiloc vía serverless usando la ÚNICA AI_API_KEY (no SEARCH_API_KEY separada)
const REAL_WIKILOC: Record<string, { url: string; embedUrl: string; routeId: string; title: string }> = {
  "logroño-nájera": {
    title: "Logroño a Najera (Camino de Santiago)",
    url: "https://es.wikiloc.com/rutas-senderismo/logrono-a-najera-camino-de-santiago-8372722",
    embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=8372722&elevation=off&images=off&maptype=H",
    routeId: "8372722",
  },
  "nájera-santo domingo de la calzada": {
    title: "Nájera - Santo Domingo de la Calzada",
    url: "https://www.wikiloc.com/hiking-trails/najera-santo-domingo-de-la-calzada-camino-de-santiago-131645009",
    embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=131645009&elevation=off&images=off&maptype=H",
    routeId: "131645009",
  },
};

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

async function searchWithAI(origin: string, dest: string, transport: string): Promise<any[] | null> {
  const key = process.env.AI_API_KEY;
  const base = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!key || !base || !model) return null;
  const prompt = `Busca una ruta de Wikiloc real y verificable para "${origin} → ${dest}" Camino de Santiago, modo ${transport}. Si existe, devuelve JSON: {"url":"https://es.wikiloc.com/...","embedUrl":"https://es.wikiloc.com/wikiloc/embedv2.do?id=...","routeId":"...","title":"..."}. Si no estás seguro, devuelve {}. No inventes.`;
  const url = base.includes("/chat/completions") ? base : `${base.replace(/\/$/, "")}/v1/chat/completions`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as any;
    const content = j.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (parsed.url && parsed.url.startsWith("https://")) return [parsed];
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { origin, destination, transportMode } = req.body || {};
  if (!origin || !destination) return res.status(400).json({ error: "Origen y destino requeridos" });

  const key = `${normalize(origin)}-${normalize(destination)}`;
  const real = REAL_WIKILOC[key] || REAL_WIKILOC[`${normalize(destination)}-${normalize(origin)}`];
  if (real) {
    // Intenta enriquecer con AI si hay clave, pero si no, devuelve el real verificado
    const aiResult = await searchWithAI(origin, destination, transportMode || "walking");
    if (aiResult) return res.status(200).json(aiResult);
    return res.status(200).json([{ ...real, distance: undefined }]);
  }

  // Intento con AI para tramos no curados
  const aiResult = await searchWithAI(origin, destination, transportMode || "walking");
  if (aiResult) return res.status(200).json(aiResult);

  // Fallback honesto: solo URL sin embed (no inventamos)
  const slug = `${origin}-${destination}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return res.status(200).json([
    {
      title: `${origin} → ${destination} (${transportMode || "walking"})`,
      url: `https://es.wikiloc.com/rutas-senderismo/${slug}`,
    },
  ]);
}
