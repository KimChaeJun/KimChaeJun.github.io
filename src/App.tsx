import { useEffect, useState, type ReactNode } from 'react'
import { fallbackContent } from './data/fallback'
import { timelineProjects, type TimelineProject } from './data/timelineProjects'
import { getPortfolioContent } from './lib/sanity'
import type { PortfolioContent, Profile } from './types/content'

type IconName =
  'arrow' | 'diagonal' | 'github' | 'spark' | 'code' | 'layers' | 'check' | 'back' | 'mail'
function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
    diagonal: <path d="M6 18 18 6M6 6h12v12" />,
    github: (
      <path
        d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.7c3.3-.4 6.8-1.6 6.8-7.3A5.7 5.7 0 0 0 19.3 4 5.3 5.3 0 0 0 19.2.1S18 0 15 1.6a14 14 0 0 0-6 0C6 0 4.8.1 4.8.1A5.3 5.3 0 0 0 4.7 4 5.7 5.7 0 0 0 3.2 8c0 5.7 3.5 6.9 6.8 7.3A3.5 3.5 0 0 0 9 18v4"
        transform="translate(0 1) scale(1 .9)"
      />
    ),
    spark: <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" />,
    code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />,
    layers: <path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5" />,
    check: <path d="m5 12 4 4L19 6" />,
    back: <path d="M20 12H4m7-7-7 7 7 7" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  }
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Flower({ className = '' }: { className?: string }) {
  return (
    <svg className={`flower ${className}`} viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <path
        d="M70 18C91-6 110 8 106 34c31-5 42 19 19 36 23 18 12 41-19 36 4 29-20 41-36 16-18 25-41 13-36-16-30 5-42-19-18-36C-8 52 4 29 34 34 29 6 53-6 70 18Z"
        fill="currentColor"
      />
      <path
        d="M51 57v9m37-9v9M49 83c12 15 30 15 42-1"
        stroke="#292631"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/')
  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash.slice(1) || '/')
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const section = document.getElementById(route)
      if (section) section.scrollIntoView({ behavior: 'instant', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [route])
  return route
}

function SiteHeader({ profile, detail = false }: { profile: Profile; detail?: boolean }) {
  const [activeSection, setActiveSection] = useState('')
  useEffect(() => {
    if (detail) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -55% 0px' },
    )
    document.querySelectorAll('main > section[id]').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [detail])
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#/" aria-label={`${profile.name} 포트폴리오 홈`}>
          <span className="wordmark-icon">
            c<span>j</span>
            <i />
          </span>
          <span>
            {profile.name}
            <span className="wordmark-dot">.</span>
          </span>
        </a>
        <nav className="nav" aria-label="주요 메뉴">
          <a
            href="#work"
            aria-current={detail || activeSection === 'work' ? 'location' : undefined}
          >
            프로젝트
          </a>
          <a
            href="#about"
            aria-current={!detail && activeSection === 'about' ? 'location' : undefined}
          >
            저는요
          </a>
          <a className="nav-contact" href="#contact">
            이야기 나눠요 <Icon name="diagonal" />
          </a>
        </nav>
      </div>
    </header>
  )
}

