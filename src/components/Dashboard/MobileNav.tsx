import React, { useRef } from "react";
import { 
  Menu, 
  X, 
  LogOut,
  ShoppingCart
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface NavItem {
  id: string;
  label: string;
  Icon: any;
  badge?: string;
}

interface MobileNavProps {
  items: NavItem[];
  activeId: string;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: (id: string) => void;
  onLogout: () => void;
  brandName?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  items,
  activeId,
  isOpen,
  onToggle,
  onItemClick,
  onLogout,
  brandName = "EcoMarché"
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const appBarRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(
        dropdownRef.current,
        { y: -20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  useGSAP(() => {
    gsap.fromTo(
      appBarRef.current,
      { y: -100 },
      { y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, { scope: appBarRef });

  return (
    <>
      {/* Mobile App Bar */}
      <header
        ref={appBarRef}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between
                   bg-white/80 backdrop-blur-xl border-b border-brand-green/10 md:hidden shadow-lg shadow-black/5"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl from-brand-green to-[#005f48] 
                          flex items-center justify-center shadow-lg shadow-brand-green/20">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <div>
            <p className="text-brand-green font-black text-sm tracking-tight leading-none uppercase">
              {brandName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-green/60 bg-brand-green/5 px-2 py-1 rounded-lg border border-brand-green/10">
            {items.find(i => i.id === activeId)?.label}
          </span>
          <button
            onClick={onToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                       ${isOpen ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 text-slate-500'}`}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed top-20 left-4 right-4 z-50 p-3 bg-white/95 backdrop-blur-2xl 
                     border border-brand-green/15 rounded-3xl shadow-2xl md:hidden"
        >
          <div className="flex flex-col gap-1.5">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 outline-none
                             ${isActive 
                               ? 'bg-brand-green/10 text-brand-green shadow-sm' 
                               : 'text-slate-500 active:bg-slate-50'}`}
                >
                  <item.Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  )}
                  
                  {item.badge && !isActive && (
                    <span className="ml-auto px-2 py-0.5 rounded-lg bg-brand-green/10 border border-brand-green/20 
                                     text-brand-green text-[9px] font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="h-px bg-slate-100 my-2 mx-2" />

            <button
              onClick={onLogout}
              className="flex items-center gap-4 w-full p-4 rounded-2xl text-red-500 active:bg-red-50 transition-colors outline-none"
            >
              <LogOut size={20} />
              <span className="font-bold text-sm tracking-tight">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
