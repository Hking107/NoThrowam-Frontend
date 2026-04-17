import { useState } from "react";
import {
  LayoutDashboard,
  Bot,
} from "lucide-react";
import { ManagerMap } from "./Manager_Map";
import { AgentChat } from "./AgentChat";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Sidebar } from "../components/Dashboard/Sidebar";
import { MobileNav } from "../components/Dashboard/MobileNav";
import { DashboardLayout } from "../components/Dashboard/DashboardLayout";

export const Manager_Nav = () => {
  const [active, setActive]         = useState("dashboard");
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentOpen, setAgentOpen]   = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const navItems = [
    { id: "dashboard", label: "Map",      Icon: LayoutDashboard },
    { id: "agent",     label: "AI Agent", Icon: Bot, badge: "AI" },
  ];

  const handleNavClick = (id: string) => {
    if (id === "agent") {
      setAgentOpen(true);
      setMobileOpen(false);
    } else {
      setActive(id);
      setMobileOpen(false);
      setAgentOpen(false);
    }
  };

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          items={navItems}
          activeId={agentOpen ? "agent" : active}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onItemClick={handleNavClick}
          onLogout={handleLogout}
          userName="Manager"
          userRole="Admin Panel"
        />
      }
      mobileNav={
        <MobileNav 
          items={navItems}
          activeId={agentOpen ? "agent" : active}
          isOpen={mobileOpen}
          onToggle={() => setMobileOpen(!mobileOpen)}
          onItemClick={handleNavClick}
          onLogout={handleLogout}
          brandName="Manager"
        />
      }
      overlay={
        agentOpen && (
          <AgentChat onClose={() => setAgentOpen(false)} />
        )
      }
    >
      <ManagerMap />
    </DashboardLayout>
  );
};