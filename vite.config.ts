import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const AI_API_KEY = env.AI_API_KEY || process.env.AI_API_KEY;
  const AI_BASE_URL = env.AI_BASE_URL || process.env.AI_BASE_URL;
  const AI_MODEL = env.AI_MODEL || process.env.AI_MODEL;

  const FRANCES_ORDER = ["saint-jean-pied-de-port","roncesvalles","zubiri","pamplona","puente la reina","estella","los arcos","logroño","najera","santo domingo de la calzada","belorado","burgos","castrojeriz","fromista","carrion de los condes","sahagun","leon","astorga","ponferrada","o cebreiro","sarria","portomarin","palas de rei","arzua","santiago de compostela","santiago"];
  function normalize(s: string){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim(); }
  function getOrderIdx(town: string){
    const n=normalize(town);
    for(let i=0;i<FRANCES_ORDER.length;i++) if(n===FRANCES_ORDER[i] || n.includes(FRANCES_ORDER[i]) || FRANCES_ORDER[i].includes(n)) return i;
    return -1;
  }

  return {
    plugins: [
      react(),
      {
        name: "api-dev",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url || !req.url.startsWith("/api/")) return next();
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Método no permitido" }));
              return;
            }
            let body = "";
            req.on("data", (chunk) => (body += chunk));
            req.on("end", async () => {
              try {
                const json = body ? JSON.parse(body) : {};
                if (req.url?.startsWith("/api/plan")) {
                  const { camino, origin, destination, transportMode, days } = json;
                  if (!camino || !origin || !destination || !transportMode || !days) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Parámetros inválidos" }));
                    return;
                  }
                  if (!AI_API_KEY || !AI_BASE_URL || !AI_MODEL) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "IA no configurada. Revisa AI_API_KEY en .env" }));
                    return;
                  }
                  const prompt = `Eres un planificador experto del Camino de Santiago. No tienes datos predefinidos: debes calcular todo tú.
TAREA: Generar un plan de etapas ENTRE "${origin}" Y "${destination}" por el "${camino}" para EXACTAMENTE ${days} días, modo "${transportMode}".
REGLAS GEOGRÁFICAS ESTRICTAS: El Francés va de ESTE a OESTE: SJPP→Roncesvalles→Pamplona→Estella→Logroño→Nájera (30km desde Logroño)→Santo Domingo (22km desde Nájera)→Belorado→Burgos→León→Sarria→Santiago. NUNCA al revés. Logroño→Estella es INVÁLIDO. Logroño→Jaca es INVÁLIDO (Jaca es Aragonés). Para road-bike usa VARIANTES 100% ASFALTADAS que sigan corredor OESTE, no pistas. Para cada etapa ELIGE PRIMERO un track concreto compatible con transporte y usa datos REALES de ese track. Wikiloc solo si real verificable.
Instrucciones: 1. Identifica recorrido OESTE real entre origen y destino y estima distancia. 2. Divide entre ${days} días equilibrado (suma exacta). 3. Adapta a transporte: walking 20-30km, mtb 40-70km, road-bike 60-100km asfaltado. Dificultad coherente (Santo Domingo→Burgos 70km con Montes de Oca NO es easy; Melide→Santiago no es easy). Duración walking 4.2, mtb 12, carretera 17.5 +1h/600m. Prefiere finales con servicios.
Devuelve EXCLUSIVAMENTE JSON: {"id":"string","camino":"${camino}","origin":"${origin}","destination":"${destination}","transportMode":"${transportMode}","days":${days},"totalDistance":number,"totalElevationGain":number,"stages":[{"day":number,"origin":"string","destination":"string","distance":number,"elevationGain":number,"elevationLoss":number,"estimatedDuration":"string","difficulty":"easy|moderate|hard","description":"1-2 frases","wikiloc":{"title":"string","url":"https://es.wikiloc.com/...","embedUrl":"https://es.wikiloc.com/wikiloc/embedv2.do?id=...","routeId":"string"}|null}]}
Reglas: stages.length===${days}, encadenados, primer origin="${origin}", último destination="${destination}", totalDistance=suma. Nunca inventes.`;

                  const base = AI_BASE_URL.replace(/\/$/, "");
                  const url = base.includes("/chat/completions") ? base : base.endsWith("/v1") ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
                  let aiRes = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_API_KEY}` },
                    body: JSON.stringify({
                      model: AI_MODEL,
                      messages: [
                        { role: "system", content: "Eres un asistente que devuelve solo JSON válido. Nunca uses markdown. Nunca inventes. Conoces geografía oeste del Camino Francés." },
                        { role: "user", content: prompt },
                      ],
                      temperature: 0.45,
                      response_format: { type: "json_object" },
                    }),
                  });
                  if (!aiRes.ok) {
                    const t = await aiRes.text().catch(() => "");
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: `IA error ${aiRes.status}: ${t.slice(0, 300)}` }));
                    return;
                  }
                  let j = (await aiRes.json()) as any;
                  let content = j.choices?.[0]?.message?.content;
                  let parsed: any;
                  try { parsed = JSON.parse(content); } catch { const m = content.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("JSON IA inválido"); }
                  // Validación dirección oeste para Francés
                  if (camino.toLowerCase().includes("frances")) {
                    let valid = true;
                    for (const s of parsed.stages || []) {
                      if (normalize(s.origin).includes("jaca") || normalize(s.destination).includes("jaca")) valid = false;
                      const oIdx = getOrderIdx(s.origin), dIdx = getOrderIdx(s.destination);
                      if (oIdx !== -1 && dIdx !== -1 && dIdx <= oIdx) valid = false;
                      if (normalize(s.origin).includes("logroño") && normalize(s.destination).includes("najera") && Math.abs(s.distance - 30) > 8) valid = false;
                      if (normalize(s.origin).includes("najera") && normalize(s.destination).includes("santo domingo") && Math.abs(s.distance - 22) > 8) valid = false;
                    }
                    if (!valid) {
                      const retryPrompt = prompt + "\n\nTu respuesta anterior violó geografía (ej Logroño→Nájera debe ser ~30km no 62km, no retrocedas a Estella/Jaca, avanza al oeste). Responde de nuevo con SOLO JSON válido.";
                      aiRes = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_API_KEY}` },
                        body: JSON.stringify({
                          model: AI_MODEL,
                          messages: [
                            { role: "system", content: "Eres un asistente que devuelve solo JSON válido." },
                            { role: "user", content: retryPrompt },
                          ],
                          temperature: 0.45,
                          response_format: { type: "json_object" },
                        }),
                      });
                      if (!aiRes.ok) throw new Error("retry failed");
                      j = (await aiRes.json()) as any;
                      content = j.choices?.[0]?.message?.content;
                      parsed = JSON.parse(content);
                    }
                  }
                  parsed.id = parsed.id || `plan-${Date.now()}`;
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify(parsed));
                  return;
                }
                if (req.url?.startsWith("/api/routes")) {
                  const { origin, destination } = json;
                  const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                  const key = `${n(origin || "")}-${n(destination || "")}`;
                  if (key === "logroño-nájera" || key === "logrono-najera") {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify([{ title: "Logroño a Najera", url: "https://es.wikiloc.com/rutas-senderismo/logrono-a-najera-camino-de-santiago-8372722", embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=8372722&elevation=off&images=off&maptype=H", routeId: "8372722" }]));
                    return;
                  }
                  if (key.includes("najera") && key.includes("santo domingo")) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify([{ title: "Nájera - Santo Domingo", url: "https://www.wikiloc.com/hiking-trails/najera-santo-domingo-de-la-calzada-camino-de-santiago-131645009", embedUrl: "https://es.wikiloc.com/wikiloc/embedv2.do?id=131645009&elevation=off&images=off&maptype=H", routeId: "131645009" }]));
                    return;
                  }
                  const slug = `${origin}-${destination}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify([{ title: `${origin} → ${destination}`, url: `https://es.wikiloc.com/rutas-senderismo/${slug}` }]));
                  return;
                }
                next();
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: e.message || "Error interno" }));
              }
            });
          });
        },
      },
    ],
    server: { port: 5173 },
  };
});
