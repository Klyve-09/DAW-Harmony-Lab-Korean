export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  const labelText = label ?? "Progress";
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
        <span>{labelText}</span>
        <span>{clamped}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-sm bg-[#333333]"
        role="progressbar"
        aria-label={labelText}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div className="h-full bg-[#b8ff4d] transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
