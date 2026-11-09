import { MediaManager } from "./MediaManager";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClient, useCurrentUser } from "sanity";
import { cmsConfig } from "../../src/lib/cmsConfig";
import type { PortfolioContent } from "../../src/types/content";
import {
  fieldId,
  rebaseProjectField,
  isPortfolioContent,
  setText,
  setRoleTags,
  textFields,
  trustedMessage,
} from "../../shared/editor";
import { roleTagOptions } from "../../src/data/roleTags";
import "./editor.css";
import { ProjectManager } from "./ProjectManager";

type Document = { _id: string; _rev: string; content: PortfolioContent };
const labels: Record<string, string> = {
  profile: "프로필",
  copy: "홈페이지 문구",
  projects: "프로젝트",
  name: "이름",
  role: "역할",
  intro: "소개",
  email: "이메일",
  location: "활동 지역",
  availability: "현재 상태",
  github: "GitHub",
  linkedin: "LinkedIn",
  skills: "기술",
  title: "제목",
  subtitle: "한 줄 소개",
  category: "분류",
  year: "연도",
  period: "참여 기간",
  award: "수상",
  summaryLines: "요약",
  overviewLines: "프로젝트 설명",
  tags: "대표 기술",
  roles: "개인 기여",
  roleTags: "역할 태그",
  technologyStack: "기술 구성",
  metrics: "성과 수치",
  pipeline: "처리 흐름",
  improvements: "개선 기록",
  timeline: "연혁",
  aiCollaboration: "AI 협업 사례",
  tools: "사용한 AI 도구",
  stage: "활용 단계",
  problem: "문제 상황",
  approach: "AI와 진행한 작업",
  humanReview: "나의 판단·검토",
  outcome: "결과와 한계",
  description: "설명",
  technologies: "기술 이름",
  value: "값",
  label: "항목",
  note: "근거",
  before: "개선 전",
  after: "개선 후",
  evidence: "검증 근거",
  date: "날짜",
  heroLead: "메인 제목 1",
  heroMiddle: "메인 제목 2",
  heroAccent: "메인 강조 문구",
  aboutLead: "소개 제목 1",
  aboutMiddle: "소개 제목 2",
  aboutAccent: "소개 강조 문구",
  projectHeading: "프로젝트 섹션 제목",
  contactLead: "연락 배너 제목",
  contactAccent: "연락 배너 강조",
  contactDescription: "연락 배너 설명",
  contactPageLead: "연락 페이지 제목",
  contactPageAccent: "연락 페이지 강조",
  contactPageDescription: "연락 페이지 설명",
  footer: "하단 문구",
};
export function HomepageEditor() {
  const baseClient = useClient({ apiVersion: cmsConfig.apiVersion });
  const client = useMemo(
    () => baseClient.withConfig({ useCdn: false, perspective: "published" }),
    [baseClient],
  );
  const user = useCurrentUser();
  const [saved, setSaved] = useState<Document | null>(null);
  const [draft, setDraft] = useState<PortfolioContent | null>(null);
  const [selected, setSelected] = useState('["profile","intro"]');
  const [group, setGroup] = useState("profile");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [working, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const busy = working || uploading;
  const [mediaFormPending, setMediaFormPending] = useState(false);
  const [text, setTextInput] = useState("");
  const [route, setRoute] = useState("/");
  const [mobile, setMobile] = useState(false);
  const [mode, setMode] = useState<"text" | "projects" | "media">("text");
  const [projectFormPending, setProjectFormPending] = useState(false);
  const [managerVersion, setManagerVersion] = useState(0);
  const [previewVersion, setPreviewVersion] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const dirty =
    !!saved &&
    !!draft &&
    JSON.stringify(saved.content) !== JSON.stringify(draft);
  const fields = useMemo(() => textFields(draft), [draft]);
  const field = fields.find((f) => fieldId(f.path) === selected);
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const doc = await client.fetch<Document | null>("*[_id == $id][0]", {
        id: cmsConfig.documentId,
      });
      if (!doc || !isPortfolioContent(doc.content))
        throw new Error("초기 콘텐츠를 불러오지 못했습니다.");
      setSaved(doc);
      setDraft(doc.content);
      setGroup("profile");
      setSelected('["profile","intro"]');
      setTextInput(doc.content.profile.intro);
      setStatus("발행된 콘텐츠를 불러왔습니다.");
    } catch {
      setError(
        "콘텐츠를 불러오지 못했습니다. 네트워크 연결과 프로젝트 접근 권한을 확인한 뒤 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }, [client]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    setTextInput(field?.value ?? "");
  }, [selected, field?.value]);
  const preview = useCallback(() => {
    if (draft)
      frame.current?.contentWindow?.postMessage(
        { type: "portfolio:preview", content: draft },
        location.origin,
      );
  }, [draft]);
  useEffect(() => {
    preview();
    const receive = (event: MessageEvent) => {
      if (!trustedMessage(event, frame.current?.contentWindow, location.origin))
        return;
      if (event.data?.type === "portfolio:ready") preview();
      if (event.data?.type === "portfolio:select") {
        if (busy || mediaFormPending || projectFormPending) return;
        const id = fieldId(event.data.path);
        const match = fields.find((f) => fieldId(f.path) === id);
        if (match) {
          if (
            match.path[0] === "projects" &&
            event.data.projectSlug !==
              draft?.projects[Number(match.path[1])]?.slug
          )
            return;
          setMode("text");
          setSelected(id);
          setGroup(
            match.path[0] === "projects"
              ? "project:" + draft?.projects[Number(match.path[1])]?.slug
              : String(match.path[0]),
          );
        }
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [preview, fields, draft, busy, mediaFormPending, projectFormPending]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty || projectFormPending || mediaFormPending) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, projectFormPending, mediaFormPending]);
  function change(value: string) {
    setTextInput(value);
    setError("");
    setStatus("");
    if (!draft || !field) return;
    try {
      setDraft(setText(draft, field.path, value));
    } catch (e) {
      setError(e instanceof Error ? e.message : "문구를 확인해 주세요.");
    }
  }
  async function publish() {
    if (
      !saved ||
      !draft ||
      !dirty ||
      error ||
      projectFormPending ||
      mediaFormPending
    )
      return;
    setBusy(true);
    setError("");
    try {
      if (!isPortfolioContent(draft))
        throw new Error("콘텐츠 형식이 올바르지 않습니다.");
      const next = await client
        .patch(saved._id)
        .ifRevisionId(saved._rev)
        .set({ content: draft })
        .commit<Document>();
      setSaved(next);
      setDraft(next.content);
      setStatus("발행했습니다. 방문자 화면에도 반영됩니다.");
    } catch (e) {
      const conflict = (e as { statusCode?: number }).statusCode === 409;
      setError(
        conflict
          ? "다른 창에서 콘텐츠가 변경되었습니다. 작성 중인 문구를 복사해 보관한 뒤 최신 내용을 다시 불러오세요."
          : "발행하지 못했습니다. 로그인·수정 권한과 네트워크를 확인해 주세요. 작성한 내용은 이 화면에 유지됩니다.",
      );
    } finally {
      setBusy(false);
    }
  }
  function chooseGroup(value: string) {
    setGroup(value);
    const first = fields.find((f) =>
      value.startsWith("project:")
        ? f.path[0] === "projects" &&
          f.path[1] ===
            draft?.projects.findIndex((p) => p.slug === value.slice(8))
        : f.path[0] === value,
    );
    if (first) setSelected(fieldId(first.path));
  }
  function editProject(slug: string) {
    if (!draft) return;
    const index = draft.projects.findIndex((p) => p.slug === slug);
    if (index < 0) return;
    setMode("text");
    setGroup("project:" + slug);
    setSelected(fieldId(["projects", index, "title"]));
    setRoute("/projects/" + slug);
  }
  function applyProjects(
    next: PortfolioContent,
    message: string,
    focusSlug?: string,
  ) {
    if (!draft) return;
    const path = rebaseProjectField(draft, next, JSON.parse(selected));
    setSelected(fieldId(path));
    setTextInput(
      textFields(next).find((f) => fieldId(f.path) === fieldId(path))?.value ??
        "",
    );
    setGroup(
      path[0] === "projects"
        ? "project:" + next.projects[Number(path[1])].slug
        : String(path[0]),
    );
    if (
      draft.projects.some((p) => !next.projects.some((n) => n.slug === p.slug))
    ) {
      setRoute("/projects");
      setPreviewVersion((v) => v + 1);
    }
    if (focusSlug) {
      const index = next.projects.findIndex((p) => p.slug === focusSlug);
      setGroup("project:" + focusSlug);
      setSelected(fieldId(["projects", index, "title"]));
      setTextInput(next.projects[index].title);
      setRoute("/projects/" + focusSlug);
      setMode("text");
    }
    setDraft(next);
    setStatus(message);
    setError("");
  }
  const visible = fields.filter((f) =>
    group.startsWith("project:")
      ? f.path[0] === "projects" &&
        f.path[1] ===
          draft?.projects.findIndex((p) => p.slug === group.slice(8))
      : f.path[0] === group,
  );
  const roleTarget =
    group === "profile"
      ? draft?.profile
      : group.startsWith("project:")
        ? draft?.projects.find((p) => p.slug === group.slice(8))
        : null;
  const label = (path: Array<string | number>) =>
    path
      .slice(path[0] === "projects" ? 2 : 1)
      .map((k) => (typeof k === "number" ? String(k + 1) : labels[k] || k))
      .join(" · ");
  return (
    <div className="cms-editor">
      <header className="cms-toolbar">
        <div>
          <strong>홈페이지 편집</strong>
          <span>
            {user?.name || "관리자"} ·{" "}
            {dirty ? "발행 전 변경 있음" : "모든 변경 발행됨"}
          </span>
        </div>
        <div className="cms-actions">
          <a href="/" target="_blank" rel="noreferrer">
            사이트 열기 ↗
          </a>
          <button
            disabled={
              busy || (!dirty && !projectFormPending && !mediaFormPending)
            }
            onClick={() => {
              if (saved) {
                applyProjects(saved.content, "발행 전 변경을 취소했습니다.");
                setManagerVersion((v) => v + 1);
                setProjectFormPending(false);
                setMediaFormPending(false);
                setError("");
                setStatus("발행 전 변경을 취소했습니다.");
              }
            }}
          >
            변경 취소
          </button>
          <button
            className="cms-publish"
            disabled={
              busy ||
              !dirty ||
              !!error ||
              projectFormPending ||
              mediaFormPending
            }
            onClick={publish}
          >
            {busy ? "처리 중…" : "발행"}
          </button>
        </div>
      </header>
      <div className="cms-body">
        <aside className="cms-sidebar">
          <div
            className="cms-mode-tabs"
            role="tablist"
            aria-label="관리자 작업"
          >
            <button
              role="tab"
              id="cms-text-tab"
              aria-selected={mode === "text"}
              aria-controls="cms-text-panel"
              disabled={busy || mediaFormPending || projectFormPending}
              onClick={() => setMode("text")}
            >
              문구 편집
            </button>
            <button
              role="tab"
              id="cms-projects-tab"
              aria-selected={mode === "projects"}
              aria-controls="cms-projects-panel"
              disabled={busy || mediaFormPending || projectFormPending}
              onClick={() => setMode("projects")}
            >
              프로젝트 관리
            </button>
            <button
              role="tab"
              id="cms-media-tab"
              aria-selected={mode === "media"}
              aria-controls="cms-media-panel"
              disabled={busy || mediaFormPending || projectFormPending}
              onClick={() => setMode("media")}
            >
              이미지·영상
            </button>
          </div>
          <div
            role="tabpanel"
            id="cms-media-panel"
            aria-labelledby="cms-media-tab"
            hidden={mode !== "media"}
          >
            {draft && (
              <MediaManager
                key={managerVersion}
                content={draft}
                disabled={busy}
                onChange={applyProjects}
                onRoute={setRoute}
                onPending={setMediaFormPending}
                onUploading={setUploading}
                upload={async (file, kind) => {
                  const asset = await client.assets.upload(
                    kind === "image" ? "image" : "file",
                    file,
                    { filename: file.name, contentType: file.type },
                  );
                  return { url: asset.url, _id: asset._id };
                }}
              />
            )}
          </div>
          <div
            role="tabpanel"
            id="cms-projects-panel"
            aria-labelledby="cms-projects-tab"
            hidden={mode !== "projects"}
          >
            {draft && (
              <ProjectManager
                key={managerVersion}
                content={draft}
                disabled={busy}
                onChange={applyProjects}
                onEdit={editProject}
                onPending={setProjectFormPending}
              />
            )}
          </div>
          <div
            role="tabpanel"
            id="cms-text-panel"
            aria-labelledby="cms-text-tab"
            hidden={mode !== "text"}
          >
            <h2>문구를 선택해 수정하세요</h2>
            <p>
              오른쪽 화면의 점선 문구를 클릭하거나 아래 목록에서 선택하세요.
              발행 전에는 방문자에게 보이지 않습니다.
            </p>
            {draft && (
              <>
                <label htmlFor="cms-group">편집 영역</label>
                <select
                  id="cms-group"
                  value={group}
                  onChange={(e) => chooseGroup(e.target.value)}
                >
                  <option value="profile">프로필</option>
                  <option value="copy">홈페이지 문구</option>
                  {draft.projects.map((p) => (
                    <option key={p.slug} value={"project:" + p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <label htmlFor="cms-field">수정할 항목</label>
                <select
                  id="cms-field"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {visible.map((f) => (
                    <option key={fieldId(f.path)} value={fieldId(f.path)}>
                      {label(f.path)}
                    </option>
                  ))}
                </select>
                <label htmlFor="cms-text">
                  {field ? label(field.path) : "텍스트"}
                </label>
                <textarea
                  id="cms-text"
                  value={text}
                  maxLength={12000}
                  onChange={(e) => change(e.target.value)}
                  disabled={busy || !field}
                  rows={8}
                />
                {roleTarget && (
                  <fieldset className="cms-role-tags">
                    <legend>추가 역할 태그</legend>
                    {roleTagOptions.map((option) => (
                      <label key={option.value}>
                        <input
                          type="checkbox"
                          checked={
                            roleTarget.roleTags?.includes(option.value) ?? false
                          }
                          disabled={busy}
                          onChange={(e) => {
                            if (!draft) return;
                            const tags = e.target.checked
                              ? [...(roleTarget.roleTags ?? []), option.value]
                              : (roleTarget.roleTags ?? []).filter(
                                  (tag) => tag !== option.value,
                                );
                            setDraft(
                              setRoleTags(
                                draft,
                                group === "profile"
                                  ? null
                                  : draft.projects.findIndex(
                                      (p) => p.slug === group.slice(8),
                                    ),
                                tags,
                              ),
                            );
                            setStatus("");
                            setError("");
                          }}
                        />
                        {option.title}
                      </label>
                    ))}
                  </fieldset>
                )}
                <small>
                  프로젝트 주소와 코드 기록 기준은 고정됩니다. 확인된 내용만
                  입력해 주세요.
                </small>
              </>
            )}
          </div>
          {(projectFormPending || mediaFormPending) && (
            <p className="cms-form-note">
              작성 중인 프로젝트·자료를 반영하거나 입력 취소한 뒤 발행해 주세요.
            </p>
          )}
          {error && (
            <p className="cms-error" role="alert">
              {error}
            </p>
          )}
          <p className="cms-status" role="status">
            {status}
          </p>
          <button
            className="cms-reload"
            disabled={busy || dirty || projectFormPending || mediaFormPending}
            onClick={load}
          >
            최신 콘텐츠 다시 불러오기
          </button>
          {dirty && (
            <small>
              최신 내용을 불러오려면 작성한 문구를 보관한 후 변경을 취소하세요.
            </small>
          )}
        </aside>
        <section className="cms-preview" aria-label="홈페이지 미리보기">
          <div className="cms-preview-toolbar">
            <label>
              미리보기 페이지{" "}
              <select value={route} onChange={(e) => setRoute(e.target.value)}>
                <option value="/">메인</option>
                <option value="/about">소개·기술</option>
                <option value="/projects">프로젝트</option>
                <option value="/contact">연락처</option>
                {draft?.projects.map((p) => (
                  <option key={p.slug} value={"/projects/" + p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <button aria-pressed={mobile} onClick={() => setMobile((v) => !v)}>
              {mobile ? "데스크톱 보기" : "모바일 보기"}
            </button>
          </div>
          <iframe
            ref={frame}
            key={previewVersion}
            title="편집할 포트폴리오"
            src={"/?edit=1#" + route}
            onLoad={preview}
            className={mobile ? "cms-mobile" : ""}
          />
        </section>
      </div>
    </div>
  );
}
