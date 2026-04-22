import { useState, useEffect } from "react";

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

const KEYFRAMES = `
  @keyframes ripple {
    0%   { transform: scale(1);   opacity: .6 }
    100% { transform: scale(2.6); opacity: 0  }
  }
  @keyframes agentRing {
    0%   { transform: scale(.4);  opacity: 1  }
    70%  { transform: scale(2.8); opacity: .5 }
    100% { transform: scale(3.4); opacity: 0  }
  }
  .leaflet-control-attribution { display: none !important; }
`;

/**
 * Loads Leaflet (CSS + JS) lazily and initialises the map once both are ready.
 * Returns the map instance ref and a `leafletReady` flag.
 */
export function useMapLeaflet(
  mapDivRef:  React.MutableRefObject<HTMLDivElement | null>,
  leafletRef: React.MutableRefObject<any>,
) {
  const [leafletReady, setReady] = useState(!!window.L);

  /* ── Load Leaflet assets ── */
  useEffect(() => {
    if (window.L) { setReady(true); return; }

    const link  = Object.assign(document.createElement("link"), { rel: "stylesheet", href: LEAFLET_CSS });
    const script = Object.assign(document.createElement("script"), {
      src:    LEAFLET_JS,
      onload: () => setReady(true),
    });
    document.head.append(link, script);
  }, []);

  /* ── Init map ── */
  useEffect(() => {
    if (!leafletReady || !mapDivRef.current || leafletRef.current) return;

    const L   = window.L;
    const map = L.map(mapDivRef.current, { center: [3.848, 11.502], zoom: 14, zoomControl: false });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
      maxZoom: 19,
    }).addTo(map);

    leafletRef.current = map;

    const style = Object.assign(document.createElement("style"), { textContent: KEYFRAMES });
    document.head.appendChild(style);

    return () => { map.remove(); leafletRef.current = null; };
  }, [leafletReady, mapDivRef, leafletRef]);

  return { leafletReady };
}
