export interface TimelineProject {
  slug: string
  title: string
  subtitle: string
  category: string
  year: string
  period: string
  award: string
  summaryLines: string[]
  overviewLines: string[]
  tags: string[]
  roles: Array<{ title: string; description: string }>
  metrics: Array<{ value: string; label: string; note: string }>
  pipeline: Array<{ label: string; description: string }>
  improvements: Array<{ before: string; after: string; evidence: string }>
  timeline: Array<{ date: string; title: string; description: string }>
}

export const timelineProjects: TimelineProject[] = [
  {
    slug: 'sanjae-oneshot',
    title: '산재원샷',
    subtitle: '산업재해 신청 준비를 돕는 AI 문서 자동화 서비스',
    category: 'AI PRODUCT · FULL-STACK',
    year: '2026',
    period: '2026.06.30 — 09.03',
    award: 'KDT 프로젝트 최우수상',
    summaryLines: [
      '산재 신청 정보 입력부터 증빙 OCR, AI 재해경위서 작성까지 한 흐름으로 통합했습니다.',
      '고령자·외국인을 고려한 8개 언어 UI와 재접속 가능한 신청 위저드를 구현했습니다.',
      '공공데이터 13종 182,183행을 검증·적재해 LLM 참고 문맥으로 연결했습니다.',
      '운영 E2E, 자동 배포, 관리자 앱과 공개 체험까지 완성해 최우수상을 수상했습니다.',
    ],
    overviewLines: [
      '산재 신청에 필요한 정보와 증빙을 정리하고 OCR로 문서를 판독했습니다.',
      '생성형 AI가 재해경위서 초안을 만들고 사용자가 사실을 확인하도록 설계했습니다.',
      '최종 입력값을 원본 서식 위에 합성해 제출 준비 PDF와 ZIP으로 연결했습니다.',
      '실패·재접속·중복 요청까지 운영 환경에서 검증하며 신청 흐름을 안정화했습니다.',
    ],
    tags: ['React', 'TypeScript', 'FastAPI', 'Supabase', 'OCR', 'LLM', 'AWS ECS'],
    roles: [
      { title: '서비스 구조와 데이터 흐름 설계', description: '팀의 서식·시나리오·AI 산출물을 신청 중심 데이터 모델과 API 구조로 구체화했습니다.' },
      { title: '프런트엔드·백엔드 통합 구현', description: 'React 사용자 웹과 FastAPI를 연결하고 인증, DB, Storage, OCR, AI, PDF 처리 경로를 구현했습니다.' },
      { title: '운영 장애 분석과 품질 검증', description: '합성 페르소나 E2E로 DB 누락, 외부 AI 실패, PDF 출력과 재접속 문제를 발견하고 복구했습니다.' },
      { title: '배포·관리·시연 환경 완성', description: 'GitHub Actions와 AWS ECS 배포, 관리자 앱, 비용 추적, 공개 체험과 본선 시연 환경을 연결했습니다.' },
    ],
    metrics: [
      { value: '182,183', label: 'DATA ROWS', note: '13종 공공데이터 원본 행을 적재하고 SHA-256으로 전수 대조' },
      { value: '8', label: 'UI LANGUAGES', note: '한국어·영어를 포함한 8개 언어 사용자 화면 지원' },
      { value: '112', label: 'BACKEND TESTS', note: '2026년 8월 9일 운영 통합 작업 기록 기준 통과' },
      { value: '22', label: 'FRONTEND QA', note: '같은 시점의 별도 프런트엔드 QA 검사 집합 통과' },
    ],
    pipeline: [
      { label: 'INPUT', description: '신청인·사업장·사고 정보' },
      { label: 'OCR', description: '증빙 판독과 필드 검증' },
      { label: 'AI REVIEW', description: '초안 생성과 사실 대조' },
      { label: 'PDF / ZIP', description: '서명 포함 제출 문서 생성' },
    ],
    improvements: [
      { before: '외부 AI 호출 실패 시 HTTP 500으로 신청 중단', after: '규칙 기반 대체 초안, 경고와 후속 검토로 흐름 유지', evidence: '합성 사용자 시나리오에서 ready·confirmed 상태 도달' },
      { before: '서버 로컬 폴더에 의존한 공공데이터 참조', after: 'DB 기반 후보 검색·분류 요약과 공공 API 문맥 연결', evidence: '조회 가능한 출처 0종 → 13종, 참조 경고 0건' },
      { before: '프로세스 메모리에 남아 재접속 시 흔들리는 진행 상태', after: 'DB 스냅샷·트랜잭션·행 잠금·멱등 처리로 복원 가능', evidence: '브라우저 종료 후 재로그인·STEP 4 이어하기 확인' },
      { before: '공용 관리자 CSS가 신청 화면의 가독성을 훼손', after: '선택자 범위를 격리하고 단계 라벨과 제목 크기 복원', evidence: '회귀 테스트 26건 통과 후 운영 배포' },
    ],
    timeline: [
      { date: '06.30', title: '문제 정의', description: '산재 신청의 서류·언어·접근성 문제에서 출발해 사용자 흐름을 구체화했습니다.' },
      { date: '07.22', title: '서비스 기반 구현', description: 'React·FastAPI·Supabase와 신청 중심 데이터 모델을 연결했습니다.' },
      { date: '08.09', title: '운영 E2E', description: '재접속과 외부 AI 실패를 포함한 전체 신청 흐름을 운영 환경에서 검증했습니다.' },
      { date: '08.12', title: '관리자 운영 확장', description: 'Tauri 관리자 앱, 권한, 활동 이력과 승인 알림을 구축했습니다.' },
      { date: '09.03', title: '공개 체험·데이터 배포', description: '공개 체험을 안정화하고 공공데이터 13종을 LLM 참고 문맥으로 배포했습니다.' },
      { date: '09.09', title: '최우수상 확인', description: '구현·검증·운영·시연을 연결한 팀 프로젝트의 성과를 확인했습니다.' },
    ],
  },
]
