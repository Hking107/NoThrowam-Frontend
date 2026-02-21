import { Recycle } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Recycle className="h-8 w-8 text-brand-green" strokeWidth={2.5} />
      <span className="text-2xl font-bold tracking-tight text-brand-green">
        NoThrowam
      </span>
    </div>
  );
}
