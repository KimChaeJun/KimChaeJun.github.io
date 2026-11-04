import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const logos: Record<string, string> = {
  React: "react",
  TypeScript: "typescript-icon",
  Vite: "vite-icon",
  i18next: "i18next",
  Tauri: "tauri",
  Python: "python",
  FastAPI: "fastapi-icon",
  Pydantic: "pydantic-icon",
  SQLAlchemy: "sqlalchemy",
  PostgreSQL: "postgresql",
  Supabase: "supabase-icon",
  "Supabase Auth": "supabase-icon",
  "Supabase Storage": "supabase-icon",
  "OpenAI API": "openai-icon",
  "AWS ECS": "aws-ecs",
  "AWS Fargate": "aws-fargate",
  "Amazon CloudWatch": "aws-cloudwatch",
  Docker: "docker-icon",
  Nginx: "nginx",
  "GitHub Actions": "github-actions",
  Playwright: "playwright",
  "Chrome Extensions Manifest V3": "chrome",
  HTML: "html-5",
  CSS: "css-3",
  Electron: "electron",
  JavaScript: "javascript",
  "Node.js": "nodejs-icon",
  "C#": "c-sharp",
  "Windows Native Messaging": "microsoft-windows-icon",
  SQLite: "sqlite",
  FFmpeg: "ffmpeg-icon",
  PyTorch: "pytorch-icon",
  "Hugging Face Transformers": "hugging-face-icon",
  NumPy: "numpy",
  PowerShell: "powershell",
  pytest: "pytest",
  Vitest: "vitest",
  Git: "git-icon",
};

// Tools without a supplied brand mark use a symbol for their actual function.
const symbols: Record<string, ReactNode> = {
  OCR: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 8h10M7 12h7M7 16h5" /><path d="M1 12h3m16 0h3" /></>,
  ReportLab: <><path d="M14 3H5v18h14V8Zm0 0v5h5M8 17v-4m4 4v-6m4 6v-3" /></>,
  pypdf: <><path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6" /><path d="m8 8 1 1 2-2" /></>,
  "Amazon ECR": <><path d="m12 2 8 4v5l-8 4-8-4V6Zm-8 4 8 4 8-4m-8 4v5M4 15v4l8 3 8-3v-4M8 17v2m8-2v2" /></>,
  HTTPX: <><path d="M3 7h17l-4-4m5 14H4l4 4M7 11l-3 2 3 2m10-6 3 2-3 2" /></>,
  Uvicorn: <><rect x="3" y="3" width="18" height="8" rx="2" /><rect x="3" y="13" width="18" height="8" rx="2" /><path d="M6 7h2m-2 10h2m8-11-3 5h4l-3 6" /></>,
  kuromoji: <><path d="M3 4h14M10 2v3c0 6-3 10-8 12M5 8c2 4 5 6 9 8m0 5 4-11 4 11m-6-4h4" /></>,
  SudachiPy: <><path d="M12 6c-3-4 1-5 5-4-1 3-3 4-5 4" /><circle cx="12" cy="14" r="8" /><path d="M12 9v10m-4-7 8 5m0-5-8 5" /></>,
  "audio-separator": <><path d="M3 10v4m4-8v12m4-15v18m4-13v8m4-11v14m3-9v4" /></>,
};

export function TechnologyBadge({ name }: { name: string }) {
  const labelId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !labelRef.current) return;
    const button = buttonRef.current.getBoundingClientRect();
    const half = labelRef.current.offsetWidth / 2;
    const center = button.left + button.width / 2;
    const viewport = document.documentElement.clientWidth;
    setShift(Math.max(16 + half, Math.min(viewport - 16 - half, center)) - center);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dismiss = () => setOpen(false);
    const outside = (event: PointerEvent) => {
      if (!itemRef.current?.contains(event.target as Node)) dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", dismiss);
    const scroll = () => { if (!buttonRef.current?.matches(":focus-visible")) dismiss(); };
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [open]);

  return (
    <li
      className="technology-item"
      ref={itemRef}
      data-open={open || undefined}
      style={{ "--tooltip-shift": `${shift}px` } as CSSProperties}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setOpen(true); }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch" && !buttonRef.current?.matches(":focus-visible")) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        className="technology-button"
        type="button"
        aria-labelledby={labelId}
        onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
      >
        {logos[name] ? (
          <img className="technology-logo" src={`${import.meta.env.BASE_URL}icons/technology/${logos[name]}.svg`} width="30" height="30" alt="" loading="lazy" draggable="false" />
        ) : (
          <svg className="technology-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {symbols[name] ?? <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />}
          </svg>
        )}
        {name === "Supabase Auth" && <svg className="technology-submark" viewBox="0 0 16 16" aria-hidden="true"><path d="m8 1 5 2v5c0 3-5 6-5 6S3 11 3 8V3Zm-2 6 1.5 1.5L11 5" /></svg>}
        {name === "Supabase Storage" && <svg className="technology-submark" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h12v9H2Zm-1-4h14v4H1Zm5 7h4" /></svg>}
      </button>
      <span className="technology-tooltip" id={labelId} ref={labelRef} role="tooltip">{name}</span>
    </li>
  );
}
