import { useEffect, useRef, useState, useCallback } from "react";
import { Loader, RefreshCw } from "lucide-react";
import {
  CustomerMapBus as MapEventBus,
  PurchaseBus,
} from "../services/eventBus";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import MarketPopup from "../components/Customer/MarketPopup";
import type { MarketPoint } from "../types/MarketPoint";
import type { WastePost } from "../types/WastePost";
import {
  CATEGORY_LABEL,
  CATEGORY_COLORS,
  CATEGORY_EMOJI,
} from "../hooks/constants/constants";
import { wasteService } from "../services/wasteService";
import { authService } from "../services/authService";

import PaymentPanel from "../components/Customer/PaymentPanel";
import { useWebSocket } from "../WebSocketProvider";

declare global {
  interface Window {
    L: any;
  }
}

function toMarketPoint(p: WastePost): MarketPoint {
  const cat = CATEGORY_LABEL[p.category] || "Autre";
  const imgs: { id: number; url: string }[] = [];
  if (p.image_url) imgs.push({ id: 1, url: p.image_url });
  else if (p.image) imgs.push({ id: 1, url: p.image });

  return {
    id: p.id,
    lat: parseFloat(p.latitude) || 0,
    lng: parseFloat(p.longitude) || 0,
    label: p.title?.trim() || `Post #${p.id}`,
    category: cat,
    description: p.description?.trim() || "",
    fixedPrice: p.price ?? 0,
    fixedWeight: parseFloat(p.quantity) || 0,
    weightUnit: p.unit?.trim() || "kg",
    currency: "FCFA",
    images: imgs,
  };
}

async function fetchWastePosts(): Promise<MarketPoint[]> {
  const data = await wasteService.getWastePosts();
  return data
    .filter((p) => p.status === "PUBLISHED" && p.latitude && p.longitude)
    .map(toMarketPoint)
    .filter((p) => p.lat !== 0 && p.lng !== 0);
}

const CustToast = ({ msg }: { msg: string }) => (
  <div
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-2000 px-5 py-2.5
                  bg-white/90 backdrop-blur-xl border border-brand-green/20 rounded-lg
                  shadow-2xl shadow-brand-green/10 text-brand-green font-bold text-sm
                  flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
  >
    <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
    {msg}
  </div>
);

const Ring = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <div
    className="fixed pointer-events-none z-[1800] rounded-full border-2"
    style={{
      left: x - 22,
      top: y - 22,
      width: 44,
      height: 44,
      borderColor: color,
      boxShadow: `0 0 0 3px ${color}44, 0 0 18px ${color}66`,
      animation: "ringOut 1.4s ease-out forwards",
    }}
  />
);

