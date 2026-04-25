# DAW Harmony Lab

피아노롤로 배우는 실전 화성학 MVP입니다. DAW 입문자가 악보보다 MIDI 노트와 코드 진행을 직접 찍고 들으며 학습하도록 만든 Next.js App Router 기반 웹앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

검증용 명령:

```bash
npm run verify
npm run typecheck
npm run lint
npm run test
npm run build
```

운영 모드 실행:

```bash
npm run build
npm run start
```

실제 배포 전에는 `.env.example`을 참고해 `NEXT_PUBLIC_SITE_URL`을 HTTPS 실제 도메인으로 설정하고 `npm run verify:release`를 통과시켜야 합니다. 자세한 절차는 `DEPLOYMENT.md`에 정리되어 있습니다.

## 주요 구조

```txt
app/
  page.tsx
  lessons/page.tsx
  lessons/[slug]/page.tsx
  generator/page.tsx
components/
  layout/
  piano-roll/
  audio/
  lesson/
  generator/
lib/
  theory/
  audio/synth.ts
  storage/progressStorage.ts
data/
  curriculum.ts
  quizzes.ts
  exercises.ts
types/
```

## 구현 내용

- 홈/대시보드, 15단계 레슨 목록, 레슨 상세, 코드 진행 생성기 페이지
- 정적 커리큘럼 데이터: 각 레슨마다 예제 1개, 실습 1개, 퀴즈 2개
- Ableton Live 느낌을 참고한 회색/검정 피아노롤 중심 UI
- 정적 피아노롤과 드래그 가능한 미니 피아노롤
- Tone.js 기반 단일 노트/코드/코드 진행 재생
- localStorage 기반 완료 레슨, 퀴즈 점수, 마지막 레슨, 최근 생성 진행 저장
- major/minor scale, chord, roman numeral progression 변환 유틸
- 기본 단위 테스트

## 수동 검증 항목

- 홈에서 1단계 레슨 이동
- 레슨 완료 후 진도율 증가 및 새로고침 유지
- 피아노롤에서 노트 추가, 드래그 이동, 선택 후 삭제
- Play/Stop 버튼으로 Tone.js 오디오 재생/정지
- 코드 진행 생성기에서 key, mood, genre, complexity 변경 후 결과 표시
- 모바일 폭에서 사이드바가 선택 메뉴로 전환되는지 확인

## MVP 제외

서버 API, 로그인, 결제, DB 연결, 실제 MIDI export, 오디오 파일 export, 커뮤니티, 관리자 페이지는 포함하지 않습니다.
