import { useEffect, useState, type FormEvent } from "react";
import type { PortfolioContent } from "../../src/types/content";
import {
  addProject,
  archiveProject,
  restoreProject,
  moveProject,
  emptyProjectInput,
  type NewProject,
} from "../../shared/editor";

export function ProjectManager({
  content,
  disabled,
  onChange,
  onEdit,
  onPending,
}: {
  content: PortfolioContent;
  disabled: boolean;
  onChange: (
    next: PortfolioContent,
    message: string,
    focusSlug?: string,
  ) => void;
  onEdit: (slug: string) => void;
  onPending: (pending: boolean) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState<NewProject>({ ...emptyProjectInput });
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const hasInput = Object.values(input).some((value) => value.trim());
  useEffect(() => {
    onPending(hasInput);
    return () => onPending(false);
  }, [hasInput, onPending]);
  function run(
    action: () => PortfolioContent,
    message: string,
    focusSlug?: string,
  ) {
    try {
      const next = action();
      onChange(next, message, focusSlug);
      setError("");
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "프로젝트를 변경하지 못했습니다.",
      );
      return false;
    }
  }
  function create(event: FormEvent) {
    event.preventDefault();
    if (
      run(
        () => addProject(content, input),
        "프로젝트를 추가했습니다. 발행 전 미리보기를 확인해 주세요.",
        input.slug.trim(),
      )
    ) {
      setInput({ ...emptyProjectInput });
      setAdding(false);
    }
  }
  const inputs: Array<{
    key: keyof NewProject;
    label: string;
    placeholder?: string;
    required?: boolean;
    multiline?: boolean;
    max?: number;
  }> = [
    { key: "title", label: "프로젝트 이름", required: true, max: 120 },
    {
      key: "slug",
      label: "프로젝트 주소",
      placeholder: "my-project",
      required: true,
      max: 80,
    },
    { key: "subtitle", label: "한 줄 소개", max: 300 },
    {
      key: "description",
      label: "프로젝트 설명",
      multiline: true,
      placeholder: "문단마다 줄을 바꿔 입력하세요.",
    },
    {
      key: "technologies",
      label: "기술 스택",
      placeholder: "React, TypeScript, FastAPI",
      max: 3000,
    },
    { key: "category", label: "분류", placeholder: "예: WEB APP", max: 120 },
    {
      key: "role",
      label: "담당 역할",
      placeholder: "확인된 역할만 입력",
      max: 120,
    },
    {
      key: "period",
      label: "참여 기간",
      placeholder: "확인된 기간만 입력",
      max: 120,
    },
  ];
  return (
    <section className="cms-project-manager" aria-label="프로젝트 관리">
      <div className="cms-manager-heading">
        <h2>프로젝트 관리</h2>
        <span>{content.projects.length}개 노출</span>
      </div>
      <p>
        목록 순서가 메인·프로젝트 페이지에 반영됩니다. 추가·삭제·이동 후 상단의
        발행을 눌러 적용하세요.
      </p>
      <button
        className="cms-add-project"
        disabled={disabled || adding}
        onClick={() => {
          setAdding(true);
          setError("");
        }}
      >
        ＋ 프로젝트 추가
      </button>
      {adding && (
        <form
          className="cms-project-form"
          onSubmit={create}
          aria-label="새 프로젝트"
        >
          <h3>새 프로젝트</h3>
          {inputs.map((item) => (
            <div key={item.key}>
              <label htmlFor={"new-project-" + item.key}>
                {item.label}
                {item.required ? " *" : ""}
              </label>
              {item.multiline ? (
                <textarea
                  id={"new-project-" + item.key}
                  value={input[item.key]}
                  disabled={disabled}
                  maxLength={12000}
                  onChange={(e) =>
                    setInput({ ...input, [item.key]: e.target.value })
                  }
                  rows={5}
                />
              ) : (
                <input
                  id={"new-project-" + item.key}
                  value={input[item.key]}
                  disabled={disabled}
                  required={item.required}
                  maxLength={item.max ?? 12000}
                  placeholder={item.placeholder}
                  onChange={(e) =>
                    setInput({ ...input, [item.key]: e.target.value })
                  }
                />
              )}
              {item.key === "slug" && (
                <small>
                  영문 소문자·숫자·하이픈 사용. 생성 후 주소는 고정됩니다.
                </small>
              )}
            </div>
          ))}
          <div className="cms-row-actions">
            <button type="submit" disabled={disabled}>
              추가하기
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setInput({ ...emptyProjectInput });
                setAdding(false);
                setError("");
              }}
            >
              추가 취소
            </button>
          </div>
          <small>
            입력하지 않은 역할·성과·연혁은 자동으로 채우지 않습니다.
          </small>
        </form>
      )}
      {error && (
        <p className="cms-error" role="alert">
          {error}
        </p>
      )}
      <ol className="cms-project-list" aria-label="프로젝트 노출 순서">
        {content.projects.map((project, index) => (
          <li key={project.slug}>
            <div className="cms-project-row">
              <span className="cms-order">{index + 1}</span>
              <button
                className="cms-project-title"
                disabled={disabled}
                onClick={() => onEdit(project.slug)}
              >
                {project.title}
              </button>
            </div>
            <div className="cms-row-actions">
              <button
                disabled={disabled || index === 0}
                aria-label={project.title + " 위로 이동"}
                onClick={() =>
                  run(
                    () => moveProject(content, project.slug, -1),
                    project.title + "을(를) 위로 이동했습니다.",
                  )
                }
              >
                ↑ 위로
              </button>
              <button
                disabled={disabled || index === content.projects.length - 1}
                aria-label={project.title + " 아래로 이동"}
                onClick={() =>
                  run(
                    () => moveProject(content, project.slug, 1),
                    project.title + "을(를) 아래로 이동했습니다.",
                  )
                }
              >
                ↓ 아래로
              </button>
              <button
                className="cms-delete"
                disabled={disabled}
                aria-label={project.title + " 삭제"}
                onClick={() => setDeleting(project.slug)}
              >
                삭제
              </button>
            </div>
            {deleting === project.slug && (
              <div
                className="cms-delete-confirm"
                role="group"
                aria-label={project.title + " 삭제 확인"}
              >
                <p>
                  ‘{project.title}’을(를) 삭제할까요? 발행하면 사이트에서
                  사라지며 휴지통에서 복원할 수 있습니다.
                </p>
                <div className="cms-row-actions">
                  <button
                    disabled={disabled}
                    onClick={() => {
                      if (
                        run(
                          () => archiveProject(content, project.slug),
                          project.title +
                            "을(를) 휴지통으로 옮겼습니다. 발행하면 적용됩니다.",
                        )
                      )
                        setDeleting(null);
                    }}
                  >
                    휴지통으로 이동
                  </button>
                  <button disabled={disabled} onClick={() => setDeleting(null)}>
                    취소
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
      {!content.projects.length && (
        <p className="cms-empty">
          노출 중인 프로젝트가 없습니다. 새 프로젝트를 추가하거나 휴지통에서
          복원하세요.
        </p>
      )}
      <details className="cms-trash">
        <summary>휴지통 ({content.archivedProjects?.length ?? 0})</summary>
        <p>
          복원하면 목록 마지막에 추가됩니다. 발행 후 사이트에 다시 표시됩니다.
        </p>
        {(content.archivedProjects ?? []).map((project) => (
          <div className="cms-trash-row" key={project.slug}>
            <span>{project.title}</span>
            <button
              disabled={disabled}
              aria-label={project.title + " 복원"}
              onClick={() =>
                run(
                  () => restoreProject(content, project.slug),
                  project.title + "을(를) 복원했습니다.",
                )
              }
            >
              복원
            </button>
          </div>
        ))}
      </details>
    </section>
  );
}
