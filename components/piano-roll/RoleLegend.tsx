import { pianoRollNoteRoleClasses, pianoRollNoteRoleLabels, pianoRollNoteRoles } from "@/lib/pianoRoll/noteRoles";

export function RoleLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-zinc-400" aria-label="피아노롤 색상 범례">
      {pianoRollNoteRoles.map((role) => (
        <span key={role} className="inline-flex items-center gap-1.5">
          <span className={`size-2.5 rounded-[2px] ${pianoRollNoteRoleClasses[role]}`} aria-hidden />
          {pianoRollNoteRoleLabels[role]}
        </span>
      ))}
    </div>
  );
}
