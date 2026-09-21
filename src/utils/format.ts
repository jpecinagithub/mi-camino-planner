export function formatDistance(km: number): string {
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export function formatElevation(m: number): string {
  return `+${m.toLocaleString("es-ES")} m`;
}
