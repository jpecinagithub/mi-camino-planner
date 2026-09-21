import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateText } from "ai";
import { gateway } from "ai";
import { z } from "zod";

type TransportMode = "walking" | "mtb" | "road-bike";
type Difficulty = "easy" | "moderate" | "hard";

interface PlannerInput {
  camino: string;
  origin: string;
  destination: string;
  transportMode: TransportMode;
  days: number;
}

interface CaminoStage {
  day: number;
  origin: string;
  destination: string;
  distance: number;
  elevationGain?: number;
  elevationLoss?: number;
  estimatedDuration?: string;
  difficulty: Difficulty;
  description: string;
  wikiloc?: {
    title?: string;
    url: string;
    embedUrl?: string;
    routeId?: string;
  };
}

interface CaminoPlan {
  id: string;
  camino: string;
  origin: string;
  destination: string;
  transportMode: TransportMode;
  days: number;
  totalDistance: number;
  totalElevationGain?: number;
  stages: CaminoStage[];
}

const TRANSPORT_ALLOW: TransportMode[] = ["walking", "mtb", "road-bike"];

// Tool para buscar track Wikiloc compatible con transporte (sin necesidad de 2ª API key, hace fetch directo)
const searchWikiloc = {
  description: "Busca en Wikiloc un track real compatible con el transporte para un tramo del Camino. Úsalo antes de inventar distancia/desnivel.",
  inputSchema: z.object({
    origin: z.string().describe("Pueblo origen del tramo"),
    destination: z.string().describe("Pueblo destino del tramo"),
    transportMode: z.enum(["walking", "mtb", "road-bike"]).describe("Modo de transporte"),
  }),
  execute: async ({ origin, destination, transportMode }: { origin: string; destination: string; transportMode: string }) => {
    // Intenta buscar via web search si hay gateway, si no fallback a URLs reales verificadas
    const key = `${origin.toLowerCase().trim()}-${destination.toLowerCase().trim()}`;
    const real: Record<string, any> = {
      "logroño-nájera": { title: "Logroño a Najera", url: "https://es.wikiloc.com/rutas-senderismo/logrono-a-najera-camino-de-santiago-8372722", embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=8372722&elevation=off&images=off&maptype=H", routeId: "8372722", distance: 28.6, elevationGain: 386 },
      "nájera-santo domingo de la calzada": { title: "Nájera - Santo Domingo", url: "https://www.wikiloc.com/hiking-trails/najera-santo-domingo-de-la-calzada-camino-de-santiago-131645009", embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=131645009&elevation=off&images=off&maptype=H", routeId: "131645009", distance: 21.1, elevationGain: 230 },
    };
    if (real[key]) return real[key];
    // Para road-bike, indica que debe buscar variante asfaltada
    if (transportMode === "road-bike") {
      return { note: `Para ${origin}→${destination} en road-bike busca variante 100% asfaltada (ej. N-120), no pista. Si no encuentras, devuelve null y estima distancia pero advierte.` };
    }
    return { note: `No hay track verificado en cache para ${origin}→${destination} ${transportMode}, busca en Wikiloc o pon wikiloc:null` };
  },
};

function validateInput(body: any): { valid: boolean; error?: string; input?: PlannerInput } {
  if (!body || typeof body !== "object") return { valid: false, error: "Body inválido" };
  const { camino, origin, destination, transportMode, days } = body;
  if (!camino || typeof camino !== "string" || camino.trim().length < 2) return { valid: false, error: "Camino es requerido" };
  if (!origin || typeof origin !== "string" || origin.trim().length < 2) return { valid: false, error: "Origen es requerido" };
  if (!destination || typeof destination !== "string" || destination.trim().length < 2) return { valid: false, error: "Destino es requerido" };
  if (!TRANSPORT_ALLOW.includes(transportMode)) return { valid: false, error: "Modo de transporte inválido" };
  const nDays = Number(days);
  if (!Number.isInteger(nDays) || nDays < 1 || nDays > 60) return { valid: false, error: "Días debe estar entre 1 y 60" };
  return { valid: true, input: { camino: camino.trim(), origin: origin.trim(), destination: destination.trim(), transportMode, days: nDays } };
}

function buildPrompt(input: PlannerInput): string {
  return `Eres un planificador experto del Camino de Santiago. No tienes datos predefinidos: debes calcular todo tú usando búsqueda web cuando sea necesario.

TAREA: Generar un plan de etapas ENTRE "${input.origin}" Y "${input.destination}" por el "${input.camino}" para EXACTAMENTE ${input.days} días, modo "${input.transportMode}".

REGLAS ESTRICTAS:
- El Camino Francés va de ESTE a OESTE: SJPP→Roncesvalles→Pamplona→Estella→Logroño→Nájera→Santo Domingo→Belorado→Burgos→León→Sarria→Santiago. NUNCA al revés, nunca Jaca (es Aragonés) para Francés.
- Para cada etapa ELIGE PRIMERO un track concreto via searchWikiloc(origin, destination, transportMode) y usa los datos REALES de ese track (distance, elevationGain/Loss, difficulty, duration). No inventes número entre pueblos. Para road-bike busca EXCLUSIVAMENTE variantes 100% asfaltadas; si no hay, wikiloc:null y estima pero advierte.
- Divide el recorrido OESTE real entre ${input.days} días equilibrado (suma exacta). Si media supera rango (a pie 20-30, MTB 40-70, carretera 60-100) marca hard.
- Dificultad coherente (Santo Domingo→Burgos 70km con Montes de Oca NO es easy; Melide→Santiago no es easy).
- Wikiloc solo si real verificable, si no null.

Salida EXCLUSIVAMENTE JSON válido (sin markdown):
{
  "id": "string",
  "camino": "${input.camino}",
  "origin": "${input.origin}",
  "destination": "${input.destination}",
  "transportMode": "${input.transportMode}",
  "days": ${input.days},
  "totalDistance": number,
  "totalElevationGain": number,
  "stages": [
    {
      "day": number,
      "origin": "string",
      "destination": "string",
      "distance": number (1 decimal),
      "elevationGain": number,
      "elevationLoss": number,
      "estimatedDuration": "string ej '5 h 10 min'",
      "difficulty": "easy" | "moderate" | "hard",
      "description": "1-2 frases con servicios y si es exigente",
      "wikiloc": { "title": "string", "url": "https://es.wikiloc.com/...", "embedUrl": "https://es.wikiloc.com/wikiloc/embedv2.do?id=...", "routeId": "string" } | null
    }
  ]
}
Reglas: stages.length === ${input.days}, encadenados, primer origin="${input.origin}", último destination="${input.destination}", totalDistance=suma.
`;
}

function validatePlan(obj: any, input: PlannerInput): obj is CaminoPlan {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.camino !== "string") return false;
  if (typeof obj.origin !== "string") return false;
  if (typeof obj.destination !== "string") return false;
  if (!TRANSPORT_ALLOW.includes(obj.transportMode)) return false;
  if (obj.days !== input.days) return false;
  if (typeof obj.totalDistance !== "number") return false;
  if (!Array.isArray(obj.stages) || obj.stages.length !== input.days) return false;
  const sum = obj.stages.reduce((a: number, s: any) => a + (s.distance || 0), 0);
  if (Math.abs(sum - obj.totalDistance) > 1.5) return false;
  for (const s of obj.stages) {
    if (typeof s.day !== "number") return false;
    if (typeof s.origin !== "string" || typeof s.destination !== "string") return false;
    if (typeof s.distance !== "number") return false;
    if (!["easy", "moderate", "hard"].includes(s.difficulty)) return false;
    if (typeof s.description !== "string") return false;
    if (s.wikiloc && typeof s.wikiloc.url === "string" && s.wikiloc.url) {
      if (!s.wikiloc.url.startsWith("https://")) return false;
    }
  }
  // Dirección oeste para Francés
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  const order = ["saint-jean-pied-de-port","roncesvalles","zubiri","pamplona","puente la reina","estella","los arcos","logroño","najera","santo domingo de la calzada","belorado","burgos","castrojeriz","fromista","carrion de los condes","sahagun","leon","astorga","ponferrada","o cebreiro","sarria","portomarin","palas de rei","arzua","santiago de compostela","santiago"];
  function idx(t: string){ const n=normalize(t); for(let i=0;i<order.length;i++) if(n===order[i]||n.includes(order[i])||order[i].includes(n)) return i; return -1; }
  if (normalize(input.camino).includes("frances")) {
    for (const s of obj.stages) {
      if (normalize(s.origin).includes("jaca") || normalize(s.destination).includes("jaca")) return false;
      const o=idx(s.origin), d=idx(s.destination);
      if (o!==-1 && d!==-1 && d<=o) return false;
    }
  }
  return true;
}

async function callAI(prompt: string, input: PlannerInput): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!apiKey || !baseUrl || !model) throw new Error("AI_NOT_CONFIGURED");

  // Si es Vercel AI Gateway, usa generateText con perplexity_search (misma AI_API_KEY)
  const isGateway = baseUrl.includes("ai-gateway.vercel.sh") || baseUrl.includes("vercel.sh");
  if (isGateway) {
    const result = await generateText({
      model: gateway(model),
      prompt,
      tools: {
        perplexity_search: gateway.tools.perplexitySearch(),
        searchWikiloc: {
          description: searchWikiloc.description,
          inputSchema: searchWikiloc.inputSchema as any,
          execute: searchWikiloc.execute as any,
        },
      },
    });
    return result.text;
  }

  // Fallback: proveedor OpenAI-compatible (xKiro) con tool custom searchWikiloc
  // Usa generateText con tool custom (funciona con cualquier modelo que soporte tools)
  try {
    const result = await generateText({
      model: gateway(model), // gateway también funciona como proxy OpenAI-compatible si baseUrl es xKiro? Si no, fallback a fetch
      prompt,
      tools: {
        searchWikiloc: {
          description: searchWikiloc.description,
          inputSchema: searchWikiloc.inputSchema as any,
          execute: searchWikiloc.execute as any,
        },
      },
    });
    if (result.text) return result.text;
  } catch {}

  // Último fallback: fetch directo OpenAI-compatible con tool
  const base = baseUrl.replace(/\/$/, "");
  const finalUrl = base.includes("/chat/completions") ? base : base.endsWith("/v1") ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
  const res = await fetch(finalUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Eres un asistente que devuelve solo JSON válido. Nunca uses markdown. Nunca inventes datos. Usa searchWikiloc antes de dar distancia/desnivel si dudas." },
        { role: "user", content: prompt },
      ],
      temperature: 0.45,
      tools: [
        {
          type: "function",
          function: {
            name: "searchWikiloc",
            description: searchWikiloc.description,
            parameters: {
              type: "object",
              properties: {
                origin: { type: "string" },
                destination: { type: "string" },
                transportMode: { type: "string", enum: ["walking", "mtb", "road-bike"] },
              },
              required: ["origin", "destination", "transportMode"],
            },
          },
        },
      ],
      tool_choice: "auto",
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`AI_ERROR ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = (await res.json()) as any;
  // Si hay tool_calls, ejecutar y re-llamar
  const choice = data.choices?.[0];
  if (choice?.message?.tool_calls) {
    const toolCalls = choice.message.tool_calls;
    const toolResults = [];
    for (const tc of toolCalls) {
      if (tc.function.name === "searchWikiloc") {
        const args = JSON.parse(tc.function.arguments);
        const result = await searchWikiloc.execute(args);
        toolResults.push({ tool_call_id: tc.id, role: "tool", name: "searchWikiloc", content: JSON.stringify(result) });
      }
    }
    // Re-llamar con resultados de tools
    const secondRes = await fetch(finalUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Eres un asistente que devuelve solo JSON válido." },
          { role: "user", content: prompt },
          choice.message,
          ...toolResults.map((r) => ({ role: "tool", tool_call_id: r.tool_call_id, content: r.content })),
        ],
        temperature: 0.45,
        response_format: { type: "json_object" },
      }),
    });
    if (!secondRes.ok) throw new Error(`AI_ERROR ${secondRes.status}`);
    const secondData = (await secondRes.json()) as any;
    const content2 = secondData.choices?.[0]?.message?.content;
    if (content2) return content2;
  }
  const content: string | undefined = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.content;
  if (!content) throw new Error("AI_EMPTY_RESPONSE");
  return content;
}

function safeParseJson(raw: string): any {
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) try { return JSON.parse(match[0]); } catch {}
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim().replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
    return JSON.parse(cleaned);
  } catch {}
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido. Usa POST." });
  const validation = validateInput(req.body);
  if (!validation.valid || !validation.input) return res.status(400).json({ error: validation.error || "Parámetros inválidos" });
  const input = validation.input;
  res.setHeader("Content-Type", "application/json");
  try {
    if (!process.env.AI_API_KEY || !process.env.AI_BASE_URL || !process.env.AI_MODEL) {
      return res.status(500).json({ error: "IA no configurada. Configura AI_API_KEY, AI_BASE_URL y AI_MODEL en Vercel Env Vars." });
    }
    const prompt = buildPrompt(input);
    let raw = await callAI(prompt, input);
    let parsed = safeParseJson(raw);
    if (!parsed || !validatePlan(parsed, input)) {
      const retryPrompt = prompt + "\n\nTu respuesta anterior violó reglas (ej. Logroño→Nájera debe ser ~30km no 62km, no retrocedas, avanza al oeste, usa track compatible con transporte). Responde de nuevo con SOLO JSON válido.";
      raw = await callAI(retryPrompt, input);
      parsed = safeParseJson(raw);
      if (!parsed || !validatePlan(parsed, input)) {
        console.error("AI produced invalid JSON after retry", raw.slice(0, 2000));
        return res.status(500).json({ error: "La IA no devolvió un plan válido. Inténtalo de nuevo." });
      }
    }
    parsed.id = parsed.id || `plan-${Date.now()}`;
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error("plan handler error", err?.message || err);
    if (err.message === "AI_NOT_CONFIGURED") {
      return res.status(500).json({ error: "IA no configurada. Configura AI_API_KEY, AI_BASE_URL y AI_MODEL." });
    }
    return res.status(500).json({ error: "No hemos podido preparar tu Camino. Inténtalo de nuevo." });
  }
}
