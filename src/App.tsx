import { useEffect, useRef, useState, type ReactNode } from "react";
import { fallbackContent } from "./data/fallback";
import { technologyStack, type TechnologyGroup } from "./data/engineering";
import { TechnologyBadge } from "./components/TechnologyBadge";
import { getRoleTags } from "./data/roleTags";
import { type TimelineProject } from "./data/timelineProjects";
import { getPortfolioContent, subscribePortfolio } from "./lib/sanity";
import { EditorBridge, Editable, Copy } from "./components/Editable";
import type { PortfolioContent, Profile } from "./types/content";

type IconName =
  | "arrow"
  | "external"
  | "github"
  | "code"
  | "layers"
  | "check"
  | "back"
  | "mail"
  | "terminal"
  | "search"
  | "file"
  | "branch"
  | "download"
  | "close"
  | "menu"
  | "database"
  | "cloud"
  | "spark"
  | "shield"
  | "compass"
  | "copy";
function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14" />
        <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
      </>
    ),
    github: (
      <path
        d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.7c3.3-.4 6.8-1.6 6.8-7.3A5.7 5.7 0 0 0 19.3 4 5.3 5.3 0 0 0 19.2.1S18 0 15 1.6a14 14 0 0 0-6 0C6 0 4.8.1 4.8.1A5.3 5.3 0 0 0 4.7 4 5.7 5.7 0 0 0 3.2 8c0 5.7 3.5 6.9 6.8 7.3A3.5 3.5 0 0 0 9 18v4"
        transform="translate(0 1) scale(1 .9)"
      />
    ),
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
    layers: (
      <path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    back: <path d="M20 12H4m7-7-7 7 7 7" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    terminal: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m7 9 3 3-3 3m6 0h4" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 12h8m-8 4h6" />
      </>
    ),
    branch: (
      <>
        <circle cx="6" cy="5" r="2" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M6 7v10m0-4c9 0 12-1 12-5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" />
      </>
    ),
    cloud: (
      <>
        <path d="M6 18a5 5 0 1 1 .6-10A7 7 0 0 1 20 11a3.5 3.5 0 0 1-1 7M12 12v10m-4-6 4-4 4 4" />
      </>
    ),
    spark: (
      <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" />
    ),
    shield: (
      <>
        <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z" />
        <path d="m8 11 3 3 5-5" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-2 6-6 2 2-6Z" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const navigation = [
  { title: "Overview", href: "#/", icon: "compass" },
  { title: "Projects", href: "#/projects", icon: "layers" },
  { title: "Timeline & Docs", href: "#/timeline", icon: "branch" },
  { title: "About & Resume", href: "#/about", icon: "file" },
  { title: "Contact", href: "#/contact", icon: "mail" },
] as const;

function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const update = () => setHash(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const aliases: Record<string, string> = {
    work: "/projects",
    about: "/about",
    stack: "/about",
    contact: "/contact",
  };
  const route = aliases[hash] || hash;
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash === "stack" ? document.getElementById("stack") : null;
      if (target)
        target.scrollIntoView({ block: "start", behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return route;
}

function Badge({
  children,
  mint = false,
}: {
  children: ReactNode;
  mint?: boolean;
}) {
  return (
    <span className={`badge${mint ? " badge-mint" : ""}`}>
      <i />
      {children}
    </span>
  );
}

function Roles({ role, tags }: { role: string; tags?: string[] }) {
  return (
    <div className="role-tags">
      {getRoleTags(role, tags).map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function Header({
  profile,
  route,
  onCommand,
}: {
  profile: Profile;
  route: string;
  onCommand: () => void;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]);
  const active = (href: string) =>
    href === "#/" ? route === "/" : route.startsWith(href.slice(1));
  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          className="wordmark"
          href="#/"
          aria-label={`${profile.name} 포트폴리오 홈`}
        >
          <span className="logo-icon">
            <Icon name="terminal" />
          </span>
          <span>
            KimChaeJun<span className="brand-prompt">:~$</span>
            <small>fullstack.portfolio</small>
          </span>
        </a>
        <span className="header-build">
          <i />
          GITHUB PAGES
          <br />& PROJECT NOTES
        </span>
        <nav
          className={`navigation${open ? " is-open" : ""}`}
          aria-label="주요 메뉴"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active(item.href) ? "page" : undefined}
            >
              {item.title}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="command-trigger"
            onClick={onCommand}
            aria-label="빠른 메뉴 열기"
          >
            <Icon name="search" />
            <span>Command menu</span>
            <kbd>⌘ K</kbd>
          </button>
          <a
            className="icon-button header-github"
            href={profile.github || "https://github.com/KimChaeJun"}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 프로필 새 창에서 열기"
          >
            <Icon name="github" />
          </a>
          <button
            className="icon-button mobile-toggle"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}

function CommandMenu({
  projects,
  onClose,
}: {
  projects: TimelineProject[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, []);
  const entries = [
    ...navigation,
    ...projects.map((p) => ({
      title: `${p.title} · ${p.subtitle}`,
      href: `#/projects/${p.slug}`,
      icon: "code" as const,
    })),
  ];
  const filtered = entries.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <dialog
      className="command-dialog"
      ref={dialog}
      aria-labelledby="command-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="command-heading">
        <Icon name="search" />
        <h2 id="command-title">어디로 이동할까요?</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="빠른 메뉴 닫기"
        >
          <Icon name="close" />
        </button>
      </div>
      <input
        autoFocus
        placeholder="페이지 또는 프로젝트 검색…"
        aria-label="페이지 또는 프로젝트 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && filtered[0]) {
            window.location.hash = filtered[0].href;
            onClose();
          }
        }}
      />
      <div className="command-results">
        {filtered.map((entry) => (
          <a href={entry.href} onClick={onClose} key={entry.href}>
            <Icon name={entry.icon} />
            <span>{entry.title}</span>
            <Icon name="arrow" />
          </a>
        ))}
        {!filtered.length && (
          <p className="empty-state">
            일치하는 결과가 없습니다. 다른 이름으로 검색해 주세요.
          </p>
        )}
      </div>
      <div className="command-hint">
        <kbd>Enter</kbd> 첫 결과로 이동{" "}
        <span>
          <kbd>Esc</kbd> 닫기
        </span>
      </div>
    </dialog>
  );
}

