import { Recycle } from "lucide-react";

interface LogoProps {
  color?: string;
  size?: number;
  className?: string;
}

export function Logo({ color = "text-brand-green", size = 32, className = "" }: LogoProps) {
  const colorClass = color.startsWith("text-") ? color : "";
  const colorStyle = !color.startsWith("text-") ? { color } : {};

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Recycle 
        size={size} 
        className={colorClass} 
        style={colorStyle}
        strokeWidth={2.5} 
      />
      <span 
        className="text-2xl font-bold tracking-tight"
        style={{ ...colorStyle, fontSize: size * 0.75 > 16 ? size * 0.75 : 16 }}
      >
        NoThrowam
      </span>
    </div>
  );
}
