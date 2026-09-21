# 김채준 포트폴리오

GitHub 저장소의 `timeline.md`를 근거로 프로젝트를 선별한 React 포트폴리오입니다.

## 콘텐츠 원칙

- 소유한 저장소의 기본 브랜치 루트에 `timeline.md`가 있는 프로젝트만 노출합니다.
- 수치는 타임라인에서 검증된 값만 사용하며 서로 다른 테스트 집합은 합산하지 않습니다.
- 측정값이 없는 작업은 임의의 개선율 대신 전후 변화와 검증 근거를 설명합니다.
- 비공개 저장소의 코드나 민감한 경로는 공개하지 않고 포트폴리오용 서술만 반영합니다.

현재 반영된 저장소: `KimChaeJun/Sanjae-Oneshot`

## 역할 태그

- 대표 직무는 `Full Stack Developer`입니다. `AI PM`은 선택 가능한 태그로 등록되어 있으며, 기본 화면에는 표시하지 않습니다.
- 코드에서 추가하려면 `src/data/fallback.ts`의 `profile.roleTags` 또는 `src/data/timelineProjects.ts`의 해당 프로젝트 `roleTags`를 `['AI PM']`으로 설정합니다. 빈 배열이면 대표 직무만 표시됩니다.
- Sanity를 연결한 경우 프로필·프로젝트 문서의 **추가 역할 태그**에서 `AI PM`을 선택한 뒤 발행합니다. 프로젝트의 주소용 이름(slug)은 `sanjae-oneshot`처럼 현재 노출되는 프로젝트와 일치해야 합니다. CMS에서 빈 배열을 발행하면 추가 태그가 제거됩니다.
- 새로운 선택지는 `src/data/roleTags.ts`의 `roleTagOptions`에 추가합니다. 웹과 Studio가 같은 선택지 목록을 사용합니다.
- 중복 태그는 한 번만 표시하며, `Full Stack Developer`가 있으면 `FE Developer`, `BE Developer`, `Infra Developer`는 생략합니다. 담당 업무 설명과 기술 스택은 유지합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

Sanity를 연결하지 않아도 기본 프로필과 프로젝트가 표시됩니다. 프로필과 경력 CMS를 사용할 경우 `.env.example`을 `.env.local`로 복사하고 Sanity 프로젝트 ID를 설정합니다.

## GitHub Pages

`main` 브랜치에 변경사항이 올라오면 `.github/workflows/deploy-pages.yml`이 사이트를 빌드하고 GitHub Pages에 배포합니다.

GitHub 저장소 Settings > Pages > Build and deployment에서 Source를 `GitHub Actions`로 설정합니다.