function Terminal({ route }: { route: string }) {
  const [command, setCommand] = useState("");
  const [message, setMessage] = useState(
    "help · projects · about · stack · timeline · contact",
  );
  const current = route === "/" ? "overview" : route.split("/")[1];
  return (
    <div className="terminal-window">
      <div className="window-bar">
        <div className="window-caption">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Icon name="terminal" />
          <span>bash · portfolio: ~/{current}</span>
        </div>
        <span className="terminal-status">
          <span className="status-dot" />
          interactive navigation
        </span>
      </div>
      <form
        className="terminal-form"
        onSubmit={(event) => {
          event.preventDefault();
          const value = command
            .trim()
            .toLowerCase()
            .replace(/^\$\s*/, "");
          const routes: Record<string, string> = {
            projects: "#/projects",
            about: "#/about",
            stack: "#stack",
            timeline: "#/timeline",
            contact: "#/contact",
            home: "#/",
          };
          if (routes[value]) {
            window.location.hash = routes[value];
            setMessage(`→ ${value} 페이지로 이동했습니다.`);
            setCommand("");
          } else
            setMessage(
              value === "help" || !value
                ? "help · projects · about · stack · timeline · contact · home"
                : `알 수 없는 명령어입니다. help로 이동할 수 있는 페이지를 확인하세요.`,
            );
        }}
      >
        <label htmlFor="portfolio-command">
          chaejun<span>@dev</span>:~$
        </label>
        <input
          id="portfolio-command"
          autoComplete="off"
          spellCheck={false}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="help — 탐색할 페이지를 입력하세요"
        />
        <button className="terminal-run" type="submit">
          Run <span aria-hidden="true">↵</span>
        </button>
      </form>
      <div className="terminal-output" aria-live="polite">
        <span className="terminal-output-label">NAVIGATE</span>
        {message}
      </div>
    </div>
  );
}

