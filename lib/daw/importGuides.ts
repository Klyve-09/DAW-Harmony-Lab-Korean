export type DawImportGuide = {
  id: "ableton" | "fl-studio" | "logic-pro";
  name: string;
  sourceLabel: string;
  sourceUrl: string;
  steps: string[];
  check: string;
};

export const dawImportGuides: DawImportGuide[] = [
  {
    id: "ableton",
    name: "Ableton Live",
    sourceLabel: "Ableton MIDI files",
    sourceUrl: "https://help.ableton.com/hc/en-us/articles/209068169-Understanding-MIDI-files",
    steps: [
      "MIDI export로 .mid 파일을 저장합니다.",
      "Live Browser나 Explorer/Finder에서 MIDI 트랙으로 드래그합니다.",
      "소리가 안 나면 MIDI 트랙에 Instrument, VST, AU 중 하나를 먼저 올립니다."
    ],
    check: "Live는 SMF0 MIDI를 한 트랙으로 가져올 수 있으므로, 코드 루프는 한 악기 트랙에서 먼저 확인하세요."
  },
  {
    id: "fl-studio",
    name: "FL Studio",
    sourceLabel: "FL Studio MIDI Import",
    sourceUrl: "https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/automation_midiimport.htm",
    steps: [
      "MIDI export로 .mid 파일을 저장합니다. .midi 확장자는 .mid로 바꿉니다.",
      "Browser에서 Piano roll이나 Channel Rack으로 드래그하거나 Piano roll 메뉴에서 Import MIDI File을 선택합니다.",
      "Import MIDI Data 창이 뜨면 노트 트랙을 선택하고 악기 채널에 연결합니다."
    ],
    check: "MIDI는 오디오가 아니므로 FLEX나 원하는 악기 플러그인을 지정해야 들립니다."
  },
  {
    id: "logic-pro",
    name: "Logic Pro",
    sourceLabel: "Logic Pro Standard MIDI",
    sourceUrl: "https://support.apple.com/guide/logicpro/standard-midi-files-lgcpdf6a3851/mac",
    steps: [
      "MIDI export로 .mid 파일을 저장합니다.",
      "File > Import > MIDI File로 불러오거나 Finder에서 Tracks area로 드래그합니다.",
      "가져온 리전을 Software Instrument 트랙에 놓고 피아노, 패드, 베이스 같은 음원을 고릅니다."
    ],
    check: "Logic은 가져온 MIDI를 playhead나 드롭 위치에 배치하므로, 첫 마디에 놓고 BPM을 맞춘 뒤 반복 구간을 잡으세요."
  }
];
