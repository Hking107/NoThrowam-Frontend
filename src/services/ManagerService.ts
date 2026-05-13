import { authService } from "./authService";
import type { ApiDeposit, GarbagePoint } from "../types/ManagerMap";
import { toPoint } from "../Manager_Section/utils";

import { API_BASE_URL as API_BASE } from "../config/api";

function getCsrfToken() {
  const match = document.cookie.match(/(^|;)\s*csrftoken=([^;]+)/);
  return match ? match[2] : "";
}

export function authHeaders(): HeadersInit {
  return {
    "Accept": "application/json",
    "Authorization": `Bearer ${authService.getAccessToken() || ""}`,
    "ngrok-skip-browser-warning": "69420",
    "X-CSRFTOKEN": getCsrfToken() || "yKwR20NnZY6dVjuL1eqmWjx2Ao3Q0bJsh7Ev2UlVZMoywOKTUmphBZ2f1URLCKZZ",
  };
}

export async function collectDeposit(id: number): Promise<void> {
  const makeRequest = async () => {
    return fetch(`${API_BASE}/api/v0/deposits/${id}/collect/`, {
    method: "POST",
    headers: authHeaders(),
  });
  } 

    let res = await makeRequest();
  if (res.status === 401){
    try {
      await authService.refresh();

      res = await makeRequest();
    }catch(err){
       console.error("Refresh token failed", err);

      authService.logout?.();

      throw new Error("Session expired. Please login again.");
    }
  }
  if (res.status === 400) throw new Error("Dépôt déjà collecté");
  if (res.status === 404) throw new Error("Dépôt introuvable");
 
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  
}

export async function fetchDepositDetail( id: number): Promise<GarbagePoint> {

  const makeRequest = async () => {
    return fetch(`${API_BASE}/api/v0/deposits/${id}/`, {
      method: "GET",
      headers: authHeaders(),
    });
  };

  let res = await makeRequest();

  if (res.status === 401) {
    try {
      await authService.refresh();

      res = await makeRequest();
    } catch (err) {
      console.error("Refresh token failed", err);

      authService.logout?.();

      throw new Error("Session expired. Please login again.");
    }
  }

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }


  const d: ApiDeposit = await res.json();

  return toPoint(d);
}

export async function fetchUncollected(): Promise<GarbagePoint[]> {
  const  makeRequest  = async() => {
    return fetch(`${API_BASE}/api/v0/deposits/?collected=false`, {
    method: "GET",
    headers: authHeaders(),
  });
  } 
  
  let res = await makeRequest();
  if (res.status === 401){
      try {
        await authService.refresh();

        res = await makeRequest();
      }catch{
        console.error("Refresh token failed", err);

      authService.logout?.();

      throw new Error("Session expired. Please login again.");
      }
  }
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const data: ApiDeposit[] = await res.json();
  return data
    .filter(d => !d.collected)
    .filter(d => d.latitude != null && d.longitude != null)
    .filter(d => !isNaN(parseFloat(d.latitude)) && !isNaN(parseFloat(d.longitude)))
    .map(toPoint);
}

export async function fetchAllDeposits(): Promise<GarbagePoint[]> {
  const res = await fetch(`${API_BASE}/api/v0/deposits/`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  if (res.ok){
    console.error("========================================================== Token Valid =====================");
  };
  if (res.status === 401) authService.refresh();


  const data: ApiDeposit[] = await res.json();
  console.log(`API returned ${data.length} deposits:`, data.map(d => ({
    id: d.id,
    collected: d.collected,
    created_at: d.created_at,
    collected_at: d.collected_at
  })));

  const processed = data
    .filter(d => d.latitude != null && d.longitude != null)
    .filter(d => !isNaN(parseFloat(d.latitude)) && !isNaN(parseFloat(d.longitude)))
    .map(toPoint);

  console.log(`Processed ${processed.length} valid points`);
  return processed;
}