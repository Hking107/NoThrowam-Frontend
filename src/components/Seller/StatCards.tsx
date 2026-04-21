import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  bg: string;
  title: string;
  value: string;
  trend: string;
  positive: boolean | null;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, bg, title, value, trend, positive, isLoading }) => (
  <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover-glow transition-all duration-500">
    {/* Decorative Background Gradient */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${bg.replace('bg-', 'bg-')}`}></div>
    
    <div className="flex justify-between items-start z-10 relative">
      <div className={`p-4 rounded-2xl ${bg} shadow-inner flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      
      {!isLoading && trend && (
        <div className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full border shadow-sm ${
          positive === true ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
          positive === false ? 'bg-red-50 text-red-600 border-red-100' : 
          'bg-gray-50 text-gray-400 border-gray-100'
        }`}>
          {positive === true && <TrendingUp size={12} />}
          {positive === false && <TrendingDown size={12} />}
          {trend}
        </div>
      )}

      {isLoading && (
        <div className="w-12 h-5 skeleton"></div>
      )}
    </div>
    
    <div className="mt-6 z-10 relative">
      <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        {isLoading ? (
          <div className="w-32 h-8 skeleton mt-1"></div>
        ) : (
          <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</h3>
        )}
      </div>
    </div>
  </div>
);