function SectionTitle({
  label,
  title,
  icon = "code",
  children,
}: {
  label: string;
  title: ReactNode;
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <Icon name={icon} />
          {label}
        </p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Hero({
  profile,
  projects,
  about = false,
}: {
  profile: Profile;
  projects: TimelineProject[];
  about?: boolean;
}) {
  const stats = [
    {
      value: String(projects.length).padStart(2, "0"),
      label: "Featured projects",
    },
    {
      value: String(projects.reduce((n, p) => n + p.timeline.length, 0)),
      label: "Project milestones",
    },
    {
      value: String(technologyStack.flatMap((g) => g.technologies).length),
      label: "Core technologies",
    },
    {
      value: String(projects.filter((p) => p.award).length).padStart(2, "0"),
      label: "Project award",
    },
  ];
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <div className="hero-badges">
          {profile.availability && (
            <Badge mint>
              <Editable
                value={profile.availability}
                path={["profile", "availability"]}
              />
            </Badge>
          )}
          <span className="mono subtle">
            <Icon name="branch" />
            {about ? "about / resume" : "ideas → products"}
          </span>
        </div>
        <h1 id="hero-title">
          {about ? (
            <>
              <Copy name="aboutLead" />
              <br />
              <Copy name="aboutMiddle" />
              <br />
              <em>
                <Copy name="aboutAccent" />
              </em>
            </>
          ) : (
            <>
              <Copy name="heroLead" />
              <br />
              <Copy name="heroMiddle" />
              <br />
              <em>
                <Copy name="heroAccent" />
              </em>
            </>
          )}
        </h1>
        <p className="hero-description">
          <Editable value={profile.intro} path={["profile", "intro"]} />
        </p>
        <Roles role={profile.role} tags={profile.roleTags} />
        <div className="button-row">
          <a
            className="button primary"
            href={
              about
                ? profile.github || "https://github.com/KimChaeJun"
                : "#/projects"
            }
            target={about ? "_blank" : undefined}
            rel={about ? "noreferrer" : undefined}
          >
            <Icon name={about ? "github" : "layers"} />
            {about ? "GitHub 프로필" : "프로젝트 살펴보기"}
            <Icon name="arrow" />
          </a>
          {about ? (
            <button className="button" onClick={() => window.print()}>
              <Icon name="download" />
              이력서 인쇄 / PDF
            </button>
          ) : (
            <a className="button" href="#/about">
              <Icon name="file" />
              About & Resume
            </a>
          )}
          <a className="button quiet" href="#/contact">
            <Icon name="mail" />
            이야기 나누기
          </a>
        </div>
      </div>
      <aside className="snapshot">
        <div className="snapshot-heading">
          <span>
            <Icon name="layers" />
            AT A GLANCE
          </span>
          <Badge mint>PROJECT RECORDS</Badge>
        </div>
        <div className="snapshot-grid">
          {stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="snapshot-bottom">
          <span>
            <i />
            Web · API · AI · Infra
          </span>
          <span>
            <Editable value={profile.location} path={["profile", "location"]} />
          </span>
        </div>
        <p>포트폴리오에 수록한 프로젝트 기록 기준</p>
      </aside>
    </section>
  );
}

const pillars: {
  icon: IconName;
  title: string;
  english: string;
  text: string;
  caption: string;
}[] = [
  {
    icon: "compass",
    title: "문제에서 출발",
    english: "Start with the problem",
    text: "산재 신청의 복잡한 절차부터 노래를 따라 부를 때의 불편함까지. 일상에서 발견한 문제를 구현 가능한 흐름으로 정리합니다.",
    caption: "문제 정의 → 사용자 흐름",
  },
  {
    icon: "spark",
    title: "경계를 잇는 구현",
    english: "Connect the whole product",
    text: "화면과 API, 데이터와 AI, 배포 환경을 연결합니다. 한 기능을 넘어 사용자가 경험하는 서비스 전체를 생각합니다.",
    caption: "Frontend → Backend → Infra",
  },
  {
    icon: "shield",
    title: "실패까지 설계",
    english: "Build for the unexpected",
    text: "외부 AI 호출 실패, 재접속, 늦게 도착한 응답처럼 정상 경로 밖의 상황에서도 사용자의 작업이 이어지도록 만듭니다.",
    caption: "복구 · 멱등 처리 · 상태 보존",
  },
  {
    icon: "check",
    title: "근거로 확인",
    english: "Verify, then improve",
    text: "기능 구현 후에는 테스트와 E2E로 흐름을 확인합니다. 개선 전후와 검증 근거를 남겨 다음 작업으로 이어갑니다.",
    caption: "구현 → 검증 → 개선 → 기록",
  },
];

function Pillars() {
  return (
    <section className="section">
      <SectionTitle
        label="CORE PILLARS & ATTRIBUTES"
        title="코드에 담는 생각과 일하는 방식"
        icon="compass"
      />
      <div className="pillar-grid">
        {pillars.map((pillar, i) => (
          <article
            className={`pillar-card${i === 1 ? " mint-card" : ""}`}
            key={pillar.title}
          >
            <div className="pillar-top">
              <span className="square-icon">
                <Icon name={pillar.icon} />
              </span>
              <span className="micro-label">
                0{i + 1} /{" "}
                {["DISCOVERY", "CONNECTION", "RESILIENCE", "CRAFT"][i]}
              </span>
            </div>
            <h3>
              <Copy name={"pillar" + i + "Title"} />
            </h3>
            <p className="pillar-english">
              <Copy name={"pillar" + i + "English"} />
            </p>
            <p>
              <Copy name={"pillar" + i + "Text"} />
            </p>
            <div className="pillar-caption">
              <Icon name="check" />
              <Copy name={"pillar" + i + "Caption"} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stack({
  groups = technologyStack,
  compact = false,
}: {
  groups?: TechnologyGroup[];
  compact?: boolean;
}) {
  const shown = compact
    ? [
        groups[0],
        {
          category: "Backend & Data",
          description: "API, 데이터베이스와 인증을 연결해요",
          technologies: [...groups[1].technologies, ...groups[2].technologies],
        },
        groups[3],
        {
          category: "DevOps & Infra",
          description: "배포부터 운영·회귀 검증까지",
          technologies: [...groups[4].technologies, ...groups[5].technologies],
        },
      ]
    : groups;
  const icons: IconName[] = [
    "code",
    "database",
    "spark",
    "cloud",
    "layers",
    "terminal",
  ];
  return (
    <div className={`stack-grid${compact ? " stack-grid-four" : ""}`}>
      {shown.map((group, index) => (
        <article className="stack-card" key={group.category}>
          <div className="stack-heading">
            <h3>
              <Icon name={icons[index % icons.length]} />
              {group.category}
            </h3>
            <span>{group.technologies.length} STACKS</span>
          </div>
          <p>{group.description}</p>
          <ul
            className="technology-list"
            aria-label={group.category + " 기술 스택"}
          >
            {group.technologies.map((tech) => (
              <TechnologyBadge key={tech} name={tech} />
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function Architecture({ project }: { project: TimelineProject }) {
  if (!["sanjae-oneshot", "lyrikana"].includes(project.slug))
    return (
      <div className="architecture generic-architecture">
        <div className="architecture-heading">
          <span>
            <Icon name="branch" />
            Project flow
          </span>
          <span className="mono">구성 요약</span>
        </div>
        <ol>
          {project.pipeline.map((step, index) => (
            <li key={index}>
              <span className="micro-label">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>
                  <Editable scope={project.slug} value={step.label} />
                </strong>
                <p>
                  <Editable scope={project.slug} value={step.description} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  const lyric = project.slug === "lyrikana";
  const nodes = lyric
    ? [
        [
          "Browser Extension",
          "TypeScript · Manifest V3",
          "곡 정보 / 재생 상태",
        ],
        [
          "Desktop Overlay",
          "Electron · Native Messaging",
          "가사 / 읽기 / 재생 제어",
        ],
        ["Lyrics API", "Python · FastAPI", "조회 · 캐시 · 분석 작업"],
        ["Reading & Audio", "SudachiPy · PyTorch", "읽기 변환 / 선택적 분석"],
        ["Local Storage", "SQLAlchemy · SQLite", "작품 / 녹음본 / 교정"],
      ]
    : [
        ["User Application", "React · TypeScript", "신청 위저드 / 8개 언어"],
        ["Admin Application", "Tauri · React", "권한 / 승인 / 활동 이력"],
        ["Application API", "Python · FastAPI", "신청 상태 · 처리 흐름"],
        ["AI & Documents", "OCR · OpenAI · ReportLab", "증빙 / 초안 / PDF"],
        ["Data & Storage", "PostgreSQL · Supabase", "신청 / 스냅샷 / 파일"],
      ];
  return (
    <div className="architecture">
      <div className="architecture-heading">
        <span>
          <Icon name="branch" />
          {lyric
            ? "Lyrics & playback architecture"
            : "Application & document architecture"}
        </span>
        <span className="mono">구성 요약</span>
      </div>
      <div className="architecture-canvas">
        <svg
          className="architecture-lines"
          viewBox="0 0 500 270"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M120 65V110H250V135M380 65V110H250M250 160v50H120v35M250 210h130v35" />
        </svg>
        {nodes.map(([title, tech, description], i) => (
          <div className={`architecture-node node-${i}`} key={title}>
            <strong>
              <i />
              {title}
            </strong>
            <span>{tech}</span>
            <small>{description}</small>
          </div>
        ))}
      </div>
      <div className="architecture-footer">
        <Icon name="cloud" />
        {lyric
          ? "Browser extension ↔ Local services ↔ Desktop"
          : "Docker · Nginx · GitHub Actions → AWS ECS"}
      </div>
    </div>
  );
}

function ProjectSummary({ project }: { project: TimelineProject }) {
  return (
    <article
      className={
        "summary-card " + (project.slug === "lyrikana" ? "mint-card" : "")
      }
    >
      <div className="summary-top">
        <span className="micro-label">
          <Editable scope={project.slug} value={project.category} />
        </span>
        {project.year && <span className="mono">{project.year}</span>}
      </div>
      <h3>
        <a href={"#/projects/" + project.slug}>
          <Editable scope={project.slug} value={project.title} />
          <Icon name="external" />
        </a>
      </h3>
      <p>
        <Editable scope={project.slug} value={project.subtitle} />
      </p>
      {project.metrics.length > 0 && (
        <div className="summary-evidence">
          {project.metrics.slice(0, 3).map((metric) => (
            <div key={metric.label}>
              <span>
                <Editable scope={project.slug} value={metric.label} />
              </span>
              <strong>
                <Editable scope={project.slug} value={metric.value} />
              </strong>
            </div>
          ))}
        </div>
      )}
      <ul
        className="technology-list technology-list-compact"
        aria-label={project.title + " 기술 스택"}
      >
        {project.tags.slice(0, 6).map((tag) => (
          <TechnologyBadge key={tag} name={tag} />
        ))}
      </ul>
      <div className="summary-bottom">
        <span>{project.role}</span>
        <a className="text-link" href={"#/projects/" + project.slug}>
          상세 보기 <Icon name="arrow" />
        </a>
      </div>
    </article>
  );
}
function ProjectCard({
  project,
  index,
}: {
  project: TimelineProject;
  index: number;
}) {
  return (
    <article
      className={
        "engineering-card" +
        (project.slug === "lyrikana" ? " engineering-card-mint" : "")
      }
    >
      <div className="engineering-card-bar">
        <div>
          <Badge mint={project.slug === "lyrikana"}>PROJECT WORKSPACE</Badge>
          <span className="mono">
            project / {String(index + 1).padStart(2, "0")}
          </span>
          {project.award && (
            <span className="award-label">
              <Editable scope={project.slug} value={project.award} />
            </span>
          )}
        </div>
        <span className="mono card-category">{project.category}</span>
      </div>
      <div className="engineering-card-grid">
        <div className="project-system">
          <div className="project-name">
            <h2>
              <a href={"#/projects/" + project.slug}>
                <Editable scope={project.slug} value={project.title} />
              </a>
            </h2>
          </div>
          <p className="project-subtitle">
            <Editable scope={project.slug} value={project.subtitle} />
          </p>
          <Architecture project={project} />
          <div className="project-facts">
            {project.role && (
              <div>
                <span>ROLE & CONTRIBUTION</span>
                <Roles role={project.role} tags={project.roleTags} />
              </div>
            )}
            <div>
              <span>
                {project.period ? "DEVELOPMENT WINDOW" : "PROJECT RECORDS"}
              </span>
              <strong>
                {project.period || project.timeline.length + " milestones"}
              </strong>
              {!project.period && <small>코드 변경 기록 기준</small>}
            </div>
          </div>
          <ul
            className="technology-list technology-list-compact"
            aria-label={project.title + " 기술 스택"}
          >
            {project.tags.map((tag) => (
              <TechnologyBadge key={tag} name={tag} />
            ))}
          </ul>
        </div>
        <div className="project-contributions">
          <h3>
            <Icon name="layers" />
            {project.roles.length
              ? "직접 구현하고 해결한 것"
              : "프로젝트에서 다루는 것"}
            <span>
              {project.roles.length ? "WHAT I DID" : "PROJECT OVERVIEW"}
            </span>
          </h3>
          <div className="contribution-list">
            {project.roles.length
              ? project.roles.slice(0, 3).map((role, i) => (
                  <div className="contribution" key={i}>
                    <span className="contribution-icon">
                      <Icon name="code" />
                    </span>
                    <div>
                      <h4>
                        <Editable scope={project.slug} value={role.title} />
                      </h4>
                      <p>
                        <Editable
                          scope={project.slug}
                          value={role.description}
                        />
                      </p>
                    </div>
                  </div>
                ))
              : project.overviewLines.slice(0, 4).map((line, i) => (
                  <div className="contribution" key={i}>
                    <span className="contribution-icon">
                      <Icon name="file" />
                    </span>
                    <p>
                      <Editable scope={project.slug} value={line} />
                    </p>
                  </div>
                ))}
          </div>
          {project.improvements[0] && (
            <div className="project-callout">
              <Icon name="check" />
              <div>
                <strong>개선 기록</strong>
                <p>
                  <Editable
                    scope={project.slug}
                    value={project.improvements[0].after}
                  />
                </p>
              </div>
            </div>
          )}
          <a
            className="button primary project-inspect"
            href={"#/projects/" + project.slug}
          >
            <Icon name="file" />
            기술 구성과 프로젝트 기록 살펴보기
            <Icon name="arrow" />
          </a>
        </div>
      </div>
    </article>
  );
}

type Milestone = TimelineProject["timeline"][number] & {
  project: TimelineProject;
  normalizedDate: string;
};
function getMilestones(projects: TimelineProject[]): Milestone[] {
  return projects
    .flatMap((project) =>
      project.timeline.map((item) => ({
        ...item,
        project,
        normalizedDate:
          item.date.length <= 5
            ? `${project.year}-${item.date.replace(".", "-")}`
            : item.date,
      })),
    )
    .sort((a, b) => b.normalizedDate.localeCompare(a.normalizedDate));
}

function notesMarkdown(project: TimelineProject) {
  const sections = [
    "# " + project.title + "\n\n" + project.subtitle,
    "## Overview\n" + project.overviewLines.map((x) => "- " + x).join("\n"),
    project.role || project.roleTags.length
      ? "## Role\n" + getRoleTags(project.role, project.roleTags).join(" · ")
      : "",
    project.roles.length
      ? "## Contributions\n" +
        project.roles
          .map((x) => "### " + x.title + "\n" + x.description)
          .join("\n\n")
      : "",
    "## Technology\n" +
      project.technologyStack
        .map((g) => "- " + g.category + ": " + g.technologies.join(", "))
        .join("\n"),
    project.metrics.length
      ? "## Evidence\n" +
        project.metrics
          .map((x) => "- " + x.label + ": " + x.value + " — " + x.note)
          .join("\n")
      : "",
    project.improvements.length
      ? "## Improvements\n" +
        project.improvements
          .map(
            (x) =>
              "- Before: " +
              x.before +
              "\n- After: " +
              x.after +
              "\n- Evidence: " +
              x.evidence,
          )
          .join("\n\n")
      : "",
    "## Timeline\n" +
      project.timeline
        .map((x) => "- " + x.date + " · " + x.title + ": " + x.description)
        .join("\n"),
    project.timelineBasis === "code"
      ? "날짜는 코드 변경 기록일이며 참여 기간이나 실제 배포일을 뜻하지 않습니다."
      : "",
    "포트폴리오 공개용 프로젝트 기록입니다.",
  ];
  return sections.filter(Boolean).join("\n\n") + "\n";
}

function downloadNotes(project: TimelineProject) {
  const url = URL.createObjectURL(
    new Blob([notesMarkdown(project)], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.slug}-notes.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function NotesPanel({ project }: { project: TimelineProject }) {
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => setCopyStatus(""), [project.slug]);
  return (
    <article className="notes-panel">
      <div className="window-bar">
        <div className="window-caption">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Icon name="file" />
          <span>{project.slug}/project-notes.md</span>
        </div>
        <button
          className="icon-button"
          aria-label="프로젝트 기록 복사"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(notesMarkdown(project));
              setCopyStatus("복사했습니다.");
            } catch {
              setCopyStatus(
                "복사할 수 없습니다. 아래 다운로드 버튼을 이용해 주세요.",
              );
            }
          }}
        >
          <Icon name="copy" />
        </button>
      </div>
      <div className="notes-content">
        <span className="micro-label">PUBLIC PROJECT NOTES</span>
        <h3>
          # <Editable scope={project.slug} value={project.title} />
        </h3>
        <p>{project.summaryLines[0]}</p>
        <blockquote>{project.summaryLines[1]}</blockquote>
        <div className="code-note">
          <div>
            project.config <span>READ ONLY</span>
          </div>
          <pre>
            <code>
              {JSON.stringify(
                {
                  name: project.title,
                  ...(project.role ? { role: project.role } : {}),
                  technologies: project.tags,
                },
                null,
                2,
              )}
            </code>
          </pre>
        </div>
        {project.improvements.length > 0 && (
          <>
            <h4>## 구현과 검증의 기록</h4>
            <ul className="check-list">
              {project.improvements.map((item, index) => (
                <li key={index}>
                  <Icon name="check" />
                  <span>
                    <Editable scope={project.slug} value={item.evidence} />
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="notes-actions">
          <button
            className="button small"
            onClick={() => downloadNotes(project)}
          >
            <Icon name="download" />
            공개 기록 .md
          </button>
          <a className="text-link" href={`#/projects/${project.slug}`}>
            전체 내용 <Icon name="arrow" />
          </a>
        </div>
        <p className="copy-status" role="status">
          {copyStatus}
        </p>
      </div>
    </article>
  );
}

function Timeline({
  projects,
  full = false,
}: {
  projects: TimelineProject[];
  full?: boolean;
}) {
  const [selected, setSelected] = useState("all");
  const [documentSlug, setDocumentSlug] = useState(projects[0].slug);
  const filtered =
    selected === "all" ? projects : projects.filter((p) => p.slug === selected);
  const milestones = getMilestones(filtered);
  const visible = full ? milestones : milestones.slice(0, 4);
  const documentProject =
    projects.find((p) => p.slug === documentSlug) || projects[0];
  return (
    <section className={`timeline-area${full ? " timeline-full" : ""}`}>
      <div className="page-width">
        <SectionTitle
          label="CHRONOLOGICAL PROJECT RECORDS"
          title="Project Milestones & Engineering Notes"
          icon="branch"
        >
          <a className="button small" href={full ? "#/projects" : "#/timeline"}>
            <Icon name={full ? "layers" : "file"} />
            {full ? "프로젝트 목록" : "전체 기록 보기"}
            <Icon name="arrow" />
          </a>
        </SectionTitle>
        {full && (
          <div className="filter-row" aria-label="타임라인 프로젝트 필터">
            {[{ slug: "all", title: "All projects" }, ...projects].map((p) => (
              <button
                key={p.slug}
                aria-pressed={selected === p.slug}
                onClick={() => {
                  setSelected(p.slug);
                  if (p.slug !== "all") setDocumentSlug(p.slug);
                }}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
        <div className="timeline-layout">
          <div>
            <ol className="milestone-list">
              {visible.map((item, index) => (
                <li key={item.project.slug + "-" + index}>
                  <div className="milestone-meta">
                    <time dateTime={item.normalizedDate}>
                      {item.normalizedDate.replaceAll("-", ".")}
                    </time>
                    <button
                      className={`micro-label${documentSlug === item.project.slug ? " selected" : ""}`}
                      onClick={() => setDocumentSlug(item.project.slug)}
                      aria-label={`${item.project.title} 공개 기록 보기`}
                    >
                      {item.project.title}
                    </button>
                  </div>
                  <h3>
                    <a href={`#/projects/${item.project.slug}`}>{item.title}</a>
                  </h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
            <p className="timeline-caption">
              산재원샷을 제외한 프로젝트의 날짜는 코드 변경 기록일이며, 참여
              기간이나 실제 배포일을 뜻하지 않습니다.
            </p>
          </div>
          <div>
            <div className="document-tabs" aria-label="프로젝트 공개 기록 선택">
              {projects.map((p) => (
                <button
                  key={p.slug}
                  aria-pressed={documentSlug === p.slug}
                  onClick={() => setDocumentSlug(p.slug)}
                >
                  {p.title}
                </button>
              ))}
            </div>
            <NotesPanel project={documentProject} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Home({
  profile,
  projects,
}: {
  profile: Profile;
  projects: TimelineProject[];
}) {
  return (
    <>
      <div className="page-width">
        <Hero profile={profile} projects={projects} />
        <section className="section">
          <SectionTitle
            label="PROJECTS / SELECTED RECORDS"
            title={<Copy name="projectHeading" />}
            icon="layers"
          >
            <a className="text-link" href="#/projects">
              전체 프로젝트 <Icon name="arrow" />
            </a>
          </SectionTitle>
          <div className="summary-grid">
            {projects.map((p) => (
              <ProjectSummary key={p.slug} project={p} />
            ))}
          </div>
        </section>
        <Pillars />
      </div>
      <Timeline projects={projects} />
      <div className="page-width">
        <ContactBanner profile={profile} />
      </div>
    </>
  );
}

function About({
  content,
  projects,
}: {
  content: PortfolioContent;
  projects: TimelineProject[];
}) {
  const experiences = content.experiences.filter(
    (e) => !fallbackContent.experiences.some((sample) => sample._id === e._id),
  );
  return (
    <div className="page-width about-page">
      <Hero profile={content.profile} projects={projects} about />
      <Pillars />
      <section className="section" id="stack">
        <SectionTitle
          label="TECHNOLOGY IN PRACTICE"
          title="현재 주력 기술 스택"
        />
        <p className="section-description">
          산재원샷에서 실제로 사용한 기술입니다. 프로젝트 상세에서 각 기술의
          쓰임을 확인할 수 있습니다.
        </p>
        <Stack
          compact
          groups={
            projects.find((p) => p.slug === "sanjae-oneshot")
              ?.technologyStack || technologyStack
          }
        />
      </section>
      <section className="section">
        <SectionTitle
          label="EXPERIENCE & PROJECT HISTORY"
          title="프로젝트로 쌓아온 경험"
          icon="branch"
        />
        <div className="experience-grid">
          {projects
            .filter((project) => project.roles.length > 0)
            .map((project) => (
              <article className="experience-card" key={project.slug}>
                <div className="experience-meta">
                  <span className="micro-label">
                    {project.period || `${project.year} · 코드 변경 기록 기준`}
                  </span>
                  {project.award && (
                    <span>
                      <Editable scope={project.slug} value={project.award} />
                    </span>
                  )}
                </div>
                <h3>
                  <Editable scope={project.slug} value={project.title} />{" "}
                  <span> / {project.role}</span>
                </h3>
                <p>{project.summaryLines[0]}</p>
                <div className="tag-list">
                  {project.tags.slice(0, 5).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <a className="text-link" href={`#/projects/${project.slug}`}>
                  기여와 검증 기록 <Icon name="arrow" />
                </a>
              </article>
            ))}
          {experiences.map((e) => (
            <article className="experience-card" key={e._id}>
              <span className="micro-label">
                {e.startDate} — {e.current ? "현재" : e.endDate}
              </span>
              <h3>
                {e.company} / {e.position}
              </h3>
              <p>{e.summary}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionTitle
          label="PORTFOLIO SHOWCASE"
          title="대표 프로젝트 요약"
          icon="layers"
        >
          <a className="text-link" href="#/projects">
            전체 프로젝트 보기 <Icon name="arrow" />
          </a>
        </SectionTitle>
        <div className="summary-grid">
          {projects.map((p) => (
            <ProjectSummary key={p.slug} project={p} />
          ))}
        </div>
      </section>
      <div className="record-banner">
        <span className="square-icon">
          <Icon name="file" />
        </span>
        <div>
          <strong>만들어온 과정과 확인한 근거를 함께 기록합니다.</strong>
          <p>Project notes · Contributions · Technology · Milestones</p>
        </div>
        <a className="button small" href="#/timeline">
          작업 기록 보기 <Icon name="arrow" />
        </a>
      </div>
    </div>
  );
}

function Projects({ projects }: { projects: TimelineProject[] }) {
  const [filter, setFilter] = useState("All Projects");
  const filters = [
    "All Projects",
    "Full Stack",
    "AI & Data",
    "Realtime",
    "Desktop & Audio",
  ];
  const matches = (p: TimelineProject, value: string) =>
    value === "All Projects" ||
    (value === "Full Stack" &&
      getRoleTags(p.role, p.roleTags).includes("Full Stack Developer")) ||
    (value === "AI & Data" &&
      p.technologyStack.some((g) =>
        g.technologies.some((t) =>
          [
            "OpenAI API",
            "PyTorch",
            "PaddleOCR",
            "scikit-learn",
            "Chart.js",
          ].includes(t),
        ),
      )) ||
    (value === "Realtime" &&
      p.technologyStack.some((g) =>
        g.technologies.some((t) =>
          ["WebSocket", "WebRTC", "Kafka"].includes(t),
        ),
      )) ||
    (value === "Desktop & Audio" &&
      p.technologyStack.some((g) => g.technologies.includes("Electron")));
  const shown = projects.filter((p) => matches(p, filter));
  return (
    <>
      <section className="projects-intro page-width">
        <div className="projects-heading">
          <div>
            <p className="eyebrow">
              <Icon name="layers" />
              PRODUCTION ARTIFACTS & PROJECT RECORDS
            </p>
            <h1>
              Projects &<br className="mobile-break" /> Engineering Logs
              <span className="blue-dot">.</span>
            </h1>
          </div>
          <div className="intro-note">
            <Icon name="file" />
            <p>
              문제를 어떻게 정의하고, 무엇을 구현하고, 어떻게 검증했는지.
              <br />
              <strong>코드 너머의 만드는 과정을 기록합니다.</strong>
            </p>
          </div>
        </div>
        <div className="projects-filter-line">
          <div className="filter-row" aria-label="프로젝트 필터">
            {filters.map((value) => (
              <button
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value}
                <span>{projects.filter((p) => matches(p, value)).length}</span>
              </button>
            ))}
          </div>
          <p className="mono" aria-live="polite">
            Showing {shown.length} projects / verified notes
          </p>
        </div>
      </section>
      <div className="project-list page-width">
        {shown.map((p) => (
          <ProjectCard key={p.slug} project={p} index={projects.indexOf(p)} />
        ))}
        {!shown.length && (
          <p className="empty-state">이 분류에 해당하는 프로젝트가 없습니다.</p>
        )}
      </div>
      <Timeline projects={projects} />
    </>
  );
}

function ProjectDetail({ project }: { project: TimelineProject }) {
  return (
    <div
      className={`page-width detail-page${project.slug === "lyrikana" ? " detail-mint" : ""}`}
    >
      <a className="back-link" href="#/projects">
        <Icon name="back" />
        프로젝트 목록
      </a>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">
            <Icon name="code" />
            PROJECT DEEP DIVE{project.year ? " / " + project.year : ""}
          </p>
          <h1>
            <Editable scope={project.slug} value={project.title} />
            <span className="blue-dot">.</span>
          </h1>
          <p>
            <Editable scope={project.slug} value={project.subtitle} />
          </p>
          <Roles role={project.role} tags={project.roleTags} />
        </div>
        <div className="detail-meta">
          {project.award && (
            <Badge mint>
              <Editable scope={project.slug} value={project.award} />
            </Badge>
          )}
          {project.period && (
            <span className="mono">
              <Editable scope={project.slug} value={project.period} />
            </span>
          )}
          <button
            className="button small"
            onClick={() => downloadNotes(project)}
          >
            <Icon name="download" />
            프로젝트 기록 .md
          </button>
        </div>
      </section>
      <section className="detail-overview">
        <div>
          <p className="eyebrow">01 / PROBLEM & APPROACH</p>
          <h2>어떤 문제를 해결했나요?</h2>
          {project.overviewLines.map((line) => (
            <p key={line}>
              <Editable scope={project.slug} value={line} />
            </p>
          ))}
          <div className="tag-list">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <Architecture project={project} />
      </section>
      {project.roles.length > 0 && (
        <section className="section">
          <SectionTitle
            label="02 / ROLE & CONTRIBUTIONS"
            title="서비스의 처음부터 끝까지, 직접 구현한 것"
            icon="layers"
          />
          <div className="detail-role-grid">
            {project.roles.map((role, i) => (
              <article key={role.title}>
                <span className="micro-label">
                  CONTRIBUTION / {String(i + 1).padStart(2, "0")}
                </span>
                <h3>
                  <Editable scope={project.slug} value={role.title} />
                </h3>
                <p>
                  <Editable scope={project.slug} value={role.description} />
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="section">
        <SectionTitle
          label="03 / TECHNOLOGY IN CONTEXT"
          title="이 프로젝트에 사용한 기술"
        />
        <Stack groups={project.technologyStack} />
      </section>
      {project.metrics.length > 0 && (
        <section className="section">
          <SectionTitle
            label="EVIDENCE / IN NUMBERS"
            title="직접 확인한 결과"
            icon="check"
          />
          <div className="metric-grid">
            {project.metrics.map((metric) => (
              <figure key={metric.label}>
                <figcaption>
                  <Editable scope={project.slug} value={metric.label} />
                </figcaption>
                <strong>
                  <Editable scope={project.slug} value={metric.value} />
                </strong>
                <p>
                  <Editable scope={project.slug} value={metric.note} />
                </p>
              </figure>
            ))}
          </div>
          <p className="section-description metric-note">
            백엔드 테스트와 프런트엔드 QA는 서로 다른 검사 집합이며, 각각의
            수치입니다.
          </p>
        </section>
      )}
      <section className="section">
        <SectionTitle
          label="04 / HOW IT WORKS"
          title="사용자 경험을 연결하는 처리 흐름"
          icon="branch"
        />
        <ol className="pipeline">
          {project.pipeline.map((step, i) => (
            <li key={step.label}>
              <span className="micro-label">
                STEP {String(i + 1).padStart(2, "0")}
              </span>
              <h3>
                <Editable scope={project.slug} value={step.label} />
              </h3>
              <p>
                <Editable scope={project.slug} value={step.description} />
              </p>
            </li>
          ))}
        </ol>
      </section>
      {project.improvements.length > 0 && (
        <section className="section">
          <SectionTitle
            label="05 / ITERATION & VERIFICATION"
            title="막히는 순간을 더 나은 흐름으로"
            icon="shield"
          />
          <div className="improvements">
            {project.improvements.map((item) => (
              <article key={item.after}>
                <div className="before">
                  <span className="micro-label">BEFORE</span>
                  <p>
                    <Editable scope={project.slug} value={item.before} />
                  </p>
                </div>
                <div className="improvement-arrow">
                  <Icon name="arrow" />
                </div>
                <div className="after">
                  <span className="micro-label">AFTER</span>
                  <h3>
                    <Editable scope={project.slug} value={item.after} />
                  </h3>
                  <p>
                    <Icon name="check" />
                    <Editable scope={project.slug} value={item.evidence} />
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="section detail-timeline">
        <SectionTitle
          label="06 / PROJECT MILESTONES"
          title="만들고, 확인하고, 다시 다듬은 기록"
          icon="branch"
        />
        {project.timelineBasis === "code" && (
          <p className="section-description">
            날짜는 코드 변경 기록일이며, 참여 기간이나 실제 배포일을 뜻하지
            않습니다.
          </p>
        )}
        <ol className="milestone-list">
          {getMilestones([project])
            .reverse()
            .map((item, index) => (
              <li key={index}>
                <div className="milestone-meta">
                  <time dateTime={item.normalizedDate}>
                    {item.normalizedDate.replaceAll("-", ".")}
                  </time>
                </div>
                <h3>
                  <Editable scope={project.slug} value={item.title} />
                </h3>
                <p>
                  <Editable scope={project.slug} value={item.description} />
                </p>
              </li>
            ))}
        </ol>
      </section>
      <div className="record-banner">
        <Icon name="file" />
        <div>
          <strong>결과만큼, 만드는 과정도 중요하니까요.</strong>
          <p>프로젝트 기록: timeline.md의 공개용 내용 기준</p>
        </div>
        <a className="button primary" href="#/projects">
          다른 프로젝트 보기 <Icon name="arrow" />
        </a>
      </div>
    </div>
  );
}

function ContactBanner({ profile }: { profile: Profile }) {
  return (
    <section className="contact-banner">
      <div>
        <p className="eyebrow">
          <Icon name="mail" />
          LET'S BUILD SOMETHING
        </p>
        <h2>
          <Copy name="contactLead" />
          <br />
          <Copy name="contactAccent" />
        </h2>
        <p>
          <Copy name="contactDescription" />
        </p>
      </div>
      <a
        className="button primary"
        href={
          profile.email
            ? `mailto:${profile.email}`
            : profile.github || "https://github.com/KimChaeJun"
        }
        target={profile.email ? undefined : "_blank"}
        rel={profile.email ? undefined : "noreferrer"}
      >
        <Icon name={profile.email ? "mail" : "github"} />
        {profile.email ? "메일로 이야기 나누기" : "GitHub에서 만나요"}
        <Icon name="external" />
      </a>
    </section>
  );
}

function Contact({ profile }: { profile: Profile }) {
  return (
    <section className="page-width contact-page">
      <p className="eyebrow">
        <Icon name="mail" />
        CONTACT / NEW CONNECTIONS
      </p>
      <h1>
        <Copy name="contactPageLead" />
        <br />
        <em>
          <Copy name="contactPageAccent" />
        </em>
      </h1>
      <p className="hero-description">
        <Copy name="contactPageDescription" />
      </p>
      <div className="contact-links">
        <a
          href={profile.github || "https://github.com/KimChaeJun"}
          target="_blank"
          rel="noreferrer"
        >
          <span className="square-icon">
            <Icon name="github" />
          </span>
          <div>
            <span className="micro-label">GITHUB</span>
            <strong>KimChaeJun</strong>
            <p>프로젝트와 코드를 살펴보세요.</p>
          </div>
          <Icon name="external" />
        </a>
        {profile.email && (
          <a href={`mailto:${profile.email}`}>
            <span className="square-icon">
              <Icon name="mail" />
            </span>
            <div>
              <span className="micro-label">EMAIL</span>
              <strong>
                <Editable value={profile.email} path={["profile", "email"]} />
              </strong>
              <p>협업과 기회에 관한 이야기를 기다립니다.</p>
            </div>
            <Icon name="arrow" />
          </a>
        )}
        {profile.linkedin && (
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            <span className="square-icon">
              <Icon name="external" />
            </span>
            <div>
              <span className="micro-label">LINKEDIN</span>
              <strong>
                <Editable value={profile.name} path={["profile", "name"]} />
              </strong>
            </div>
            <Icon name="external" />
          </a>
        )}
      </div>
      <div className="contact-location">
        <Badge mint>{profile.availability || "LET’S CONNECT"}</Badge>
        <span className="mono">
          <Editable value={profile.location} path={["profile", "location"]} />
        </span>
      </div>
    </section>
  );
}

function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="site-footer">
      <div className="page-width footer-inner">
        <span>
          © {new Date().getFullYear()}{" "}
          <Editable value={profile.name} path={["profile", "name"]} />. Built
          with care.
        </span>
        <a
          href={profile.github || "https://github.com/KimChaeJun"}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="github" />
          github.com/KimChaeJun
        </a>
        <a href="/admin/" className="admin-link">
          관리자 모드
        </a>
        <span className="footer-note">
          <Icon name="branch" />
          <Copy name="footer" />
        </span>
      </div>
    </footer>
  );
}

function App() {
  const [content, setContent] = useState<PortfolioContent>(fallbackContent);
  const [commandOpen, setCommandOpen] = useState(false);
  const route = useRoute();
  useEffect(() => {
    if (
      window.parent !== window &&
      new URLSearchParams(location.search).get("edit") === "1"
    )
      return;
    let active = true;
    const refresh = () =>
      getPortfolioContent()
        .then((next) => {
          if (active) setContent(next);
        })
        .catch(() => undefined);
    void refresh();
    const unsubscribe = subscribePortfolio(refresh);
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const projects = content.projects;
  const slug = route.match(/^\/projects\/([^/]+)$/)?.[1];
  const project = projects.find((p) => p.slug === slug);
  const knownRoute =
    ["/", "/projects", "/about", "/timeline", "/contact"].includes(route) ||
    !!project;
  useEffect(() => {
    document.title = `${project?.title || navigation.find((n) => n.href === `#${route}`)?.title || "Portfolio"} | ${content.profile.name}`;
  }, [route, project, content.profile.name]);
  return (
    <EditorBridge content={content} onPreview={setContent}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        본문으로 바로 가기
      </a>
      <Header
        profile={content.profile}
        route={route}
        onCommand={() => setCommandOpen(true)}
      />
      <main id="main-content" tabIndex={-1}>
        <div className="terminal-shell page-width">
          <Terminal route={route} />
        </div>
        {project ? (
          <ProjectDetail project={project} />
        ) : route === "/projects" ? (
          <Projects projects={projects} />
        ) : route === "/about" ? (
          <About content={content} projects={projects} />
        ) : route === "/timeline" ? (
          <>
            <div className="page-width standalone-heading">
              <p className="eyebrow">
                <Icon name="branch" />
                TIMELINE & DOCS
              </p>
              <h1>
                작업의 흐름을,
                <br />
                <em>기록으로 남깁니다.</em>
              </h1>
              <p>프로젝트별 구현 과정과 검증 근거를 한곳에서 살펴보세요.</p>
            </div>
            <Timeline projects={projects} full />
          </>
        ) : route === "/contact" ? (
          <Contact profile={content.profile} />
        ) : knownRoute ? (
          <Home profile={content.profile} projects={projects} />
        ) : (
          <section className="page-width not-found">
            <p className="eyebrow">404 / PAGE NOT FOUND</p>
            <h1>페이지를 찾을 수 없습니다.</h1>
            <a className="button primary" href="#/projects">
              프로젝트 목록으로 <Icon name="arrow" />
            </a>
          </section>
        )}
      </main>
      <Footer profile={content.profile} />
      {commandOpen && (
        <CommandMenu
          projects={projects}
          onClose={() => setCommandOpen(false)}
        />
      )}
    </EditorBridge>
  );
}

export default App;
