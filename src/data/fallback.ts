import type { PortfolioContent } from "../types/content";
import { developerRole, technologyStack } from "./engineering";
import { timelineProjects } from "./timelineProjects";
export const fallbackContent: PortfolioContent = {
  profile: {
    name: "김채준",
    role: developerRole,
    roleTags: [],
    intro:
      "AI와 코드로 일상의 복잡한 과정을 조금 더 쉽게 만들어요. 아이디어를 직접 구현하고, 실제로 잘 쓰이는 순간까지 함께합니다.",
    email: "",
    location: "Seoul, Korea",
    availability: "Available for opportunities",
    github: "https://github.com/KimChaeJun",
    skills: technologyStack.flatMap((group) => group.technologies),
  },
  projects: timelineProjects,
  experiences: [],
  copy: {
    heroLead: "복잡한 과정을 단순하게,",
    heroMiddle: "아이디어를",
    heroAccent: "작동하는 서비스로.",
    aboutLead: "끝까지 만들고,",
    aboutMiddle: "더 나은 경험으로 다듬는",
    aboutAccent: "풀스택 개발자 김채준",
    projectHeading: "만들고 탐구하며 쌓아온 프로젝트",
    contactLead: "다음 아이디어는,",
    contactAccent: "함께 만들어 볼까요?",
    contactDescription: "좋은 아이디어도, 작은 질문도 반갑습니다.",
    contactPageLead: "좋은 아이디어는",
    contactPageAccent: "대화에서 시작되니까요.",
    contactPageDescription:
      "함께 만들고 싶은 서비스, 프로젝트에 대한 궁금한 점이 있다면 편하게 이야기해 주세요.",
    footer: "Ideas → Code → Better experiences",
  },
};

Object.assign(fallbackContent.copy, {
  pillar0Title: "문제에서 출발",
  pillar0English: "Start with the problem",
  pillar0Text:
    "산재 신청의 복잡한 절차부터 노래를 따라 부를 때의 불편함까지. 일상에서 발견한 문제를 구현 가능한 흐름으로 정리합니다.",
  pillar0Caption: "문제 정의 → 사용자 흐름",
  pillar1Title: "경계를 잇는 구현",
  pillar1English: "Connect the whole product",
  pillar1Text:
    "화면과 API, 데이터와 AI, 배포 환경을 연결합니다. 한 기능을 넘어 사용자가 경험하는 서비스 전체를 생각합니다.",
  pillar1Caption: "Frontend → Backend → Infra",
  pillar2Title: "실패까지 설계",
  pillar2English: "Build for the unexpected",
  pillar2Text:
    "외부 AI 호출 실패, 재접속, 늦게 도착한 응답처럼 정상 경로 밖의 상황에서도 사용자의 작업이 이어지도록 만듭니다.",
  pillar2Caption: "복구 · 멱등 처리 · 상태 보존",
  pillar3Title: "근거로 확인",
  pillar3English: "Verify, then improve",
  pillar3Text:
    "기능 구현 후에는 테스트와 E2E로 흐름을 확인합니다. 개선 전후와 검증 근거를 남겨 다음 작업으로 이어갑니다.",
  pillar3Caption: "구현 → 검증 → 개선 → 기록",
});