function DeveloperArtwork({ profile }: { profile: Profile }) {
  return (
    <div className="developer-art" aria-hidden="true">
      <div className="art-orbit" />
      <span className="art-caption">a little code, a lot of care.</span>
      <div className="code-window">
        <div className="window-bar">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <span>hello.tsx</span>
          <Icon name="code" />
        </div>
        <div className="code-body">
          <div>
            <span className="code-purple">const</span> developer = {'{'}
          </div>
          <div className="code-indent">
            name: <span className="code-green">'{profile.name}'</span>,
          </div>
          <div className="code-indent">
            focus: <span className="code-green">'AI × Product'</span>,
          </div>
          <div className="code-indent">
            mindset: <span className="code-green">'끝까지 만들기'</span>,
          </div>
          <div>{'}'};</div>
          <div className="code-comment">// 아이디어를 일상으로.</div>
        </div>
        <div className="window-footer">
          <span className="status-dot" /> always building<span>↵</span>
        </div>
      </div>
      <Flower className="hero-flower" />
      <span className="floating-label label-build">
        <Icon name="layers" /> 작동하는 아이디어
      </span>
      <span className="floating-label label-ship">
        <span className="tiny-check">
          <Icon name="check" />
        </span>{' '}
        작은 디테일까지.
      </span>
      <svg className="art-scribble" viewBox="0 0 100 70">
        <path
          d="M9 14C45 0 75 12 66 32S22 62 31 36s48-15 57 18m-14-3 16 6 2-17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function ProjectArtwork({ project }: { project: TimelineProject }) {
  return (
    <div
      className="project-art"
      role="img"
      aria-label={`${project.title}: 정보 입력, 증빙 확인, AI 초안, 문서 완성으로 이어지는 서비스 흐름`}
    >
      <span className="project-art-label">
        <span /> 조금 더 쉬운 산재 신청
      </span>
      <div className="document-preview" aria-hidden="true">
        <div className="document-brand">
          <span className="document-logo">
            <Icon name="layers" />
          </span>
          {project.title}
          <span className="document-menu">•••</span>
        </div>
        <div className="document-progress">
          <i />
          <i />
          <i />
          <i />
        </div>
        <p className="document-kicker">복잡한 서류는 잠시 내려놓고</p>
        <strong>당신의 이야기를 들려주세요.</strong>
        <div className="document-field">
          <span>01</span>
          <div>
            <b>기본 정보 입력</b>
            <small>한 번에 하나씩, 차근차근</small>
          </div>
          <Icon name="check" />
        </div>
        <div className="document-field">
          <span>02</span>
          <div>
            <b>증빙 서류 확인</b>
            <small>OCR로 필요한 정보를 쏙</small>
          </div>
          <Icon name="check" />
        </div>
        <div className="document-field document-field--active">
          <span>03</span>
          <div>
            <b>AI와 함께 초안 작성</b>
            <small>내가 확인하고 완성하는 문서</small>
          </div>
          <Icon name="spark" />
        </div>
        <div className="document-next">
          신청 준비, 한 걸음 더 <Icon name="arrow" />
        </div>
      </div>
      <span className="art-award">
        <span aria-hidden="true">✳</span> {project.award}
      </span>
      <span className="art-pdf" aria-hidden="true">
        <Icon name="check" /> PDF ready!
      </span>
      <span className="project-art-footnote">INPUT → OCR → AI → PDF</span>
    </div>
  )
}

const metricLabels: Record<string, string> = {
  'DATA ROWS': '검증한 데이터',
  'UI LANGUAGES': '지원 언어',
  'BACKEND TESTS': '백엔드 테스트',
  'FRONTEND QA': '프런트엔드 QA',
}

function Home({ content }: { content: PortfolioContent }) {
  const { profile } = content
  const github = profile.github || fallbackContent.profile.github!
  return (
    <>
      <SiteHeader profile={profile} />
      <main className="home-main" id="main-content" tabIndex={-1}>
        <section className="hero page-width" id="hello" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="intro-pill">
              <span className="status-dot" /> {profile.role}
            </span>
            <p className="hero-greeting">
              안녕하세요, {profile.name}입니다{' '}
              <span className="wave" aria-hidden="true">
                ✳
              </span>
            </p>
            <h1 id="hero-title">
              복잡한 문제도,
              <br />
              <span className="highlight">가볍게</span> 풀어내요.
            </h1>
            <p className="hero-description">{profile.intro}</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#work">
                만든 것들 둘러보기 <Icon name="arrow" />
              </a>
              <a className="text-link" href={github} target="_blank" rel="noreferrer">
                <Icon name="github" /> GitHub <Icon name="diagonal" />
              </a>
            </div>
          </div>
          <DeveloperArtwork profile={profile} />
          <div className="hero-bottom">
            <span>
              {profile.location} <span className="separator">/</span> 아이디어부터 서비스까지
            </span>
            <a href="#work">
              조금 더 내려가 볼까요 <span>↓</span>
            </a>
          </div>
        </section>
        <section className="work-section page-width" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SELECTED WORK</p>
              <h2 id="work-title">
                생각을 현실로 만든 것들<span className="accent-dot">.</span>
              </h2>
            </div>
            <span className="section-count">
              {String(timelineProjects.length).padStart(2, '0')} PROJECT
              {timelineProjects.length > 1 ? 'S' : ''}
            </span>
          </div>
          <div className="project-list">
            {timelineProjects.map((project, index) => (
              <article className="project-card" key={project.slug}>
                <div className="project-main">
                  <a
                    className="project-art-link"
                    href={`#/projects/${project.slug}`}
                    aria-label={`${project.title} 프로젝트 자세히 보기`}
                  >
                    <ProjectArtwork project={project} />
                  </a>
                  <div className="project-copy">
                    <div className="project-meta">
                      <span>0{index + 1} / AI · FULL-STACK</span>
                      <span>{project.year}</span>
                    </div>
                    <h3>
                      <a href={`#/projects/${project.slug}`}>
                        {project.title}
                        <Icon name="diagonal" />
                      </a>
                    </h3>
                    <p className="project-subtitle">{project.subtitle}</p>
                    <p className="project-description">
                      정보 입력부터 문서 완성까지, 복잡했던 산재 신청을 하나의 흐름으로
                      연결했습니다.
                    </p>
                    <div className="tag-list">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <a className="project-link" href={`#/projects/${project.slug}`}>
                      어떻게 만들었냐면요{' '}
                      <span>
                        <Icon name="arrow" />
                      </span>
                    </a>
                  </div>
                </div>
                <div className="project-stats">
                  {project.metrics.map((metric) => (
                    <div key={metric.label}>
                      <strong>
                        {metric.value}
                        <span>
                          {metric.label === 'UI LANGUAGES'
                            ? '개'
                            : metric.label === 'DATA ROWS'
                              ? '행'
                              : '건'}
                        </span>
                      </strong>
                      <span>{metricLabels[metric.label] || metric.label}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="work-note">
            <Icon name="check" /> 직접 만들고, 운영하며 확인한 기록을 담았습니다.
          </p>
        </section>
        <section className="about-section page-width" id="about" aria-labelledby="about-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE ABOUT ME</p>
              <h2 id="about-title">
                만드는 과정도 중요하니까<span className="accent-dot">.</span>
              </h2>
            </div>
            <p className="section-aside">
              잘 돌아가는 것, 그다음은
              <br />
              누구나 편하게 쓸 수 있는 것.
            </p>
          </div>
          <div className="principles-grid">
            {[
              {
                icon: 'layers' as const,
                title: '먼저, 문제를 차근차근',
                description:
                  '흩어진 요구사항을 정리하고, 데이터와 사용자 흐름을 하나의 구조로 연결해요.',
                note: 'Understand the why',
                color: 'lilac',
              },
              {
                icon: 'code' as const,
                title: '아이디어는 직접 끝까지',
                description:
                  '화면부터 API, AI, 배포까지. 조각들을 연결해 실제로 쓸 수 있는 서비스를 만들어요.',
                note: 'Make it work',
                color: 'green',
              },
              {
                icon: 'spark' as const,
                title: '작은 불편도 그냥 넘기지 않기',
                description:
                  '다시 접속했을 때, 예상과 다르게 작동할 때. 직접 확인하고 더 나은 흐름을 찾아요.',
                note: 'Care for the details',
                color: 'peach',
              },
            ].map((item, index) => (
              <article className={`principle principle--${item.color}`} key={item.title}>
                <div className="principle-top">
                  <span className="principle-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span>0{index + 1}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="principle-note">{item.note}</span>
              </article>
            ))}
          </div>
          <div className="toolbox">
            <span>
              손에 익은 도구들 <Icon name="code" />
            </span>
            <div>
              {profile.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </section>
        <section
          className="contact-section page-width"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-card">
            <div>
              <p className="eyebrow">LET’S BUILD SOMETHING</p>
              <h2 id="contact-title">
                좋은 아이디어는
                <br />
                대화에서 시작되니까요.
              </h2>
              <p>함께 만들고 싶은 것이 있다면, 반갑게 이야기 나눠요.</p>
              <a
                className="button button-lilac"
                href={profile.email ? `mailto:${profile.email}` : github}
                target={profile.email ? undefined : '_blank'}
                rel={profile.email ? undefined : 'noreferrer'}
              >
                {profile.email ? '메일로 이야기 나누기' : 'GitHub에서 만나요'}
                <Icon name={profile.email ? 'mail' : 'diagonal'} />
              </a>
            </div>
            <div className="contact-decoration" aria-hidden="true">
              <Flower />
              <span>say hello!</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter profile={profile} />
    </>
  )
}

function ProjectDetail({ project, profile }: { project: TimelineProject; profile: Profile }) {
  return (
    <>
      <SiteHeader profile={profile} detail />
      <main className="detail-main page-width" id="main-content" tabIndex={-1}>
        <section className="detail-hero">
          <a className="back-link" href="#work">
            <Icon name="back" /> 프로젝트 목록
          </a>
          <div className="detail-hero-meta">
            <span className="intro-pill">{project.category}</span>
            <span>{project.period}</span>
          </div>
          <h1>
            {project.title}
            <span className="accent-dot">.</span>
          </h1>
          <p>{project.subtitle}</p>
          <span className="award-chip">
            <span aria-hidden="true">✳</span> {project.award}
          </span>
        </section>
        <section className="detail-overview detail-section" aria-labelledby="overview-title">
          <div>
            <p className="eyebrow">01 / THE IDEA</p>
            <h2 id="overview-title">
              복잡한 산재 신청,
              <br />
              조금 더 쉬워질 수 없을까?
            </h2>
            <div className="overview-lines">
              {project.overviewLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="tag-list">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <ProjectArtwork project={project} />
        </section>
        <section className="detail-section" aria-labelledby="role-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / MY PART</p>
              <h2 id="role-title">제가 연결한 조각들이에요.</h2>
            </div>
          </div>
          <ol className="role-list">
            {project.roles.map((role, index) => (
              <li key={role.title}>
                <span className="role-number">0{index + 1}</span>
                <div>
                  <h3>{role.title}</h3>
                  <p>{role.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="detail-section evidence-section" aria-labelledby="evidence-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / IN NUMBERS</p>
              <h2 id="evidence-title">직접 확인한 결과.</h2>
            </div>
          </div>
          <div className="metric-grid">
            {project.metrics.map((metric) => (
              <figure className="metric-card" key={metric.label}>
                <figcaption>{metricLabels[metric.label] || metric.label}</figcaption>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </figure>
            ))}
          </div>
          <p className="evidence-note">
            백엔드 테스트와 프런트엔드 QA는 서로 다른 검사 집합이며, 각각의 수치입니다.
          </p>
        </section>
        <section className="detail-section" aria-labelledby="pipeline-title">
          <p className="eyebrow">04 / HOW IT WORKS</p>
          <h2 id="pipeline-title">이야기가 한 장의 문서가 되기까지.</h2>
          <div className="pipeline">
            {project.pipeline.map((step, index) => (
              <div className="pipeline-step" key={step.label}>
                <span>0{index + 1}</span>
                <strong>{step.label}</strong>
                <p>{step.description}</p>
                {index < project.pipeline.length - 1 && <Icon name="arrow" />}
              </div>
            ))}
          </div>
        </section>
        <section className="detail-section" aria-labelledby="evolution-title">
          <p className="eyebrow">05 / MAKING IT BETTER</p>
          <h2 id="evolution-title">막히는 순간에도, 계속 이어지도록.</h2>
          <div className="evolution-list">
            {project.improvements.map((item) => (
              <article key={item.after}>
                <div className="before">
                  <span>이전에는</span>
                  <p>{item.before}</p>
                </div>
                <Icon name="arrow" />
                <div className="after">
                  <span>이렇게 바꿨어요</span>
                  <p>{item.after}</p>
                  <small>
                    <Icon name="check" />
                    {item.evidence}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="detail-section timeline-section" aria-labelledby="timeline-title">
          <div>
            <p className="eyebrow">06 / THE JOURNEY</p>
            <h2 id="timeline-title">
              첫 아이디어부터
              <br />
              최우수상까지.
            </h2>
            <p className="timeline-intro">만들고, 확인하고, 다시 다듬은 기록.</p>
          </div>
          <ol className="build-timeline">
            {project.timeline.map((item) => (
              <li key={item.date}>
                <time>{item.date}</time>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="detail-closing">
          <Flower />
          <p>작동하는 서비스를 만들고, 더 나은 경험으로 다듬어요.</p>
          <a className="button button-dark" href="#work">
            <Icon name="back" /> 프로젝트 목록으로
          </a>
          <small>프로젝트 기록: 저장소의 timeline.md 기준</small>
        </section>
      </main>
      <SiteFooter profile={profile} />
    </>
  )
}

function SiteFooter({ profile }: { profile: Profile }) {
  return (
    <footer className="site-footer page-width">
      <span>
        © 2026 {profile.name}
        <span className="footer-note"> · 조금씩, 더 좋은 방향으로.</span>
      </span>
      <a href="#/">
        처음으로 <span>↑</span>
      </a>
    </footer>
  )
}

function App() {
  const [content, setContent] = useState<PortfolioContent>(fallbackContent)
  const route = useRoute()
  useEffect(() => {
    let active = true
    getPortfolioContent()
      .then((nextContent) => {
        if (active) setContent(nextContent)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])
  const projectSlug = route.match(/^\/projects\/([^/]+)$/)?.[1]
  const project = timelineProjects.find((item) => item.slug === projectSlug)
  useEffect(() => {
    document.title = project
      ? `${project.title} | ${content.profile.name} 포트폴리오`
      : `${content.profile.name} | ${content.profile.role}`
  }, [project, content.profile.name, content.profile.role])
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          const main = document.getElementById('main-content')
          main?.focus({ preventScroll: true })
          main?.scrollIntoView({ behavior: 'instant' })
        }}
      >
        본문으로 바로 가기
      </a>
      {project ? (
        <ProjectDetail project={project} profile={content.profile} />
      ) : (
        <Home content={content} />
      )}
    </>
  )
}

export default App
