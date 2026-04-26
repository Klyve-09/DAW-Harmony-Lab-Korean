"use client";

import { useState } from "react";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { PianoRoll } from "@/components/piano-roll/PianoRoll";
import { TransportControls } from "@/components/audio/TransportControls";

type PianoRollPlaybackPanelProps = {
  notes: PianoRollNote[];
  chords?: ChordSymbol[];
  beats?: number;
  title?: string;
  initialBpm?: number;
  fileName?: string;
  showDawGuide?: boolean;
  markers?: string[];
  onPlayStart?: () => void;
};

export function PianoRollPlaybackPanel(props: PianoRollPlaybackPanelProps) {
  return <PianoRollPlaybackState key={playbackKey(props.notes, props.chords)} {...props} />;
}

function PianoRollPlaybackState({
  notes,
  chords,
  beats = 4,
  title,
  initialBpm,
  fileName,
  showDawGuide,
  markers,
  onPlayStart
}: PianoRollPlaybackPanelProps) {
  const [playheadBeat, setPlayheadBeat] = useState<number>();

  return (
    <>
      <PianoRoll notes={notes} beats={beats} title={title} playheadBeat={playheadBeat} markers={markers} />
      <TransportControls
        notes={notes}
        chords={chords}
        initialBpm={initialBpm}
        fileName={fileName}
        showDawGuide={showDawGuide}
        onPlayStart={onPlayStart}
        onPlayheadChange={setPlayheadBeat}
      />
    </>
  );
}

function playbackKey(notes: PianoRollNote[], chords?: ChordSymbol[]) {
  if (notes.length > 0) {
    return notes.map((note) => `${note.id}:${note.midi}:${note.startBeat}:${note.duration}`).join("|");
  }

  return chords?.map((chord) => chord.name).join("|") ?? "empty";
}
