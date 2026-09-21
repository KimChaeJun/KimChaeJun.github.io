export const developerRole = 'Full Stack Developer'

export interface TechnologyGroup {
  category: string
  description: string
  technologies: string[]
}

// Verified against Sanjae-Oneshot's manifests, infra documentation, and timeline.md.
export const technologyStack: TechnologyGroup[] = [
  {
    category: 'Frontend',
    description: '사용자 웹부터 설치형 관리자 앱까지',
    technologies: ['React', 'TypeScript', 'Vite', 'i18next', 'Tauri'],
  },
  {
    category: 'Backend',
    description: 'API와 데이터 흐름을 설계하고 구현해요',
    technologies: ['Python', 'FastAPI', 'Pydantic', 'SQLAlchemy'],
  },
  {
    category: 'Database & Auth',
    description: '데이터 저장, 인증, 파일 관리를 연결해요',
    technologies: ['PostgreSQL', 'Supabase', 'Supabase Auth', 'Supabase Storage'],
  },
  {
    category: 'AI & Documents',
    description: '증빙 판독에서 AI 초안과 PDF 생성까지',
    technologies: ['OpenAI API', 'OCR', 'ReportLab', 'pypdf'],
  },
  {
    category: 'Infrastructure',
    description: '클라우드 서비스와 운영 환경을 구성해요',
    technologies: ['AWS ECS', 'AWS Fargate', 'Amazon ECR', 'Amazon CloudWatch'],
  },
  {
    category: 'DevOps & Tools',
    description: '컨테이너, 자동 배포, 브라우저 자동화까지',
    technologies: ['Docker', 'Nginx', 'GitHub Actions', 'Playwright'],
  },
]
