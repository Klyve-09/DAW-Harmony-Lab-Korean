import type { ProjectCheckpoint } from "@/types/lesson";
import type { PianoRollNote } from "@/types/music";

export type ProjectLayerId = "bass" | "pad" | "piano" | "arp";

export type ProjectLayer = {
  id: ProjectLayerId;
  name: string;
  role: string;
  instruction: string;
  notes: PianoRollNote[];
};

function cloneWith(note: PianoRollNote, id: string, overrides: Partial<PianoRollNote>): PianoRollNote {
  return { ...note, ...overrides, id };
}

function chordGroups(notes: PianoRollNote[]) {
  return notes.reduce((groups, note) => {
    const beat = Math.round(note.startBeat);
    groups.set(beat, [...(groups.get(beat) ?? []), note]);
    return groups;
  }, new Map<number, PianoRollNote[]>());
}

export function buildProjectLayers(checkpoint: ProjectCheckpoint): ProjectLayer[] {
  const groups = [...chordGroups(checkpoint.notes).entries()].sort(([left], [right]) => left - right);
  const layerInfo = checkpoint.instrumentLayers ?? [
    { name: "Bass", role: "저역", instruction: "각 코드 루트만 길게 둡니다." },
    { name: "Pad", role: "중역", instruction: "코드톤을 길게 유지합니다." },
    { name: "Piano", role: "리듬", instruction: "짧은 컴핑으로 리듬을 만듭니다." },
    { name: "Arp", role: "상단", instruction: "코드톤을 분산해 움직임을 만듭니다." }
  ];

  const bass = groups.flatMap(([beat, notes]) => {
    const root = notes.find((note) => note.role === "root") ?? notes[0];
    return root ? [cloneWith(root, `layer-bass-${root.id}`, { startBeat: beat, duration: 1, velocity: 0.82, voice: "bass", role: "root" })] : [];
  });

  const pad = checkpoint.notes.map((note) =>
    cloneWith(note, `layer-pad-${note.id}`, { duration: 1, velocity: 0.5, voice: note.role === "root" ? "bass" : "pad" })
  );

  const piano = groups.flatMap(([beat, notes]) =>
    notes.map((note, index) =>
      cloneWith(note, `layer-piano-${note.id}-${index}`, {
        startBeat: beat + (index % 2 === 0 ? 0 : 0.5),
        duration: 0.45,
        velocity: 0.72,
        voice: note.role === "root" ? "bass" : "inner"
      })
    )
  );

  const arp = groups.flatMap(([beat, notes]) =>
    notes.map((note, index) =>
      cloneWith(note, `layer-arp-${note.id}-${index}`, {
        startBeat: Math.min(beat + index * 0.25, beat + 0.75),
        duration: 0.22,
        velocity: 0.62,
        voice: "arp"
      })
    )
  );

  return [
    { id: "bass", name: layerInfo[0]?.name ?? "Bass", role: layerInfo[0]?.role ?? "저역", instruction: layerInfo[0]?.instruction ?? "", notes: bass },
    { id: "pad", name: layerInfo[1]?.name ?? "Pad", role: layerInfo[1]?.role ?? "중역", instruction: layerInfo[1]?.instruction ?? "", notes: pad },
    { id: "piano", name: layerInfo[2]?.name ?? "Piano", role: layerInfo[2]?.role ?? "리듬", instruction: layerInfo[2]?.instruction ?? "", notes: piano },
    { id: "arp", name: layerInfo[3]?.name ?? "Arp", role: layerInfo[3]?.role ?? "상단", instruction: layerInfo[3]?.instruction ?? "", notes: arp }
  ];
}

export function getAudibleProjectNotes(layers: ProjectLayer[], mutedLayerIds: ProjectLayerId[], soloLayerId?: ProjectLayerId) {
  const activeLayers = soloLayerId ? layers.filter((layer) => layer.id === soloLayerId) : layers.filter((layer) => !mutedLayerIds.includes(layer.id));
  return activeLayers.flatMap((layer) => layer.notes);
}
