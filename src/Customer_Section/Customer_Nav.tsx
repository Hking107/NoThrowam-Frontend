import { useState } from "react";
import {
  LayoutDashboard,
  Bot,
  ShoppingCart,
} from "lucide-react";
import { CustomerMap } from "./Customer_Map";
import { CustomerAgentChat } from "./Customeragentchat";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Sidebar } from "../components/Dashboard/Sidebar";
import { MobileNav } from "../components/Dashboard/MobileNav";
import { DashboardLayout } from "../components/Dashboard/DashboardLayout";

export const Customer_Nav = () => {
  const [active, setActive]         = useState("map");
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentOpen, setAgentOpen]   = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const navItems = [
    { id: "map",   label: "Carte",        Icon: LayoutDashboard },
    { id: "cart",  label: "Mon panier",   Icon: ShoppingCart    },
    { id: "agent", label: "Assistant IA", Icon: Bot, badge: "IA" },
  ];

  const handleNavClick = (id: string) => {
    if (id === "agent") {
      setAgentOpen(true);
      setMobileOpen(false);
    } else {
      setActive(id);
      setMobileOpen(false);
      setAgentOpen(false); // Close agent if switching to another tab
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
          userName="User"
          userRole="Verified Client"
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
        />
      }
      overlay={
        agentOpen && (
          <CustomerAgentChat onClose={() => setAgentOpen(false)} />
        )
      }
    >
      <CustomerMap />
    </DashboardLayout>
  );
};