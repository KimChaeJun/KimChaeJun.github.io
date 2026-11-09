import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PortfolioContent } from "../../src/types/content";
import {
  MAX_MEDIA,
  moveProjectMedia,
  removeProjectMedia,
  upsertProjectMedia,
  validateMediaFile,
  safeMediaUrl,
  type ProjectMedia,
} from "../../shared/media";

const empty = () => ({
  kind: "image" as ProjectMedia["kind"],
  title: "",
  description: "",
  alt: "",
  src: "",
});
export function MediaManager({
  content,
  disabled,
  onChange,
  onRoute,
  onPending,
  onUploading,
  upload,
}: {
  content: PortfolioContent;
  disabled: boolean;
  onChange: (next: PortfolioContent, message: string) => void;
  onRoute: (route: string) => void;
  onPending: (value: boolean) => void;
  onUploading: (value: boolean) => void;
  upload: (
    file: File,
    kind: ProjectMedia["kind"],
  ) => Promise<{ url: string; _id: string }>;
}) {
  const [slug, setSlug] = useState(content.projects[0]?.slug ?? "");
  const project =
    content.projects.find((p) => p.slug === slug) ?? content.projects[0];
  const [input, setInput] = useState(empty);
  const [editing, setEditing] = useState<ProjectMedia | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const pending = adding;
  useEffect(() => {
    onPending(pending);
    return () => onPending(false);
  }, [pending, onPending]);
  function reset() {
    setInput(empty());
    setFile(null);
    setEditing(null);
    setAdding(false);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  }
  function run(action: () => PortfolioContent, message: string) {
    try {
      onChange(action(), message);
      setError("");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "자료를 수정하지 못했습니다.");
      return false;
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!project || disabled) return;
    setError("");
    if (!input.title.trim() || !input.alt.trim()) {
      setError("제목과 화면 대체 설명을 입력하세요.");
      return;
    }
    if (!file && !safeMediaUrl(input.src)) {
      setError("파일을 선택하거나 HTTPS 파일 주소를 입력하세요.");
      return;
    }
    if (!editing && (project.media?.length ?? 0) >= MAX_MEDIA) {
      setError("자료는 최대 40개입니다.");
      return;
    }
    onUploading(true);
    try {
      let src = input.src.trim(),
        asset =
          editing?.src === src && editing.kind === input.kind
            ? (editing.image?.asset ?? editing.video?.asset)
            : undefined;
      if (file) {
        validateMediaFile(file, input.kind);
        const uploaded = await upload(file, input.kind);
        src = uploaded.url;
        asset = { _type: "reference", _ref: uploaded._id };
        // Preserve successful upload for retry if a later validation step fails.
        setInput((v) => ({ ...v, src }));
        setFile(null);
      }
      const item: ProjectMedia = {
        ...input,
        src,
        title: input.title.trim(),
        alt: input.alt.trim(),
        _key: editing?._key ?? "media-" + crypto.randomUUID(),
        ...(asset
          ? input.kind === "image"
            ? { image: { _type: "image" as const, asset } }
            : { video: { _type: "file" as const, asset } }
          : {}),
      };
      const next = upsertProjectMedia(content, project.slug, item);
      onChange(next, "자료를 미리보기에 반영했습니다. 확인 후 발행해 주세요.");
      onRoute("/projects/" + project.slug);
      reset();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "업로드하지 못했습니다. 연결과 로그인 상태를 확인하세요.",
      );
    } finally {
      onUploading(false);
    }
  }
  return (
    <section className="cms-media-manager" aria-label="이미지와 영상 관리">
      <h2>이미지·영상</h2>
      <p>
        첫 번째 자료가 대표 화면입니다. 위아래로 옮겨 상세 페이지의 순서를
        정하세요.
      </p>
      <label htmlFor="media-project">프로젝트 선택</label>
      <select
        id="media-project"
        value={project?.slug ?? ""}
        disabled={disabled || pending}
        onChange={(e) => {
          setSlug(e.target.value);
          onRoute("/projects/" + e.target.value);
          setError("");
          setDeleting("");
        }}
      >
        {content.projects.map((p) => (
          <option value={p.slug} key={p.slug}>
            {p.title}
          </option>
        ))}
      </select>
      {!project ? (
        <p>프로젝트를 먼저 추가해 주세요.</p>
      ) : (
        <>
          <button
            className="cms-add-project"
            disabled={
              disabled || adding || (project.media?.length ?? 0) >= MAX_MEDIA
            }
            onClick={() => {
              reset();
              setAdding(true);
            }}
          >
            ＋ 이미지·영상 추가
          </button>
          {adding && (
            <form
              className="cms-project-form"
              onSubmit={submit}
              aria-label="자료 편집"
            >
              <h3>{editing ? "자료 수정" : "새 자료"}</h3>
              <fieldset disabled={disabled} className="cms-media-fields">
                <label htmlFor="media-kind">자료 종류</label>
                <select
                  id="media-kind"
                  value={input.kind}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      kind: e.target.value as ProjectMedia["kind"],
                      src: "",
                    });
                    setFile(null);
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                >
                  <option value="image">이미지</option>
                  <option value="video">영상</option>
                </select>
                <label htmlFor="media-file">
                  {editing ? "파일 교체 (선택)" : "파일 업로드"}
                </label>
                <input
                  ref={fileInput}
                  id="media-file"
                  type="file"
                  accept={
                    input.kind === "image"
                      ? "image/png,image/jpeg,image/webp,image/gif,image/avif"
                      : "video/mp4,video/webm"
                  }
                  onChange={(e) => {
                    const chosen = e.target.files?.[0];
                    if (!chosen) {
                      setFile(null);
                      return;
                    }
                    try {
                      validateMediaFile(chosen, input.kind);
                      setFile(chosen);
                      setError("");
                    } catch (err) {
                      setError((err as Error).message);
                      setFile(null);
                      e.target.value = "";
                    }
                  }}
                />
                <small>
                  {input.kind === "image"
                    ? "PNG·JPG·WebP·GIF·AVIF / 15MB 이하"
                    : "MP4·WebM / 100MB 이하"}
                </small>
                <label htmlFor="media-src">또는 직접 파일 URL</label>
                <input
                  id="media-src"
                  value={input.src}
                  disabled={!!file}
                  placeholder="https://… (이미지 또는 MP4·WebM 파일)"
                  maxLength={2048}
                  onChange={(e) => setInput({ ...input, src: e.target.value })}
                />
                <label htmlFor="media-title">화면 제목 *</label>
                <input
                  id="media-title"
                  required
                  maxLength={160}
                  value={input.title}
                  onChange={(e) =>
                    setInput({ ...input, title: e.target.value })
                  }
                />
                <label htmlFor="media-description">기능·상황 설명</label>
                <textarea
                  id="media-description"
                  rows={4}
                  maxLength={3000}
                  value={input.description}
                  onChange={(e) =>
                    setInput({ ...input, description: e.target.value })
                  }
                />
                <label htmlFor="media-alt">화면 대체 설명 *</label>
                <input
                  id="media-alt"
                  required
                  maxLength={500}
                  placeholder="화면에서 확인할 수 있는 내용을 설명해 주세요."
                  value={input.alt}
                  onChange={(e) => setInput({ ...input, alt: e.target.value })}
                />
                <p className="cms-form-note">
                  파일은 공개 URL로 업로드됩니다. 페이지에는 발행 후 노출됩니다.
                </p>
                <div className="cms-row-actions">
                  <button type="submit">
                    {disabled ? "업로드 중…" : "미리보기에 반영"}
                  </button>
                  <button type="button" onClick={reset}>
                    입력 취소
                  </button>
                </div>
              </fieldset>
            </form>
          )}
          <ol className="cms-project-list cms-media-list">
            {(project.media ?? []).map((item, i, items) => (
              <li key={item._key}>
                {item.kind === "image" ? (
                  <img src={item.src} alt={item.alt} loading="lazy" />
                ) : (
                  <video
                    src={item.src}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={item.alt}
                  />
                )}
                <div className="cms-media-heading">
                  <span className="cms-order">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <strong>{item.title}</strong>
                  {i === 0 && <span className="cms-cover-badge">대표</span>}
                </div>
                <p>{item.description}</p>
                <div className="cms-row-actions">
                  <button
                    disabled={disabled || adding || i === 0}
                    aria-label={item.title + " 위로"}
                    onClick={() =>
                      run(
                        () =>
                          moveProjectMedia(
                            content,
                            project.slug,
                            item._key,
                            -1,
                          ),
                        "자료 순서를 변경했습니다.",
                      )
                    }
                  >
                    ↑ 위로
                  </button>
                  <button
                    disabled={disabled || adding || i === items.length - 1}
                    aria-label={item.title + " 아래로"}
                    onClick={() =>
                      run(
                        () =>
                          moveProjectMedia(content, project.slug, item._key, 1),
                        "자료 순서를 변경했습니다.",
                      )
                    }
                  >
                    ↓ 아래로
                  </button>
                  <button
                    disabled={disabled || adding}
                    onClick={() => {
                      setEditing(item);
                      setInput({
                        kind: item.kind,
                        title: item.title,
                        description: item.description,
                        alt: item.alt,
                        src: item.src,
                      });
                      setAdding(true);
                      setFile(null);
                      setError("");
                    }}
                  >
                    수정
                  </button>
                  <button
                    disabled={disabled || adding}
                    onClick={() => setDeleting(item._key)}
                  >
                    목록에서 제거
                  </button>
                </div>
                {deleting === item._key && (
                  <div className="cms-delete-confirm">
                    <p>
                      이 자료를 페이지에서 제거할까요? 파일 원본은 보관됩니다.
                    </p>
                    <div className="cms-row-actions">
                      <button
                        disabled={disabled}
                        onClick={() => {
                          if (
                            run(
                              () =>
                                removeProjectMedia(
                                  content,
                                  project.slug,
                                  item._key,
                                ),
                              "자료를 목록에서 제거했습니다. 발행 전에는 변경 취소로 복원할 수 있습니다.",
                            )
                          )
                            setDeleting("");
                        }}
                      >
                        제거 확인
                      </button>
                      <button
                        disabled={disabled}
                        onClick={() => setDeleting("")}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {!project.media?.length && (
            <p className="cms-empty">
              아직 등록한 화면이 없습니다. 첫 자료를 추가해 주세요.
            </p>
          )}
        </>
      )}
      {error && (
        <p className="cms-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
