export type TransportMode = "walking" | "mtb" | "road-bike";
export type Difficulty = "easy" | "moderate" | "hard";

export interface PlannerInput {
  camino: string;
  origin: string;
  destination: string;
  transportMode: TransportMode;
  days: number;
}

export interface CaminoStage {
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

export interface CaminoPlan {
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

export interface RouteSearchParams {
  origin: string;
  destination: string;
  transportMode: TransportMode;
}

export interface RouteSearchResult {
  title: string;
  url: string;
  embedUrl?: string;
  routeId?: string;
  distance?: number;
  elevationGain?: number;
}

export interface RouteSearchService {
  searchRoute(params: RouteSearchParams): Promise<RouteSearchResult[]>;
}

export interface CaminoPlannerService {
  generatePlan(input: PlannerInput): Promise<CaminoPlan>;
}

export type AppState = "initial" | "loading" | "success" | "error" | "regenerating";

export const CAMINOS = ["Camino Francés"] as const;

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  walking: "A pie",
  mtb: "Bicicleta MTB",
  "road-bike": "Bicicleta de carretera",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  moderate: "Moderada",
  hard: "Exigente",
};
