import type { TimelineProject } from './timelineProjects'

// Approved public-facing implementation summary from the project timeline.
export const lyrikanaProject: TimelineProject = {
  slug: 'lyrikana',
  title: 'LyriKana',
  subtitle:
    '일본어 노래를 따라 부르는 사용자를 위한 YouTube Music 가사·발음 오버레이와 로컬 노래방 제작 도구',
  category: '음악 · 가사 동기화 · 데스크톱 도구',
  role: 'Full Stack Developer',
  roleTags: [],
  year: '2026',
  period: '',
  award: '',
  summaryLines: [
    '개인 프로젝트로 브라우저 확장 프로그램, 데스크톱 오버레이, 가사 API와 데이터 처리를 직접 구현했습니다.',
    '가사 준비와 재생을 분리하고, 곡 전환 시 오래된 응답을 차단하는 동기화 흐름을 구성했습니다.',
    '일본어 원문·표시용 읽기·실제 발음을 분리하고, 사용자가 제공한 음원으로 녹음본별 가창 타임라인을 만드는 구조로 확장했습니다.',
  ],
  overviewLines: [
    'YouTube Music의 곡 정보와 재생 위치를 읽어 현재 가사, 일본어 읽기, 한글 발음과 로마자를 표시하는 도구입니다.',
    '브라우저 확장 프로그램은 재생 상태를 수집하고, 백엔드는 가사 조회와 저장을, Electron은 항상 위에 표시되는 창과 재생 제어를 담당합니다.',
    '형태소 분석과 가사 전용 읽기 규칙을 결합하고, 표시할 읽기와 발음할 읽기를 분리해 원문을 보존합니다.',
    '사용자가 제공한 음원과 원문 가사는 별도 분석 워커에서 보컬 분리와 일본어 음소 정렬을 거쳐 녹음본별 타임라인으로 저장됩니다.',
    '음원 업로드와 결과 검수는 API 중심으로 구현되어 있으며, 확장 프로그램의 업로드·검수 화면은 후속 과제로 남아 있습니다.',
  ],
  tags: ['TypeScript', 'Electron', 'Python', 'FastAPI', 'SQLite', 'SudachiPy', 'PyTorch'],
  roles: [
    {
      title: '브라우저 확장 프로그램과 재생 동기화',
      description:
        '곡 정보와 곡별 재생 위치를 감지하고, 가사 로딩·취소·점진적 발음 변환과 곡 전환 보호 로직을 구현했습니다.',
    },
    {
      title: '데스크톱 오버레이와 로컬 실행 연동',
      description:
        '항상 위에 표시되는 가사 창, 클릭 통과, 재생 제어와 읽기 캐시를 구현하고 Windows Native Messaging으로 로컬 서비스 실행을 연결했습니다.',
    },
    {
      title: '가사 API와 녹음본 중심 데이터 모델',
      description:
        '가사 공급자 조회·후보 선택·캐시를 백엔드로 모으고, 작품과 라이브·커버 등 개별 녹음본을 분리해 타이밍과 교정을 저장하도록 설계했습니다.',
    },
    {
      title: '일본어 읽기와 가창 분석',
      description:
        '형태소 분석, 읽기 규칙, 발음 변환을 연결하고, 복수 읽기 후보를 음향 점수로 비교하는 일본어 음소 CTC 정렬 경로를 구현했습니다.',
    },
    {
      title: '분석 작업 복구와 교정 데이터 도구',
      description:
        '분석 작업의 선점·생존 신호·재시도·검수 상태를 영속화하고, 교정 이력을 검증·중복 제거·분할해 JSONL로 내보내는 도구를 구현했습니다.',
    },
    {
      title: '개발 환경과 회귀 검증',
      description:
        '설치·실행·테스트 스크립트를 정리하고, API·DB·곡 전환·발음 규칙을 검증하는 테스트와 음소 경계 평가 도구를 작성했습니다.',
    },
  ],
  technologyStack: [
    {
      category: 'Browser Extension',
      description: 'Manifest V3 확장 프로그램의 재생 상태 수집, 메시지 중계와 설정 화면 구현',
      technologies: ['TypeScript', 'Chrome Extensions Manifest V3', 'HTML', 'CSS', 'Vite'],
    },
    {
      category: 'Desktop & Native Integration',
      description: '데스크톱 가사 표시, 로컬 캐시와 Windows 자동 실행 연동',
      technologies: ['Electron', 'JavaScript', 'Node.js', 'C#', 'Windows Native Messaging'],
    },
    {
      category: 'Backend & Storage',
      description: '가사 조회 API, 작품·녹음본·분석 작업 저장과 외부 가사 공급자 요청',
      technologies: ['Python', 'FastAPI', 'Pydantic', 'SQLAlchemy', 'SQLite', 'HTTPX', 'Uvicorn'],
    },
    {
      category: 'Japanese Reading',
      description: '형태소 분석과 규칙 기반 보정으로 표시용 읽기와 발음용 읽기 생성',
      technologies: ['kuromoji', 'SudachiPy'],
    },
    {
      category: 'Optional Audio Analysis',
      description: '별도 분석 환경에서 보컬을 분리하고 사전 학습 모델로 일본어 음소 타이밍 정렬',
      technologies: ['audio-separator', 'FFmpeg', 'PyTorch', 'Hugging Face Transformers', 'NumPy'],
    },
    {
      category: 'Data & Development Tools',
      description: '교정 이력의 JSONL 변환, 개발 프로세스 실행과 회귀 테스트',
      technologies: ['TypeScript', 'Node.js', 'PowerShell', 'pytest', 'Vitest', 'Git'],
    },
  ],
  metrics: [],
  pipeline: [
    {
      label: '곡 식별',
      description: '확장 프로그램이 곡 정보, 공급자 녹음 ID와 곡별 재생 위치를 수집합니다.',
    },
    {
      label: '가사 준비',
      description:
        '백엔드가 녹음본과 저장된 가사를 확인하고, 필요한 경우 공급자를 조회하는 동안 재생을 유지합니다.',
    },
    {
      label: '읽기와 표시',
      description:
        '캐시를 먼저 적용하고 부족한 줄의 읽기·발음을 점진적으로 생성해 오버레이에 전달합니다.',
    },
    {
      label: '선택적 노래방 제작',
      description:
        '사용자가 별도로 제공한 음원과 가사를 분석 워커가 처리해 가창 읽기와 시간 경계를 저장합니다.',
    },
    {
      label: '검수와 재사용',
      description:
        '신뢰도가 낮은 분석은 검수 상태로 남기고, 사용자 교정을 보존하며 녹음본별 결과를 재사용합니다.',
    },
  ],
  improvements: [
    {
      before: '가사 처리가 끝나지 않은 상태를 재생 대기 조건으로 사용했습니다.',
      after:
        '첫 가사 요청과 캐시 미적중에서도 재생을 유지하고 가사를 백그라운드에서 준비하도록 변경했습니다.',
      evidence:
        '변경 전후 재생 대기 조건을 대조하고, 캐시 미적중·미완료·실패 상태에 대한 회귀 테스트를 확인했습니다.',
    },
    {
      before:
        '제목과 가수 중심의 식별만으로는 같은 작품의 라이브·커버 녹음본을 구분하기 어려웠습니다.',
      after:
        '작품과 녹음본을 분리하고 공급자 녹음 ID를 우선 사용해 녹음본별 타이밍과 교정을 보존하도록 했습니다.',
      evidence:
        '동일 작품의 다른 영상 분리와 같은 영상의 제목 변경에 대한 API 회귀 테스트를 확인했습니다.',
    },
    {
      before:
        '표시용 읽기만으로는 조사나 숫자처럼 표기와 실제 발음이 다른 경우를 표현하기 어려웠습니다.',
      after:
        '표시용·발음용 읽기를 분리하고, 선택적 음향 분석에서 복수 후보를 비교하도록 구성했습니다.',
      evidence:
        '조사 발음, 장식 문자 처리와 복수 읽기 후보 생성 테스트를 확인했습니다. 음향 분석의 가창 품질은 별도 평가 대상입니다.',
    },
  ],
  timeline: [
    {
      date: '2026-03-13',
      title: '초기 가사·발음 MVP',
      description: '일본어 분석 사전과 발음 변환을 포함한 확장 프로그램 MVP 변경을 기록했습니다.',
    },
    {
      date: '2026-03-16',
      title: '점진적 가사 처리',
      description:
        '발음 변환을 점진적으로 진행하고 비동기 응답이 섞이는 문제를 방어하는 로직을 추가했습니다.',
    },
    {
      date: '2026-05-16',
      title: 'Electron·교정 데이터 확장',
      description:
        '데스크톱 오버레이, 로컬 읽기 캐시, Sudachi 연동과 교정 데이터 변환 도구를 추가했습니다.',
    },
    {
      date: '2026-06-18',
      title: '가사 백엔드 도입',
      description: 'FastAPI와 데이터베이스를 이용한 가사 조회·저장 경로를 추가했습니다.',
    },
    {
      date: '2026-07-13',
      title: 'API 중심 가사 처리 정리',
      description: '백엔드 작업 처리, 상태 조회, DB 이전과 개발·테스트 실행 흐름을 정비했습니다.',
    },
    {
      date: '2026-07-15',
      title: '재생 전환·자동 실행 안정화',
      description:
        '곡 전환 보호, 서비스 워커 중계, Native Messaging 실행과 발음 회귀 테스트를 보강했습니다.',
    },
    {
      date: '2026-07-21',
      title: '녹음본별 노래방 제작',
      description:
        '음원 수집 API, 영속 분석 워커, 일본어 음소 CTC 정렬과 평가 도구를 추가했습니다.',
    },
  ],
}
