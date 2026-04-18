import React from "react";

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  mobileNav: React.ReactNode;
  children: React.ReactNode; // Usually the map
  overlay?: React.ReactNode; // e.g. Agent Chat
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  mobileNav,
  children,
  overlay
}) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-brand-surface font-sans antialiased">
      {/* 1. Underlay Map */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* 2. Sidebars & Navigation overlays */}
      <div className="relative z-40">
        <div className="hidden md:block">
          {sidebar}
        </div>
        <div className="md:hidden">
          {mobileNav}
        </div>
      </div>

      {/* 3. Global Overlays (e.g. Chat) */}
      <div className="relative z-50">
        {overlay}
      </div>
    </div>
  );
};
