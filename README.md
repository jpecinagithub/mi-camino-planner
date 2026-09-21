# Mi Camino Planner

**Tu Camino de Santiago, etapa a etapa.**

Planificador inteligente del Camino de Santiago. En 30 segundos genera un plan completo adaptado a ruta, origen, destino, modo (a pie / MTB / carretera) y días disponibles. Visual, mobile-first y sin cuentas. **Siempre usa la IA** con una única `AI_API_KEY` — no hay planes mock predefinidos.

---

## Tecnologías

- Vite + React + TypeScript (strict)
- Tailwind CSS
- Lucide React
- jsPDF
- Vercel (hosting + serverless)

---

## Arquitectura

```
Browser → Vercel CDN → React → POST /api/plan → Vercel Function (AI_API_KEY) → IA → JSON → React
```

- Sin auth / sin BD. Persistencia `localStorage`.
- Flujo seguro: React nunca llama a la IA directo.
- Una única clave `AI_API_KEY` para todo (plan + Wikiloc via `api/routes.ts`).
- `ApiCaminoPlannerService` siempre usa `fetch("/api/plan")`.

```
src/
  components/ | pages/ | hooks/ | services/planner.ts (solo IA) | types/ | utils/
api/
  plan.ts    # POST /api/plan (valida, prompt geográfico, llama IA, valida, sin mock)
  routes.ts  # POST /api/routes (misma AI_API_KEY, 2 Wikiloc reales verificados)
```

---

## Instalación

```bash
git clone <repo>
cd "CAMINO SANTIAGO"
npm install
copy .env.example .env
# añade AI_API_KEY, AI_BASE_URL, AI_MODEL
npm run dev
```

Abre http://localhost:5173

---

## Variables de entorno

Nunca `VITE_` para secretos.

| Variable | Dónde |
|----------|-------|
| `AI_API_KEY` | `.env` + Vercel Env Vars |
| `AI_BASE_URL` | `.env` + Vercel |
| `AI_MODEL` | `.env` + Vercel |

```
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=
```

Vercel → Project Settings → Environment Variables. Serverless lee `process.env.AI_API_KEY`.

---

## Desarrollo local

```bash
npm run dev
npm run build
```

- `npm run dev` hace `POST /api/plan`. Sin `vercel dev`, `/api/plan` da 404 → verás error "No hemos podido preparar tu Camino". Para probar IA en local, usa `vercel dev` (Vercel CLI) o haz deploy preview.
- `npm run build` verifica TS strict.

---

## Deploy Vercel

1. GitHub → Vercel Import → Vite
2. Env Vars: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`
3. Deploy. `api/plan.ts` y `api/routes.ts` son Serverless Functions.

---

## Cálculo IA

- Mapa km Francés (`api/plan.ts:48`): SJPP 0, Logroño 150, Burgos 270, León 460, Sarria 650, Santiago 770 → `totalDistance = |kmDest-kmOrig|`.
- Prompt obliga: `totalDistance ≈620km` para Logroño→Santiago, divide entre `days` aunque media quede fuera de rango (20-30 a pie, 40-70 MTB, 60-100 carretera), marca `hard` si es exigente, suma exacta, `wikiloc` solo si real (8372722, 131645009) si no `null`.

---

## Servicio IA

- `ApiCaminoPlannerService` → `POST /api/plan`.
- `api/plan.ts`: valida, prompt geográfico, `response_format: json_object`, 1 reintento, valida suma, nunca expone key. Si falta `AI_API_KEY` devuelve 500 con mensaje humano, no mock.

---

## Seguridad

- Una única `AI_API_KEY` en `.env` y Vercel. Nunca cliente.

---

## Licencia

Demo.
