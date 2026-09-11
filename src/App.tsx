import { useEffect, useState, type CSSProperties } from 'react'
import { fallbackContent } from './data/fallback'
import { timelineProjects, type TimelineProject } from './data/timelineProjects'
import { getPortfolioContent } from './lib/sanity'
import type { PortfolioContent } from './types/content'

function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/')

  useEffect(() => {
    const updateRoute = () => {
      setRoute(window.location.hash.slice(1) || '/')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  return route
}

function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={`topbar ${compact ? 'topbar--compact' : ''}`}>
      <a className="wordmark" href="#/" aria-label="포트폴리오 홈으로 이동">
        KCJ<span>®</span>
      </a>
      <nav className="nav" aria-label="주요 메뉴">
        <a href="#/">Index</a>
        <a href="#/projects/sanjae-oneshot">Project</a>
        <a href="https://github.com/KimChaeJun" target="_blank" rel="noreferrer">GitHub ↗</a>
      </nav>
    </header>
  )
}

function MetricArtwork({ project }: { project: TimelineProject }) {
  return (
    <figure className="metric-artwork" aria-label="산재원샷 핵심 성과 시각화">
      <div className="metric-artwork__grid" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="metric-artwork__number">182,183</div>
      <div className="metric-artwork__caption">
        <span>VERIFIED DATA ROWS</span><span>{project.year}</span>
      </div>
      <div className="metric-artwork__bars" aria-hidden="true">
        {[46, 67, 55, 82, 64, 91, 74, 100].map((height, index) => (
          <span
            key={height}
            style={{ '--bar-height': `${height}%`, '--delay': `${index * 70}ms` } as CSSProperties}
          />
        ))}
      </div>
    </figure>
  )
}

