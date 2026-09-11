# 김채준 포트폴리오

GitHub 저장소의 `timeline.md`를 근거로 프로젝트를 선별한 React 포트폴리오입니다.

## 콘텐츠 원칙

- 소유한 저장소의 기본 브랜치 루트에 `timeline.md`가 있는 프로젝트만 노출합니다.
- 수치는 타임라인에서 검증된 값만 사용하며 서로 다른 테스트 집합은 합산하지 않습니다.
- 측정값이 없는 작업은 임의의 개선율 대신 전후 변화와 검증 근거를 설명합니다.
- 비공개 저장소의 코드나 민감한 경로는 공개하지 않고 포트폴리오용 서술만 반영합니다.

현재 반영된 저장소: `KimChaeJun/Sanjae-Oneshot`

## 로컬 실행

```bash
npm install
npm run dev
```

Sanity를 연결하지 않아도 기본 프로필과 프로젝트가 표시됩니다. 프로필과 경력 CMS를 사용할 경우 `.env.example`을 `.env.local`로 복사하고 Sanity 프로젝트 ID를 설정합니다.

## GitHub Pages

`main` 브랜치에 변경사항이 올라오면 `.github/workflows/deploy-pages.yml`이 사이트를 빌드하고 GitHub Pages에 배포합니다.

GitHub 저장소 Settings > Pages > Build and deployment에서 Source를 `GitHub Actions`로 설정합니다.
