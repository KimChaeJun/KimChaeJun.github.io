import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClient, useCurrentUser } from "sanity";
import { cmsConfig } from "../../src/lib/cmsConfig";
import type { PortfolioContent } from "../../src/types/content";
import {
  fieldId,
  isPortfolioContent,
  setText,
  setRoleTags,
  textFields,
  trustedMessage,
} from "../../shared/editor";
import { roleTagOptions } from "../../src/data/roleTags";
import "./editor.css";

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
  const [busy, setBusy] = useState(false);
  const [text, setTextInput] = useState("");
  const [route, setRoute] = useState("/");
  const [mobile, setMobile] = useState(false);
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
        const id = fieldId(event.data.path);
        const match = fields.find((f) => fieldId(f.path) === id);
        if (match) {
          setSelected(id);
          setGroup(
            match.path[0] === "projects"
              ? "project:" + match.path[1]
              : String(match.path[0]),
          );
        }
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [preview, fields]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
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
    if (!saved || !draft || !dirty || error) return;
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
        ? f.path[0] === "projects" && f.path[1] === Number(value.split(":")[1])
        : f.path[0] === value,
    );
    if (first) setSelected(fieldId(first.path));
  }
  const visible = fields.filter((f) =>
    group.startsWith("project:")
      ? f.path[0] === "projects" && f.path[1] === Number(group.split(":")[1])
      : f.path[0] === group,
  );
  const roleTarget =
    group === "profile"
      ? draft?.profile
      : group.startsWith("project:")
        ? draft?.projects[Number(group.split(":")[1])]
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
            disabled={busy || !dirty}
            onClick={() => {
              if (saved) {
                setDraft(saved.content);
                setTextInput("");
                setError("");
                setStatus("발행 전 변경을 취소했습니다.");
              }
            }}
          >
            변경 취소
          </button>
          <button
            className="cms-publish"
            disabled={busy || !dirty || !!error}
            onClick={publish}
          >
            {busy ? "처리 중…" : "발행"}
          </button>
        </div>
      </header>
      <div className="cms-body">
        <aside className="cms-sidebar">
          <h2>문구를 선택해 수정하세요</h2>
          <p>
            오른쪽 화면의 점선 문구를 클릭하거나 아래 목록에서 선택하세요. 발행
            전에는 방문자에게 보이지 않습니다.
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
                {draft.projects.map((p, i) => (
                  <option key={p.slug} value={"project:" + i}>
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
                                : Number(group.split(":")[1]),
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
            disabled={busy || dirty}
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
