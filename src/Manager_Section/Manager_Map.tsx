import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, CheckCircle, RotateCcw } from "lucide-react";

declare global { interface Window { L: any } }

/* ─── Types ─────────────────────────────────── */
type Status = "collected" | "pending";

type GarbagePoint = {
  id: number;
  lat: number;
  lng: number;
  label: string;
  status: Status;
  images: { id: number; url: string }[];
};

/* ─── Mock data ──────────────────────────────── */
const MOCK_POINTS: GarbagePoint[] = [
  {
    id: 1, lat: 48.8566, lng: 2.3522, label: "Rue de Rivoli #12", status: "pending",
    images: [
      { id: 1, url: "https://picsum.photos/seed/gb1a/600/800" },
      { id: 2, url: "https://picsum.photos/seed/gb1b/600/800" },
      { id: 3, url: "https://picsum.photos/seed/gb1c/600/800" },
    ],
  },
  {
    id: 2, lat: 48.8606, lng: 2.3376, label: "Place du Louvre", status: "collected",
    images: [
      { id: 1, url: "https://picsum.photos/seed/gb2a/600/800" },
      { id: 2, url: "https://picsum.photos/seed/gb2b/600/800" },
    ],
  },
  {
    id: 3, lat: 48.8496, lng: 2.3588, label: "Boulevard Saint-Germain", status: "pending",
    images: [
      { id: 1, url: "https://picsum.photos/seed/gb3a/600/800" },
      { id: 2, url: "https://picsum.photos/seed/gb3b/600/800" },
    ],
  },
  {
    id: 4, lat: 48.8530, lng: 2.3499, label: "Île de la Cité", status: "collected",
    images: [
      { id: 1, url: "https://picsum.photos/seed/gb4a/600/800" },
    ],
  },
  {
    id: 5, lat: 48.8650, lng: 2.3600, label: "Canal Saint-Martin", status: "pending",
    images: [
      { id: 1, url: "https://picsum.photos/seed/gb5a/600/800" },
      { id: 2, url: "https://picsum.photos/seed/gb5b/600/800" },
      { id: 3, url: "https://picsum.photos/seed/gb5c/600/800" },
    ],
  },
];

const CLR: Record<Status, string> = { collected: "#22c55e", pending: "#ef4444" };