export const CustomerMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<any>(null);
  const markersRef = useRef<Record<number, any>>({});
  const pointsRef = useRef<MarketPoint[]>([]);

  const uiRefs = {
    stats: useRef<HTMLDivElement>(null),
    legend: useRef<HTMLDivElement>(null),
    loading: useRef<HTMLDivElement>(null),
  };

  const [points, setPoints] = useState<MarketPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchErr] = useState<string | null>(null);

  const [popup, setPopup] = useState<{
    point: MarketPoint;
    origin: { x: number; y: number };
  } | null>(null);
  const [payment, setPayment] = useState<MarketPoint | null>(null);
  const [leafReady, setLeaf] = useState(!!window.L);
  const [rings, setRings] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([]);
  const [toast, setToast] = useState<string | null>(null);

  pointsRef.current = points;

  useGSAP(() => {
    if (!loading && !fetchError) {
      gsap.fromTo(
        [uiRefs.stats.current, uiRefs.legend.current],
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.2,
        },
      );
    }
  }, [loading, fetchError]);

  const loadPoints = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const pts = await fetchWastePosts();
      setPoints(pts);
      const map = leafRef.current;
      if (map && window.L && pts.length > 0) {
        const bounds = window.L.latLngBounds(pts.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
    } catch (e: any) {
      setFetchErr(e?.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoints();
  }, [loadPoints]);



  useEffect(() => {
    if (window.L) {
      setLeaf(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = () => setLeaf(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!leafReady || !mapRef.current || leafRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [3.848, 11.502],
      zoom: 13,
      zoomControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      },
    ).addTo(map);
    leafRef.current = map;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple2{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.8);opacity:0}}
      @keyframes ringOut{0%{transform:scale(.4);opacity:1}70%{transform:scale(2.6);opacity:.5}100%{transform:scale(3.2);opacity:0}}
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      leafRef.current = null;
    };
  }, [leafReady]);

  useEffect(() => {
    const map = leafRef.current;
    if (!map || !window.L) return;
    const L = window.L;
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    points.forEach((pt) => {
      const color = CATEGORY_COLORS[pt.category] || "#94a3b8";
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;cursor:pointer">
            <div style="position:absolute;width:38px;height:38px;border-radius:50%;background:${color}22;animation:ripple2 2.4s ease-out infinite;"></div>
            <div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 3px 14px ${color}77,0 1px 4px rgba(0,0,0,.15);position:relative;z-index:2;"></div>
          </div>`,
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon }).addTo(map);
      marker.on("click", (e: any) => {
        e.originalEvent.stopPropagation();
        const cp = map.latLngToContainerPoint([pt.lat, pt.lng]);
        const rect = mapRef.current!.getBoundingClientRect();
        const current = pointsRef.current.find((p) => p.id === pt.id)!;
        setPopup({
          point: current,
          origin: { x: rect.left + cp.x, y: rect.top + cp.y },
        });
      });
      markersRef.current[pt.id] = marker;
    });
  }, [points, leafReady]);

  useEffect(() => {
    MapEventBus.registerStateProvider(() => ({
      points: pointsRef.current.map((p) => ({
        id: p.id,
        label: p.label,
        category: p.category,
        lat: p.lat,
        lng: p.lng,
        fixedPrice: p.fixedPrice,
        currency: p.currency,
        fixedWeight: p.fixedWeight,
      })),
      cart: [],
    }));
  }, []);

  const flashRing = useCallback((ptId: number, color: string) => {
    const map = leafRef.current;
    if (!map || !mapRef.current) return;
    const pt = pointsRef.current.find((p) => p.id === ptId);
    if (!pt) return;
    const cp = map.latLngToContainerPoint([pt.lat, pt.lng]);
    const rect = mapRef.current.getBoundingClientRect();
    const rid = Date.now().toString() + ptId;
    setRings((r) => [
      ...r,
      { id: rid, x: rect.left + cp.x, y: rect.top + cp.y, color },
    ]);
    setTimeout(() => setRings((r) => r.filter((x) => x.id !== rid)), 1500);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const { postsWs, proposalsWs } = useWebSocket();

  useEffect(() => {
    if (!postsWs) return;

    const handleNewPost = (data: any) => {
      console.log("[WS] Nouveau/Mise à jour post reçu:", data);
      loadPoints();

      const post = data.post || data;
      // Si c'est juste publié, on peut montrer un toast, sinon silencieux
      if (data.type === "post.created" || data.type === "post_created") {
        showToast("Nouveau lot de déchets disponible !");
      }
    };

    const handlePostList = (data: any) => {
      console.log("[WS] Liste initiale de posts reçue:", data);
      if (data.posts && Array.isArray(data.posts)) {
        const pts = data.posts
          .filter((p: any) => p.status === "PUBLISHED" && p.latitude && p.longitude)
          .map(toMarketPoint);
        setPoints(pts);
      }
    };

    const handleProposalUpdate = (data: any) => {
      console.log("[WS] Mise à jour proposition reçue:", data);

      const proposal = data.proposal || data;
      const status = proposal.status || data.status;
      const customerId = proposal.customer?.id || data.customer?.id || proposal.customer_id;

      // On récupère l'ID de l'utilisateur actuel depuis le token
      const token = authService.getAccessToken();
      let currentUserId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          currentUserId = payload.user_id || payload.id || payload.sub;
        } catch (e) { }
      }

      console.log(`[WS] Checking ID: current=${currentUserId}, target=${customerId}, status=${status}`);

      if (status === "ACCEPTED" && String(customerId) === String(currentUserId)) {
        const title = proposal.post_title || "votre lot";
        showToast(`Félicitations ! Votre offre pour "${title}" a été acceptée !`);
      }
    };

    postsWs.on("post.created", handleNewPost);
    postsWs.on("post_created", handleNewPost);
    postsWs.on("post.updated", handleNewPost);
    postsWs.on("post_updated", handleNewPost);
    postsWs.on("post_list", handlePostList);

    // Ecouter sur proposalsWs
    if (proposalsWs) {
      proposalsWs.on("proposal.updated", handleProposalUpdate);
      proposalsWs.on("proposal_updated", handleProposalUpdate);
    }

    return () => {
      postsWs.off("post.created", handleNewPost);
      postsWs.off("post_created", handleNewPost);
      postsWs.off("post.updated", handleNewPost);
      postsWs.off("post_updated", handleNewPost);
      postsWs.off("post_list", handlePostList);

      if (proposalsWs) {
        proposalsWs.off("proposal.updated", handleProposalUpdate);
        proposalsWs.off("proposal_updated", handleProposalUpdate);
      }
    };
  }, [postsWs, proposalsWs, loadPoints, showToast]);

  useEffect(() => {
    const unsub = MapEventBus.onCommand((cmd) => {
      const map = leafRef.current;
      switch (cmd.type) {
        case "highlight":
          flashRing(cmd.pointId, "#22c55e");
          break;
        case "highlight_all_available":
          pointsRef.current.forEach((p, i) => {
            setTimeout(
              () => flashRing(p.id, CATEGORY_COLORS[p.category] || "#22c55e"),
              i * 180,
            );
          });
          showToast("🛒 Tous les lots disponibles mis en évidence");
          break;
        case "fly_to":
          if (map)
            map.flyTo([cmd.lat, cmd.lng], 16, { animate: true, duration: 1.3 });
          break;
        case "open_purchase": {
          const pt = pointsRef.current.find((p) => p.id === cmd.pointId);
          if (pt) {
            setPopup(null);
            setPayment(pt);
          }
          break;
        }
        case "clear_highlights":
          setRings([]);
          break;
        case "show_cart":
          showToast("🛒 Panier mis à jour");
          break;
      }
    });
    return unsub;
  }, [flashRing, showToast]);

  const handleBuy = () => {
    if (!popup) return;
    PurchaseBus.setState({
      phase: "selecting",
      pointId: popup.point.id,
      qty: 1,
    });
    setPayment(popup.point);
    setPopup(null);
  };

  const totalWeight = points.reduce((s, p) => s + p.fixedWeight, 0);

  return (
    <div
      className="relative w-full h-full bg-slate-50"
      onClick={() => setPopup(null)}
    >
      <div ref={mapRef} className="w-full h-full" />

      {rings.map((r) => (
        <Ring key={r.id} x={r.x} y={r.y} color={r.color} />
      ))}
      {toast && <CustToast msg={toast} />}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-1500 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <Loader size={32} className="text-brand-green animate-spin" />
          <p className="text-slate-600 font-bold tracking-tight">
            Chargement des lots…
          </p>
        </div>
      )}

      {/* Error banner */}
      {fetchError && !loading && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1400 
                        bg-white p-8 rounded-xl border border-red-100 shadow-2xl shadow-red-500/10 
                        text-center max-w-xs animate-in zoom-in duration-300"
        >
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-red-100">
            <p className="text-xl">⚠️</p>
          </div>
          <p className="text-lg font-black text-slate-800 mb-2">
            Erreur de chargement
          </p>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {fetchError}
          </p>
          <button
            onClick={loadPoints}
            className="btn-primary w-full shadow-lg shadow-brand-green/20"
          >
            <RefreshCw size={16} className="mr-2" /> Réessayer
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && points.length === 0 && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-500 
                        bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-brand-green/10 
                        shadow-2xl shadow-brand-green/10 text-center animate-in fade-in zoom-in duration-500"
        >
          <div className="text-4xl mb-4">📦</div>
          <p className="text-xl font-black text-slate-800 mb-1 leading-tight">
            Aucun lot disponible
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Revenez plus tard pour de nouvelles offres.
          </p>
        </div>
      )}

      {/* Stats badge */}
      {!loading && !fetchError && (
        <div
          ref={uiRefs.stats}
          className="absolute top-6 left-6 z-1000 bg-white/90 backdrop-blur-xl border border-brand-green/15 
                     rounded-xl p-5 flex gap-8 items-center shadow-2xl shadow-black/5 opacity-0 scale-95"
        >
          <div>
            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-1">
              Lots
            </p>
            <p className="text-3xl font-black text-brand-green leading-none">
              {points.length}
              <span className="text-[11px] text-slate-300 font-bold ml-1 uppercase tracking-tighter">
                dispo
              </span>
            </p>
          </div>
          <div className="w-px h-10 bg-slate-200/50" />
          <div>
            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-1">
              Poids Total
            </p>
            <p className="text-3xl font-black text-blue-500 leading-none">
              {totalWeight.toFixed(0)}
              <span className="text-[11px] text-slate-300 font-bold ml-1 uppercase tracking-tighter">
                kg
              </span>
            </p>
          </div>
          <button
            onClick={loadPoints}
            className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/10 flex items-center justify-center
                       text-brand-green hover:bg-brand-green hover:text-white transition-all active:scale-90"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      )}

      {/* Category legend */}
      {!loading && !fetchError && (
        <div
          ref={uiRefs.legend}
          className="absolute top-6 right-6 z-1000 bg-white/90 backdrop-blur-xl border border-slate-200/50 
                     rounded-xl p-5 flex flex-col gap-3 shadow-2xl shadow-black/5 opacity-0 scale-95"
        >
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-1">
            Catégories
          </p>
          {Object.entries(CATEGORY_COLORS)
            .filter(([c]) => c !== "Autre")
            .map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-4 group">
                <div
                  className="w-3 h-3 rounded-full shadow-lg transition-transform group-hover:scale-125"
                  style={{
                    background: color,
                    boxShadow: `0 0 10px ${color}66`,
                  }}
                />
                <span className="text-sm text-slate-600 font-semibold tracking-tight">
                  {CATEGORY_EMOJI[cat]} {cat}
                </span>
              </div>
            ))}
        </div>
      )}

      {popup && (
        <MarketPopup
          key={popup.point.id}
          point={popup.point}
          origin={popup.origin}
          onClose={() => setPopup(null)}
          onBuy={handleBuy}
        />
      )}

      {payment && (
        <PaymentPanel
          point={payment}
          onClose={() => setPayment(null)}
          onComplete={() => {
            setTimeout(() => setPayment(null), 3500);
          }}
        />
      )}
    </div>
  );
};
