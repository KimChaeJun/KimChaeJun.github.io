import { useRef, useState, type ReactNode } from "react";
import type { TimelineProject } from "../data/timelineProjects";
import type { ProjectMedia } from "../../shared/media";
import { Editable } from "./Editable";
import { getRoleTags } from "../data/roleTags";
import "./projectShowcase.css";

export function MediaFrame({
  item,
  eager = false,
}: {
  item: ProjectMedia;
  eager?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  return (
    <div className="showcase-frame">
      <div className="showcase-browser" aria-hidden="true">
        <span>● ● ●</span>
        <span>
          {item.kind === "video" ? "PROJECT WALKTHROUGH" : "PROJECT MEDIA"}
        </span>
        <span>↗</span>
      </div>
      {failed ? (
        <div className="showcase-error">
          자료를 불러오지 못했습니다.{" "}
          <a href={item.src} target="_blank" rel="noreferrer">
            원본 열기 ↗
          </a>
        </div>
      ) : item.kind === "video" ? (
        <video
          key={item.src}
          src={item.src}
          controls
          playsInline
          preload="metadata"
          aria-label={item.alt}
          onError={() => setFailed(true)}
        />
      ) : (
        <button
          className="showcase-expand"
          aria-label={item.title + " 화면 크게 보기"}
          onClick={() => dialog.current?.showModal()}
        >
          <img
            src={item.src}
            alt={item.alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
          />
          <span className="showcase-expand-hint">화면 크게 보기 ↗</span>
        </button>
      )}
      {item.kind === "image" && (
        <dialog
          ref={dialog}
          className="showcase-dialog"
          aria-label={item.title + " 원본 화면"}
          onClick={(e) => {
            if (e.target === e.currentTarget) dialog.current?.close();
          }}
        >
          <div className="showcase-dialog-bar">
            <strong>{item.title}</strong>
            <button
              autoFocus
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="확대 화면 닫기"
            >
              닫기 ×
            </button>
          </div>
          <div className="showcase-dialog-body">
            <img src={item.src} alt={item.alt} loading="lazy" />
            {item.description && <p>{item.description}</p>}
          </div>
        </dialog>
      )}
    </div>
  );
}
export function ProjectIntro({
  project,
  architecture,
  onDownload,
}: {
  project: TimelineProject;
  architecture: ReactNode;
  onDownload: () => void;
}) {
  const media = project.media ?? [],
    lead = media[0];
  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  return (
    <>
      <section className={"story-hero" + (lead ? " story-has-media" : "")}>
        <div className="story-hero-copy">
          <p className="eyebrow">{project.category || "PROJECT STORY"}</p>
          <h1>
            <Editable scope={project.slug} value={project.title} />
            <span>.</span>
          </h1>
          <p className="story-subtitle">
            <Editable scope={project.slug} value={project.subtitle} />
          </p>
          <div className="story-roles">
            {getRoleTags(project.role, project.roleTags).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="story-facts">
            {project.period && (
              <div>
                <span>참여 기간</span>
                <strong>
                  <Editable scope={project.slug} value={project.period} />
                </strong>
              </div>
            )}
            {project.award && (
              <div>
                <span>성과</span>
                <strong>
                  <Editable scope={project.slug} value={project.award} />
                </strong>
              </div>
            )}
          </div>
          <div className="story-actions">
            {media.length > 1 && (
              <button
                className="button primary"
                onClick={() => scroll("project-screens")}
              >
                화면·결과 보기 ↓
              </button>
            )}
            <button className="button" onClick={onDownload}>
              프로젝트 기록 ↓
            </button>
          </div>
        </div>
        {(lead || project.pipeline.length > 0) && (
          <div className="story-hero-visual">
            {lead ? (
              <figure>
                <MediaFrame key={lead.src} item={lead} eager />
                <figcaption>
                  <strong>{lead.title}</strong>
                  {lead.description && <p>{lead.description}</p>}
                </figcaption>
              </figure>
            ) : (
              architecture
            )}
          </div>
        )}
      </section>
      <nav className="story-nav" aria-label="프로젝트 상세 목차">
        <span>EXPLORE PROJECT</span>
        {media.length > 1 && (
          <button onClick={() => scroll("project-screens")}>화면·결과</button>
        )}
        <button onClick={() => scroll("project-problem")}>문제와 접근</button>
        {!!project.aiCollaboration?.length && (
          <button onClick={() => scroll("project-ai")}>AI 협업</button>
        )}
        {!!project.technologyStack.length && (
          <button onClick={() => scroll("project-technology")}>
            기술과 구현
          </button>
        )}
        {!!project.timeline.length && (
          <button onClick={() => scroll("project-history")}>개발 기록</button>
        )}
      </nav>
    </>
  );
}
export function ProjectShowcase({ project }: { project: TimelineProject }) {
  const media = project.media ?? [];
  if (media.length < 2) return null;
  return (
    <section
      className="story-showcase"
      id="project-screens"
      aria-labelledby="project-screens-heading"
    >
      <div className="story-section-heading">
        <div>
          <p className="eyebrow">PROJECT VISUALS</p>
          <h2 id="project-screens-heading">화면과 결과로 보는 프로젝트</h2>
        </div>
        <p>
          각 자료에 담긴 기능과 결과를 살펴보세요.
          <br />
          이미지를 누르면 크게 볼 수 있습니다.
        </p>
      </div>
      <div className="story-screens">
        {media.slice(1).map((item, i) => (
          <article className="story-screen" key={item._key}>
            <div className="story-screen-copy">
              <span className="story-screen-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="eyebrow">
                {item.kind === "video" ? "WALKTHROUGH" : "VISUAL STORY"}
              </p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <MediaFrame key={item.src} item={item} />
          </article>
        ))}
      </div>
    </section>
  );
}
