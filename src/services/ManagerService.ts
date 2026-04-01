import type { ApiDeposit, GarbagePoint } from "../types/ManagerMap";
import { toPoint } from "../Manager_Section/Manager_Map";

export function authHeaders(): HeadersInit {
  return {
    "Accept":                      "application/json",
    "Authorization":               `Bearer ${localStorage.getItem("token") || ""}`,
    "ngrok-skip-browser-warning":  "69420",
    "X-CSRFTOKEN":                 "yKwR20NnZY6dVjuL1eqmWjx2Ao3Q0bJsh7Ev2UlVZMoywOKTUmphBZ2f1URLCKZZ",
  };
}

export async function collectDeposit(id: number): Promise<void> {
  const res = await fetch(`/api/v0/deposits/${id}/collect/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (res.status === 400) throw new Error("Dépôt déjà collecté");
  if (res.status === 404) throw new Error("Dépôt introuvable");
  if (!res.ok)            throw new Error(`Error ${res.status}: ${res.statusText}`);
}

export async function fetchDepositDetail(id: number): Promise<GarbagePoint> {
  const res = await fetch(`/api/v0/deposits/${id}/`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const d: ApiDeposit = await res.json();
  return toPoint(d);
}

export async function fetchUncollected(): Promise<GarbagePoint[]> {
  const res = await fetch(`/api/v0/deposits/?collected=false`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

  const data: ApiDeposit[] = await res.json();
  return data
    .filter(d => !d.collected)
    .filter(d => d.latitude != null && d.longitude != null)
    .filter(d => !isNaN(parseFloat(d.latitude)) && !isNaN(parseFloat(d.longitude)))
    .map(toPoint);
}