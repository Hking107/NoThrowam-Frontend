import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bot,
  ShoppingCart,
  User,
} from "lucide-react";
import { CustomerMap } from "./Customer_Map";
import { CustomerAgentChat } from "./Customeragentchat";
import { useNavigate } from "react-router-dom";

export const Customer_Nav = () => {
  const [active, setActive]         = useState("map");
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentOpen, setAgentOpen]   = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const navItems = [
    { id: "map",   label: "Carte",        Icon: LayoutDashboard },
    { id: "cart",  label: "Mon panier",   Icon: ShoppingCart    },
    { id: "agent", label: "Assistant IA", Icon: Bot             },
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
    display:       "flex",
    alignItems:    "center",
    gap:           collapsed ? 0 : 11,
    justifyContent: collapsed ? "center" : "flex-start",
    width:         "100%",
    padding:       "10px 13px",
    borderRadius:  18,
    border:        "none",
    background:    isActive
      ? isAgentBtn ? "rgba(34,197,94,.18)" : "rgba(34,197,94,.14)"
      : "transparent",
    color:         isActive ? "#15803d" : "#94a3b8",
    cursor:        "pointer",
    transition:    "background .18s, color .18s",
    whiteSpace:    "nowrap",
    overflow:      "hidden",
    outline:       "none",
    boxSizing:     "border-box",
    fontSize:      14,
    fontWeight:    600,
    fontFamily:    "'Plus Jakarta Sans', 'Inter', sans-serif",
  });

  return (
    <div style={{
      position: "fixed", inset: 0,
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      overflow: "hidden",
      background: "#f8fafc",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @media(min-width:768px){.cust-appbar{display:none!important}}
        @media(max-width:767px){.cust-sidebar{display:none!important}}
      `}</style>

      {/* ① Map fills viewport */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <CustomerMap />
      </div>

      {/* ② Agent overlay */}
      {agentOpen && (
        <CustomerAgentChat onClose={() => setAgentOpen(false)} />
      )}

      {/* ──── DESKTOP SIDEBAR ──── */}
      <aside
        className="cust-sidebar"
        style={{
          position:   "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          zIndex:     40, display: "flex", flexDirection: "column", alignItems: "stretch",
          width:      collapsed ? 62 : 200,
          background: "rgba(255,255,255,.92)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border:     "1px solid rgba(34,197,94,.15)",
          borderRadius: 28,
          padding:    "18px 10px 14px",
          boxSizing:  "border-box",
          transition: "width .32s cubic-bezier(.4,0,.2,1)",
          boxShadow:  "0 12px 40px rgba(0,0,0,.1), 0 0 0 .5px rgba(34,197,94,.1) inset",
          overflow:   "hidden",
        }}
      >
        {/* Brand */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
          paddingLeft: collapsed ? 0 : 2,
          justifyContent: collapsed ? "center" : "flex-start",
          overflow: "hidden",
        }}>
          <div style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 12,
            background: "linear-gradient(135deg,#22c55e,#15803d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(34,197,94,.35)",
          }}>
            <ShoppingCart size={17} color="white"/>
          </div>
          {!collapsed && (
            <div>
              <p style={{ margin: 0, color: "#15803d", fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "-.01em" }}>
                EcoMarché
              </p>
              <p style={{ margin: 0, fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: ".06em" }}>
                RECYCLAGE & VENTE
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
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
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,.08)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
                {isActive && !collapsed && (
                  <span style={{
                    marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                    background: "#22c55e", boxShadow: "0 0 8px #22c55e", flexShrink: 0,
                  }}/>
                )}
                {isAgentBtn && !isActive && !collapsed && (
                  <span style={{
                    marginLeft: "auto", padding: "2px 6px", borderRadius: 6,
                    background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)",
                    color: "#16a34a", fontSize: 8, fontWeight: 700, letterSpacing: ".06em", flexShrink: 0,
                  }}>IA</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separator */}
        <div style={{ height: 1, background: "rgba(0,0,0,.06)", margin: "10px 6px" }} />

        {/* Profile pill */}
        {!collapsed && (
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: 14,
            background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.1)",
            marginBottom: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 9,
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User size={14} color="white"/>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#15803d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>User name</p>
              <p style={{ margin: 0, fontSize: 10, color: "#4ade80", fontWeight: 500 }}>Verified client </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ ...pillBtn(false), color: "#ef4444", marginBottom: 8 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.08)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Déconnexion</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            alignSelf: "center", display: "flex", alignItems: "center", justifyContent: "center",
            padding: "6px 12px",
            background: "rgba(0,0,0,.04)", border: "1px solid rgba(0,0,0,.07)",
            borderRadius: 12, color: "#94a3b8", cursor: "pointer",
            outline: "none", transition: "background .18s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,.1)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,.04)")}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ──── MOBILE APP BAR ──── */}
      <header
        className="cust-appbar"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px",
          background: "rgba(255,255,255,.92)",
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          borderBottom: "1px solid rgba(34,197,94,.12)",
          borderRadius: "0 0 22px 22px",
          boxShadow: "0 4px 16px rgba(0,0,0,.08)", boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg,#22c55e,#15803d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 10px rgba(34,197,94,.3)",
          }}>
            <ShoppingCart size={15} color="white"/>
          </div>
          <div>
            <p style={{ margin: 0, color: "#15803d", fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 14 }}>EcoMarché</p>
          </div>
        </div>

        <span style={{ color: "#15803d", fontWeight: 700, fontSize: 13 }}>
          {agentOpen ? "Assistant IA" : navItems.find(n => n.id === active)?.label}
        </span>

        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 10,
            background: mobileOpen ? "rgba(34,197,94,.15)" : "rgba(0,0,0,.05)",
            border: `1px solid ${mobileOpen ? "rgba(34,197,94,.25)" : "rgba(0,0,0,.08)"}`,
            color: mobileOpen ? "#15803d" : "#64748b",
            cursor: "pointer", outline: "none", transition: "background .18s, color .18s",
          }}
        >
          {mobileOpen ? <X size={17}/> : <Menu size={17}/>}
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="cust-appbar"
          style={{
            position: "absolute", top: 64, left: 10, right: 10, zIndex: 39,
            background: "rgba(255,255,255,.97)", backdropFilter: "blur(22px)",
            border: "1px solid rgba(34,197,94,.15)", borderRadius: 22,
            padding: "10px 8px", boxShadow: "0 10px 40px rgba(0,0,0,.12)",
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
                  background: isActive ? "rgba(34,197,94,.1)" : "transparent",
                  color: isActive ? "#15803d" : "#64748b",
                  cursor: "pointer", fontWeight: 600, fontSize: 14,
                  boxSizing: "border-box", outline: "none",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <Icon size={18}/>{label}
                {isAgentBtn && !isActive && (
                  <span style={{
                    marginLeft: "auto", padding: "2px 6px", borderRadius: 5,
                    background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)",
                    color: "#16a34a", fontSize: 8, fontWeight: 700,
                  }}>IA</span>
                )}
                {isActive && (
                  <span style={{
                    marginLeft: isAgentBtn ? "0" : "auto",
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#22c55e", boxShadow: "0 0 7px #22c55e",
                  }}/>
                )}
              </button>
            );
          })}

          <div style={{ height: 1, background: "rgba(0,0,0,.06)", margin: "6px 4px" }} />

          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              width: "100%", padding: "12px 14px", borderRadius: 14, border: "none",
              background: "transparent", color: "#ef4444",
              cursor: "pointer", fontWeight: 600, fontSize: 14,
              boxSizing: "border-box", outline: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <LogOut size={18}/>Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};