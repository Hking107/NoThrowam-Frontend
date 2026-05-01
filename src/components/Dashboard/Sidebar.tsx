import React, { useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Recycle,
  User
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../../contexts/AuthContext";
// import { Logo } from "../Logo";
const handleLogout = () => {
    const { logout } = useAuth();
    logout();
    window.location.href = "/signin";
  };
interface NavItem {
  id: string;
  label: string;
  Icon: any;
  badge?: string;
}

interface SidebarProps {
  items: NavItem[];
  activeId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onItemClick: (id: string) => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeId,
  isCollapsed,
  onToggleCollapse,
  onItemClick,
  userName = "User",
  userRole = "Authenticated User"
}) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useGSAP(() => {
    // Initial entry animation
    gsap.fromTo(
      sidebarRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    // Staggered items animation
    gsap.fromTo(
      itemsRef.current.filter(Boolean),
      { x: -20, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.5, 
        stagger: 0.1, 
        ease: "power2.out",
        delay: 0.3 
      }
    );
  }, { scope: sidebarRef });

  // Animation for collapse/expand
  useEffect(() => {
    gsap.to(sidebarRef.current, {
      width: isCollapsed ? 80 : 240,
      duration: 0.4,
      ease: "power3.inOut"
    });
  }, [isCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-stretch
                 bg-white/80 backdrop-blur-xl border border-brand-green/15 rounded-[2rem]
                 py-6 px-3 shadow-2xl overflow-hidden group"
      style={{ width: isCollapsed ? 80 : 240 }}
    >
      {/* Brand / Logo */}
      <div className={`flex items-center gap-3 mb-8 px-2 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green to-[#005f48] 
                        flex items-center justify-center shadow-lg shadow-brand-green/20">
          <Recycle color="white" size={24} className="scale-100" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-brand-green font-black text-sm tracking-tight leading-none uppercase">
              NoThrowam
            </p>
            <p className="text-brand-green/60 text-[10px] font-bold tracking-widest uppercase mt-0.5">
              Eco-System
            </p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="xl:flex xl:flex-col xl:gap-2 xl:flex-1">
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              ref={el => itemsRef.current[index] = el}
              onClick={() => onItemClick(item.id)}
              className={`
                group relative flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300
                ${isCollapsed ? 'justify-center' : 'justify-start'}
                ${isActive 
                  ? 'bg-brand-green/10 text-brand-green' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
              `}
            >
              <item.Icon size={20} className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              
              {!isCollapsed && (
                <span className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}

              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(0,122,94,0.6)]" />
              )}

              {item.badge && !isCollapsed && !isActive && (
                <span className="ml-auto px-2 py-0.5 rounded-lg bg-brand-green/10 border border-brand-green/20 
                                 text-brand-green text-[9px] font-bold uppercase tracking-wider">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-brand-text text-white text-xs font-bold rounded-lg
                                opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0
                                transition-all duration-300 whitespace-nowrap z-[60]">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="mt-auto flex flex-col gap-4">
        <div className="h-px bg-slate-200/50 mx-2" />
        
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-brand-green/5 border border-brand-green/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green to-[#005f48] 
                            flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
              <User size={18} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-brand-text text-sm truncate uppercase tracking-tight">
                {userName}
              </p>
              <p className="text-brand-green/60 text-[10px] font-bold truncate uppercase tracking-widest leading-none">
                {userRole}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center group relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green to-[#005f48] 
                            flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
              <User size={18} className="text-white" />
            </div>
             <div className="absolute left-full ml-4 px-3 py-1.5 bg-brand-text text-white text-xs font-bold rounded-lg
                                opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0
                                transition-all duration-300 whitespace-nowrap z-[60]">
                  {userName}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            handleLogout();
              // setIsMobileMenuOpen(false);
          }}
          className={`flex items-center gap-3 w-full p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors
                     ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-8 h-8 self-center rounded-xl bg-slate-100 text-slate-400 
                     hover:bg-brand-green/10 hover:text-brand-green transition-all duration-300 border border-slate-200/50"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
