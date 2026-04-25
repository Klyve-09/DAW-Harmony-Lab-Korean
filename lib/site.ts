export const siteConfig = {
  name: "DAW Harmony Lab",
  description: "피아노롤로 배우는 DAW 입문자용 실전 화성학 학습 앱",
  defaultUrl: "http://localhost:3000",
  locale: "ko_KR",
  contentUpdatedAt: "2026-04-24T00:00:00.000Z"
};

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteConfig.defaultUrl;

  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(siteConfig.defaultUrl);
  }
}
