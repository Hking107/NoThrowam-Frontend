import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bot,
} from "lucide-react";
import { ManagerMap } from "./Manager_Map";
import { AgentChat } from "./AgentChat";

export const Manager_Nav = () => {
  const [active, setActive]         = useState("dashboard");
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentOpen, setAgentOpen]   = useState(false);

  const navItems = [
    { id: "dashboard", label: "Map",      Icon: LayoutDashboard },
    { id: "agent",     label: "AI Agent", Icon: Bot             },
  ];

  const handleNavClick = (id: string) => {
    if (id === "agent") {
      setAgentOpen(true);
      setMobileOpen(false);
    } else {
      setActive(id);
      setMobileOpen(false);
    }
  };

  const pillBtn = (isActive: boolean, isAgentBtn?: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: collapsed ? 0 : 11,
    justifyContent: collapsed ? "center" : "flex-start",
    width: "100%",
    padding: "10px 13px",
    borderRadius: 18,
    border: "none",
    background: isActive
      ? isAgentBtn ? "rgba(34,197,94,.25)" : "rgba(34,197,94,.18)"
      : "transparent",
    color: isActive ? "#22c55e" : "rgba(255,255,255,.45)",
    cursor: "pointer",
    transition: "background .18s, color .18s",
    whiteSpace: "nowrap",
    overflow: "hidden",
    outline: "none",
    boxSizing: "border-box",
    fontSize: 14,
    fontWeight: 600,
  });

  return (
    <div style={{ position: "fixed", inset: 0, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>

      {/* ① Map — always fills the entire viewport */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <ManagerMap />
      </div>

      {/* ② AI Agent chat overlay */}
      {agentOpen && (
        <AgentChat onClose={() => setAgentOpen(false)} />
      )}

      {/* ──────────── DESKTOP SIDEBAR ──────────── */}
      <aside
        className="mgr-sidebar"
        style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          zIndex: 40, display: "flex", flexDirection: "column", alignItems: "stretch",
          width: collapsed ? 62 : 196,
          background: "rgba(8,15,30,.82)",
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          border: "1px solid rgba(255,255,255,.09)", borderRadius: 28,
          padding: "18px 10px 14px", boxSizing: "border-box",
          transition: "width .32s cubic-bezier(.4,0,.2,1)",
          boxShadow: "0 12px 48px rgba(0,0,0,.55), 0 0 0 .5px rgba(255,255,255,.04) inset",
          overflow: "hidden",
        }}
      >
        {/* Brand */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
          paddingLeft: collapsed ? 0 : 2,
          justifyContent: collapsed ? "center" : "flex-start", overflow: "hidden",
        }}>
          <div style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 12,
            background: "linear-gradient(135deg,#22c55e,#15803d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: "#fff",
            boxShadow: "0 4px 14px rgba(34,197,94,.38)",
          }}>M</div>
          {!collapsed && (
            <span style={{ color: "rgba(255,255,255,.9)", fontWeight: 700, fontSize: 15, letterSpacing: "-.01em" }}>
              Manager
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {navItems.map(({ id, label, Icon }) => {
            const isAgentBtn = id === "agent";
            const isActive   = isAgentBtn ? agentOpen : (active === id && !agentOpen);
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                title={collapsed ? label : undefined}
                style={pillBtn(isActive, isAgentBtn)}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = isAgentBtn ? "rgba(34,197,94,.1)" : "rgba(255,255,255,.07)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
                {isActive && !collapsed && (
                  <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", flexShrink: 0 }} />
                )}
                {isAgentBtn && !isActive && !collapsed && (
                  <span style={{
                    marginLeft: "auto", padding: "1px 5px", borderRadius: 5,
                    background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.28)",
                    color: "#4ade80", fontSize: 8, fontWeight: 700, letterSpacing: ".06em", flexShrink: 0,
                  }}>AI</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separator */}
        <div style={{ height: 1, background: "rgba(255,255,255,.07)", margin: "10px 6px" }} />

        {/* Logout */}
        <button
          style={{ ...pillBtn(false), color: "#f87171", marginBottom: 8 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.1)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <LogOut size={19} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            alignSelf: "center", display: "flex", alignItems: "center", justifyContent: "center",
            padding: "6px 11px",
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)",
            borderRadius: 12, color: "rgba(255,255,255,.4)", cursor: "pointer",
            outline: "none", transition: "background .18s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.12)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)")}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ──────────── MOBILE APP BAR ──────────── */}
      <header
        className="mgr-appbar"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px",
          background: "rgba(8,15,30,.82)",
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          borderRadius: "0 0 22px 22px",
          boxShadow: "0 6px 24px rgba(0,0,0,.35)", boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg,#22c55e,#15803d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14, color: "#fff",
            boxShadow: "0 3px 10px rgba(34,197,94,.35)",
          }}>M</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Manager</span>
        </div>

        <span style={{ color: "#22c55e", fontWeight: 600, fontSize: 13, letterSpacing: "-.01em" }}>
          {agentOpen ? "AI Agent" : navItems.find(n => n.id === active)?.label}
        </span>

        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 10,
            background: mobileOpen ? "rgba(34,197,94,.2)" : "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.1)",
            color: mobileOpen ? "#22c55e" : "rgba(255,255,255,.75)",
            cursor: "pointer", outline: "none", transition: "background .18s, color .18s",
          }}
        >
          {mobileOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="mgr-appbar"
          style={{
            position: "absolute", top: 64, left: 10, right: 10, zIndex: 39,
            background: "rgba(8,15,30,.94)", backdropFilter: "blur(22px)",
            border: "1px solid rgba(255,255,255,.09)", borderRadius: 22,
            padding: "10px 8px", boxShadow: "0 10px 40px rgba(0,0,0,.5)",
            animation: "dropIn .18s ease",
          }}
        >
          {navItems.map(({ id, label, Icon }) => {
            const isAgentBtn = id === "agent";
            const isActive   = isAgentBtn ? agentOpen : (active === id && !agentOpen);
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "12px 14px", borderRadius: 14, border: "none",
                  background: isActive ? "rgba(34,197,94,.15)" : "transparent",
                  color: isActive ? "#22c55e" : "rgba(255,255,255,.6)",
                  cursor: "pointer", fontWeight: 600, fontSize: 14,
                  boxSizing: "border-box", outline: "none",
                }}
              >
                <Icon size={19} />{label}
                {isAgentBtn && !isActive && (
                  <span style={{
                    marginLeft: "auto", padding: "1px 5px", borderRadius: 5,
                    background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.28)",
                    color: "#4ade80", fontSize: 8, fontWeight: 700,
                  }}>AI</span>
                )}
                {isActive && (
                  <span style={{
                    marginLeft: isAgentBtn ? "0" : "auto",
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#22c55e", boxShadow: "0 0 7px #22c55e",
                  }} />
                )}
              </button>
            );
          })}

          <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "6px 4px" }} />

          <button style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", padding: "12px 14px", borderRadius: 14, border: "none",
            background: "transparent", color: "#f87171",
            cursor: "pointer", fontWeight: 600, fontSize: 14,
            boxSizing: "border-box", outline: "none",
          }}>
            <LogOut size={19} />Logout
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .mgr-appbar { display: none !important; } }
        @media (max-width: 767px) { .mgr-sidebar { display: none !important; } }
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};