/* ─── Popup ──────────────────────────────────── */
const GarbagePopup = ({
  point,
  origin,           // {x,y} pixel on screen where marker lives
  onClose,
  onToggle,
}: {
  point: GarbagePoint;
  origin: { x: number; y: number };
  onClose: () => void;
  onToggle: (id: number) => void;
}) => {
  const [idx, setIdx]         = useState(0);
  const [dir, setDir]         = useState<"left" | "right" | null>(null);
  const [animating, setAnim]  = useState(false);
  const [visible, setVisible] = useState(false);   // drives mount animation
  const [closing, setClosing] = useState(false);

  const imgs = point.images;
  const isCollected = point.status === "collected";

  /* ── Mount animation ── */
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  /* ── Close with animation ── */
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 350);
  }, [onClose]);

  /* ── Navigate images ── */
  const go = (d: "left" | "right") => {
    if (animating) return;
    setDir(d);
    setAnim(true);
    setTimeout(() => {
      setIdx(i => d === "right" ? (i + 1) % imgs.length : (i - 1 + imgs.length) % imgs.length);
      setDir(null);
      setAnim(false);
    }, 280);
  };

  /* ── Popup sizing & placement beside the marker ── */
  const W = 280, H = 400;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = origin.x + 28;
  let top  = origin.y - H / 2;
  if (left + W > vw - 12) left = origin.x - W - 28;
  if (top < 12)           top  = 12;
  if (top + H > vh - 12)  top  = vh - H - 12;

  /* transform origin so it "grows" from the marker dot */
  const originX = origin.x < left + W / 2 ? "left" : "right";
  const transformOrigin = `${originX} center`;

  const popupStyle: React.CSSProperties = {
    position:      "fixed",
    left, top, width: W, height: H,
    zIndex:        3000,
    borderRadius:  22,
    overflow:      "hidden",
    boxShadow:     "0 24px 64px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.08)",
    transformOrigin,
    /* entrance / exit */
    transition:    closing
      ? "opacity .3s ease, transform .35s cubic-bezier(.4,0,1,1), filter .3s ease"
      : "opacity .35s cubic-bezier(.34,1.56,.64,1), transform .4s cubic-bezier(.34,1.56,.64,1), filter .3s ease",
    opacity:  visible && !closing ? 1 : 0,
    transform: visible && !closing ? "scale(1)" : "scale(0.55)",
    filter:   visible && !closing ? "blur(0px)" : "blur(6px)",
  };

  /* image slide animation */
  const imgStyle: React.CSSProperties = {
    position:   "absolute",
    inset:       0,
    width:       "100%",
    height:      "100%",
    objectFit:   "cover",
    display:     "block",
    transition:  "transform .28s cubic-bezier(.4,0,.2,1), opacity .28s ease",
    transform:   animating
      ? dir === "right" ? "translateX(-8%) scale(.96)" : "translateX(8%) scale(.96)"
      : "translateX(0) scale(1)",
    opacity:     animating ? 0 : 1,
  };

  return (
    <div style={popupStyle} onClick={e => e.stopPropagation()}>

      {/* ── Full-bleed image ── */}
      <div style={{ position: "absolute", inset: 0, background: "#0a0f1e" }}>
        <img src={imgs[idx].url} alt="" style={imgStyle} />

        {/* subtle dark vignette so UI elements stay legible */}
        <div style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 35%, transparent 55%, rgba(0,0,0,.72) 100%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* ── TOP BAR: close + dot counter ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px",
        zIndex: 10,
      }}>
        {/* dot indicators */}
        <div style={{ display: "flex", gap: 5 }}>
          {imgs.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > idx ? "right" : "left"); setIdx(i); }}
              style={{
                width: i === idx ? 18 : 6, height: 6,
                borderRadius: 3, border: "none", cursor: "pointer",
                background: i === idx ? "#fff" : "rgba(255,255,255,.4)",
                transition: "width .25s cubic-bezier(.34,1.56,.64,1), background .2s",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* close button */}
        <button
          onClick={close}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30,
            background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: "50%", color: "white",
            cursor: "pointer", fontSize: 14,
            transition: "background .18s, transform .18s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,.75)";
            (e.currentTarget as HTMLElement).style.transform = "scale(1.12)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,.45)";
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* ── SIDE ARROWS ── */}
      {imgs.length > 1 && (
        <>
          <button onClick={() => go("left")}  style={arrowStyle("left")}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go("right")} style={arrowStyle("right")}>
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* ── BOTTOM: collect button ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 14px 16px",
        zIndex: 10,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {/* location label */}
        <p style={{
          margin: 0, color: "rgba(255,255,255,.75)",
          fontSize: 11, fontWeight: 600, letterSpacing: ".02em",
          textShadow: "0 1px 4px rgba(0,0,0,.8)",
        }}>
          📍 {point.label}
        </p>

        {/* action button */}
        <button
          onClick={() => onToggle(point.id)}
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            7,
            width:          "100%",
            padding:        "11px 0",
            borderRadius:   14,
            border:         "none",
            cursor:         "pointer",
            fontWeight:     700,
            fontSize:       13,
            letterSpacing:  ".01em",
            backdropFilter: "blur(12px)",
            transition:     "transform .18s cubic-bezier(.34,1.56,.64,1), background .2s, box-shadow .2s",
            background:     isCollected
              ? "rgba(239,68,68,.82)"
              : "rgba(34,197,94,.82)",
            color: "#fff",
            boxShadow: isCollected
              ? "0 4px 20px rgba(239,68,68,.5)"
              : "0 4px 20px rgba(34,197,94,.5)",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
        >
          {isCollected
            ? <><RotateCcw size={14} /> Mark as Pending</>
            : <><CheckCircle size={14} /> Mark as Collected</>}
        </button>
      </div>
    </div>
  );
};

const arrowStyle = (side: "left" | "right"): React.CSSProperties => ({
  position:       "absolute",
  top:            "50%",
  transform:      "translateY(-50%)",
  [side]:         10,
  zIndex:         10,
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  width:          34, height: 34,
  background:     "rgba(0,0,0,.45)",
  backdropFilter: "blur(8px)",
  border:         "1px solid rgba(255,255,255,.15)",
  borderRadius:   "50%",
  color:          "white",
  cursor:         "pointer",
});

