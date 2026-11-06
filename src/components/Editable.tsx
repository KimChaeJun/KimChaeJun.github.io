import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PortfolioContent } from "../types/content";
import {
  fieldId,
  textFields,
  trustedMessage,
  isPortfolioContent,
  type FieldPath,
} from "../../shared/editor";
const Context = createContext<{
  content: PortfolioContent;
  active: boolean;
  select: (path: FieldPath) => void;
} | null>(null);
export function EditorBridge({
  content,
  onPreview,
  children,
}: {
  content: PortfolioContent;
  onPreview: (content: PortfolioContent) => void;
  children: ReactNode;
}) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (
      window.parent === window ||
      new URLSearchParams(location.search).get("edit") !== "1"
    )
      return;
    const receive = (event: MessageEvent) => {
      if (!trustedMessage(event, window.parent, location.origin)) return;
      if (
        event.data?.type === "portfolio:preview" &&
        isPortfolioContent(event.data.content)
      ) {
        onPreview(event.data.content);
        setActive(true);
      }
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "portfolio:ready" }, location.origin);
    return () => window.removeEventListener("message", receive);
  }, [onPreview]);
  const context = useMemo(
    () => ({
      content,
      active,
      select: (path: FieldPath) =>
        window.parent.postMessage(
          { type: "portfolio:select", path },
          location.origin,
        ),
    }),
    [content, active],
  );
  return <Context.Provider value={context}>{children}</Context.Provider>;
}
export function Editable({
  value,
  path,
  scope,
}: {
  value: string;
  path?: FieldPath;
  scope?: string;
}) {
  const context = useContext(Context);
  if (!context?.active) return <>{value}</>;
  const fields = textFields(context.content);
  const index = scope
    ? context.content.projects.findIndex((p) => p.slug === scope)
    : -1;
  const field = path
    ? fields.find((f) => fieldId(f.path) === fieldId(path))
    : fields.find(
        (f) =>
          f.value === value &&
          (index < 0 || (f.path[0] === "projects" && f.path[1] === index)),
      );
  if (!field) return <>{value}</>;
  return (
    <span
      className="editable-text"
      role="button"
      tabIndex={0}
      aria-label={(value || "빈 문구") + " 수정"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        context.select(field.path);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          context.select(field.path);
        }
      }}
    >
      {value || "문구 입력"}
    </span>
  );
}
export function Copy({ name }: { name: string }) {
  const context = useContext(Context);
  return (
    <Editable value={context?.content.copy[name] ?? ""} path={["copy", name]} />
  );
}