function Home({ content }: { content: PortfolioContent }) {
  const { profile } = content

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-kicker">
            <span>PORTFOLIO / 2026</span><span>AI · PRODUCT · ENGINEERING</span>
          </div>
          <h1 id="hero-title"><span>Build the flow.</span><em>Prove the value.</em></h1>
          <div className="hero-footer">
            <div>
              <p>{profile.intro}</p>
              <span className="hero-signature">{profile.name} · {profile.role}</span>
            </div>
            <a className="round-link" href="#work" aria-label="프로젝트 보기"><span>View</span><span>work ↓</span></a>
          </div>
        </section>

        <section className="projects section" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <p className="eyebrow">Timeline verified</p>
            <div>
              <h2 id="work-title">말보다 근거가 남은 프로젝트</h2>
              <p className="section-note">GitHub 기본 브랜치에 <code>timeline.md</code>가 존재하는 프로젝트만 표시합니다.</p>
            </div>
          </div>

          <div className="project-list">
            {timelineProjects.map((project, index) => (
              <article className="project-card" key={project.slug}>
                <div className="project-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="project-copy">
                  <div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div>
                  <div className="project-title-row"><h3>{project.title}</h3><span className="award-chip">{project.award}</span></div>
                  <div className="project-summary-lines">
                    {project.summaryLines.map((line) => <p key={line}>{line}</p>)}
                  </div>
                  <div className="tag-list" aria-label="사용 기술">
                    {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <a className="project-cta" href={`#/projects/${project.slug}`}>프로젝트 상세 보기 <span>↗</span></a>
                </div>
                <MetricArtwork project={project} />
              </article>
            ))}
          </div>
        </section>

        <section className="principles section" aria-labelledby="principles-title">
          <p className="eyebrow">Working principles</p>
          <h2 id="principles-title">구현에서 멈추지 않고<br />운영에서 확인합니다.</h2>
          <div className="principle-grid">
            <article><span>01</span><h3>구조화</h3><p>흩어진 요구사항을 데이터 모델과 사용자 흐름으로 연결합니다.</p></article>
            <article><span>02</span><h3>통합</h3><p>화면, API, AI, 문서 처리와 배포를 하나의 제품으로 완성합니다.</p></article>
            <article><span>03</span><h3>검증</h3><p>합성 사용자와 운영 환경에서 실패 조건까지 재현하고 기록합니다.</p></article>
          </div>
        </section>

        <section className="contact section">
          <p className="eyebrow">Open channel</p>
          <h2>다음 문제를 함께<br />제품으로 바꿔봅시다.</h2>
          <a className="contact-link" href="https://github.com/KimChaeJun" target="_blank" rel="noreferrer">
            github.com/KimChaeJun <span>↗</span>
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ProjectDetail({ project }: { project: TimelineProject }) {
  return (
    <div className="site-shell detail-shell">
      <SiteHeader compact />
      <main>
        <section className="detail-hero">
          <a className="back-link" href="#/">← Index</a>
          <div className="detail-hero__meta"><span>{project.category}</span><span>{project.period}</span></div>
          <h1>{project.title}</h1>
          <div className="detail-hero__footer"><p>{project.subtitle}</p><span className="award-stamp">{project.award}</span></div>
        </section>

        <section className="detail-section split-section" aria-labelledby="overview-title">
          <p className="eyebrow">Project overview</p>
          <div>
            <h2 id="overview-title">복잡한 산재 신청을<br />하나의 흐름으로.</h2>
            <div className="overview-lines">{project.overviewLines.map((line) => <p key={line}>{line}</p>)}</div>
          </div>
        </section>

        <section className="detail-section role-section" aria-labelledby="role-title">
          <div className="role-intro"><p className="eyebrow">My role</p><h2 id="role-title">팀의 설계를<br />실제 서비스로 연결</h2></div>
          <ol className="role-list">
            {project.roles.map((role, index) => (
              <li key={role.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{role.title}</h3><p>{role.description}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="detail-section evidence-section" aria-labelledby="evidence-title">
          <div className="evidence-heading"><p className="eyebrow">Measured evidence</p><h2 id="evidence-title">측정된 것만<br />크게 보여줍니다.</h2></div>
          <div className="metric-grid">
            {project.metrics.map((metric, index) => (
              <figure className={`metric-card metric-card--${index + 1}`} key={metric.label}>
                <figcaption>{metric.label}</figcaption><strong>{metric.value}</strong><p>{metric.note}</p>
                <div className="metric-card__rule" aria-hidden="true"><span /></div>
              </figure>
            ))}
          </div>
          <p className="evidence-note">백엔드와 프런트 QA는 서로 다른 검사 집합으로, 합산하지 않고 각각 표기했습니다.</p>
        </section>

        <section className="detail-section pipeline-section" aria-labelledby="pipeline-title">
          <div><p className="eyebrow">System flow</p><h2 id="pipeline-title">정보가 문서가 되기까지</h2></div>
          <div className="pipeline" role="img" aria-label="사용자 입력에서 최종 PDF까지 이어지는 시스템 흐름">
            {project.pipeline.map((step, index) => (
              <div className="pipeline-step" key={step.label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step.label}</strong><p>{step.description}</p></div>
            ))}
          </div>
        </section>

        <section className="detail-section evolution-section" aria-labelledby="evolution-title">
          <div className="evolution-heading"><p className="eyebrow">Evolution</p><h2 id="evolution-title">숫자가 없을 때는<br />변화의 깊이를 보여줍니다.</h2></div>
          <div className="evolution-list">
            {project.improvements.map((item) => (
              <article key={item.after}>
                <div className="before"><span>BEFORE</span><p>{item.before}</p></div>
                <div className="evolution-arrow" aria-hidden="true">→</div>
                <div className="after"><span>AFTER</span><p>{item.after}</p><small>{item.evidence}</small></div>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-section timeline-section" aria-labelledby="timeline-title">
          <div><p className="eyebrow">Build timeline</p><h2 id="timeline-title">66일의 전개</h2></div>
          <ol className="build-timeline">
            {project.timeline.map((item) => (
              <li key={item.date}><time>{item.date}</time><div><h3>{item.title}</h3><p>{item.description}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="detail-closing">
          <p>Source: repository root <code>timeline.md</code></p>
          <h2>기획을 구현으로,<br />구현을 검증으로.</h2>
          <a href="#/">다른 프로젝트 보기 →</a>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return <footer><span>© 2026 KIM CHAE JUN</span><span>BUILT FROM VERIFIED TIMELINES</span><a href="#/">BACK TO INDEX ↑</a></footer>
}

function App() {
  const [content, setContent] = useState<PortfolioContent>(fallbackContent)
  const route = useRoute()

  useEffect(() => {
    let active = true
    getPortfolioContent().then((nextContent) => { if (active) setContent(nextContent) }).catch(() => undefined)
    return () => { active = false }
  }, [])

  const projectSlug = route.match(/^\/projects\/([^/]+)$/)?.[1]
  const project = timelineProjects.find((item) => item.slug === projectSlug)
  if (project) return <ProjectDetail project={project} />
  return <Home content={content} />
}

export default App