/* ─── Main ───────────────────────────────────── */
export const ManagerMap = () => {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Record<number, any>>({});

  const [points, setPoints]     = useState<GarbagePoint[]>(MOCK_POINTS);
  const [popup, setPopup]       = useState<{ point: GarbagePoint; origin: { x: number; y: number } } | null>(null);
  const [leafletReady, setReady] = useState(!!window.L);

  /* inject Leaflet */
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  /* build map once */
  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [48.857, 2.352], zoom: 14, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO", maxZoom: 19,
    }).addTo(map);
    leafletRef.current = map;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.6);opacity:0} }
      @keyframes pulse  { 0%,100%{box-shadow:0 0 0 4px var(--mc)55} 50%{box-shadow:0 0 0 8px var(--mc)22} }
    `;
    document.head.appendChild(style);

    return () => { map.remove(); leafletRef.current = null; };
  }, [leafletReady]);

  /* sync markers */
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    points.forEach(pt => {
      const color = CLR[pt.status];
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer">
            <div style="
              position:absolute;width:32px;height:32px;border-radius:50%;
              background:${color}22;animation:ripple 2.2s ease-out infinite;
            "></div>
            <div style="
              width:17px;height:17px;border-radius:50%;
              background:${color};border:2.5px solid rgba(255,255,255,.9);
              box-shadow:0 0 0 4px ${color}44;
              position:relative;z-index:2;
              transition:transform .2s;
            "></div>
          </div>`,
        iconSize: [44, 44], iconAnchor: [22, 22],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon }).addTo(map);

      marker.on("click", (e: any) => {
        e.originalEvent.stopPropagation();
        const cp = map.latLngToContainerPoint([pt.lat, pt.lng]);
        const rect = mapRef.current!.getBoundingClientRect();
        // get the CURRENT point state (not stale closure)
        setPoints(prev => {
          const current = prev.find(p => p.id === pt.id)!;
          setPopup({ point: current, origin: { x: rect.left + cp.x, y: rect.top + cp.y } });
          return prev;
        });
      });

      markersRef.current[pt.id] = marker;
    });
  }, [points, leafletReady]);

  /* toggle status */
  const handleToggle = (id: number) => {
    setPoints(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === "collected" ? "pending" : "collected" } : p
    ));
    setPopup(prev => prev && prev.point.id === id
      ? { ...prev, point: { ...prev.point, status: prev.point.status === "collected" ? "pending" : "collected" } }
      : prev
    );
  };

  const collected = points.filter(p => p.status === "collected").length;
  const pending   = points.filter(p => p.status === "pending").length;

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onClick={() => setPopup(null)}
    >
      <div ref={mapRef} style={{ width: "100%", height: "100%", background: "#0a0f1e" }} />

      {/* Stats badge */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1000,
        background: "rgba(8,15,30,.82)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.09)",
        borderRadius: 16, padding: "12px 18px",
        color: "white", display: "flex", gap: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 9, opacity: .45, fontWeight: 700, letterSpacing: 1.2 }}>COLLECTED</p>
          <p style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 800, color: "#22c55e" }}>
            {collected}<span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 400 }}> pts</span>
          </p>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,.07)" }} />
        <div>
          <p style={{ margin: 0, fontSize: 9, opacity: .45, fontWeight: 700, letterSpacing: 1.2 }}>PENDING</p>
          <p style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 800, color: "#ef4444" }}>
            {pending}<span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 400 }}> pts</span>
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 1000,
        background: "rgba(8,15,30,.82)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.09)",
        borderRadius: 14, padding: "12px 16px",
        color: "white", fontSize: 12,
        display: "flex", flexDirection: "column", gap: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      }}>
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, opacity: .4 }}>LEGEND</p>
        {(Object.entries(CLR) as [Status, string][]).map(([s, c]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: c, boxShadow: `0 0 7px ${c}` }} />
            <span style={{ textTransform: "capitalize", opacity: .75 }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Popup */}
      {popup && (
        <GarbagePopup
          key={popup.point.id}
          point={popup.point}
          origin={popup.origin}
          onClose={() => setPopup(null)}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
};