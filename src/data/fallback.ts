import type { PortfolioContent } from '../types/content'

export const fallbackContent: PortfolioContent = {
  profile: {
    name: '김채준',
    role: 'AI Product Engineer',
    intro:
      '복잡한 업무 흐름을 사용자가 끝까지 완주할 수 있는 제품으로 만들고, 운영 환경의 근거로 결과를 증명합니다.',
    email: '',
    location: 'Seoul, Korea',
    availability: 'Available for opportunities',
    github: 'https://github.com/KimChaeJun',
    skills: ['React', 'TypeScript', 'FastAPI', 'AI Integration', 'Cloud Operations'],
  },
  projects: [
    {
      _id: 'sample-project-1',
      title: 'Commerce Experience',
      slug: 'commerce-experience',
      summary: '탐색부터 결제까지의 흐름을 다시 설계한 커머스 프로젝트',
      description:
        '사용자가 선택에 집중할 수 있도록 정보 구조를 단순화하고, 반복 가능한 UI 패턴으로 제품의 확장성을 높였습니다.',
      tags: ['React', 'TypeScript', 'UX'],
      role: 'Frontend / Product Design',
      year: '2026',
      featured: true,
    },
    {
      _id: 'sample-project-2',
      title: 'Team Dashboard',
      slug: 'team-dashboard',
      summary: '팀의 핵심 지표와 업무 흐름을 한 화면에 연결한 대시보드',
      description:
        '복잡한 데이터를 빠르게 이해할 수 있도록 정보의 위계를 정리하고 반응형 시각화 컴포넌트를 구축했습니다.',
      tags: ['React', 'Data Visualization', 'API'],
      role: 'Frontend',
      year: '2025',
      featured: false,
    },
    {
      _id: 'sample-project-3',
      title: 'Living Design System',
      slug: 'living-design-system',
      summary: '제품과 함께 성장하는 디자인 시스템',
      description:
        '디자인 토큰과 공통 컴포넌트를 정리해 일관성을 높이고 새로운 화면 제작 시간을 단축했습니다.',
      tags: ['Design System', 'Storybook', 'Accessibility'],
      role: 'Frontend / System Design',
      year: '2025',
      featured: false,
    },
  ],
  experiences: [
    {
      _id: 'sample-experience-1',
      company: 'Company Name',
      position: 'Frontend Developer',
      summary: '제품의 핵심 사용자 경험을 설계하고 React 기반 프론트엔드를 개발했습니다.',
      startDate: '2024-01-01',
      current: true,
    },
    {
      _id: 'sample-experience-2',
      company: 'Previous Company',
      position: 'Web Developer',
      summary: '웹 서비스 운영과 성능 개선, 공통 UI 컴포넌트 구축을 담당했습니다.',
      startDate: '2022-03-01',
      endDate: '2023-12-31',
      current: false,
    },
  ],
}
