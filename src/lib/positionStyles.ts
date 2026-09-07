const POSITION_STYLES: Record<string, string> = {
  QB: "bg-red-500/15 text-red-400 border-red-500/30",
  RB: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  WR: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  TE: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "W/R/T": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  K: "bg-slate-400/15 text-slate-300 border-slate-400/30",
  DEF: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  BN: "bg-white/5 text-muted border-white/10",
};

export function positionStyle(position: string): string {
  return POSITION_STYLES[position] ?? "bg-white/5 text-muted border-white/10";
}
