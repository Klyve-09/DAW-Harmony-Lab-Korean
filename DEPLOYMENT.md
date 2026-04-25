# 배포 체크리스트

DAW Harmony Lab을 실제 서비스로 배포하기 위한 최소 운영 절차입니다.

## 필수 환경

- Node.js 22 이상 권장
- `npm ci`로 lockfile 기반 설치
- 배포 환경 변수:

```bash
NEXT_PUBLIC_SITE_URL=https://your-real-domain.com
```

`NEXT_PUBLIC_SITE_URL`은 canonical URL, Open Graph, robots/sitemap URL에 사용됩니다. 릴리즈 빌드는 이 값이 없거나 `http://`, `localhost`, `.example`이면 실패합니다.

## 로컬 운영 검증

```bash
npm ci
npm run verify
```

`verify`는 lint, typecheck, unit test, production build, production smoke test를 순서대로 실행합니다.

실제 배포 도메인까지 포함한 릴리즈 검증:

```bash
npm run verify:release
```

## 배포 플랫폼 설정

Vercel, Netlify, 자체 Node 호스팅 모두 아래 명령을 기준으로 맞추면 됩니다.

```bash
npm ci
npm run build:release
npm run start
```

정적 export가 아니라 Next.js 서버 런타임으로 배포합니다. `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, 보안 헤더는 Next 설정과 metadata route에서 생성됩니다.

## 릴리즈 전 수동 확인

- `/`, `/lessons`, `/generator`, 주요 레슨 상세 페이지 진입
- 모바일 폭에서 레슨 선택 메뉴와 피아노롤 가로 스크롤 확인
- Play/Stop 버튼으로 브라우저 오디오 재생 확인
- 코드 진행 생성 옵션 변경 후 결과 갱신 확인
- 레슨 완료, 퀴즈 점수, 최근 생성 기록이 새로고침 후 유지되는지 확인

## 보안 헤더 메모

Next.js 런타임과 현재 Tailwind/React 스타일 주입을 고려해 CSP에는 `script-src`와 `style-src`의 `unsafe-inline`이 남아 있습니다. 대신 `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, HSTS를 적용하고 production smoke test에서 주요 헤더를 검증합니다.
