export type FieldPath = Array<string | number>;
export type TextField = { path: FieldPath; value: string; label: string };
const blocked = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "slug",
  "timelineBasis",
  "skills",
  "roleTags",
  "archivedProjects",
]);
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function isPortfolioContent(value: unknown): boolean {
  if (!record(value) || !record(value.profile) || !record(value.copy))
    return false;
  const p = value.profile;
  if (
    !["name", "role", "intro", "email", "location", "availability"].every(
      (k) => typeof p[k] === "string",
    )
  )
    return false;
  if (!Array.isArray(p.skills) || !p.skills.every((x) => typeof x === "string"))
    return false;
  if (
    p.roleTags !== undefined &&
    (!Array.isArray(p.roleTags) ||
      !p.roleTags.every((x) => typeof x === "string"))
  )
    return false;
  for (const key of ["github", "linkedin"]) {
    const url = p[key];
    if (
      url !== undefined &&
      (typeof url !== "string" ||
        (url !== "" && !/^https:\/\/[^\s]+$/i.test(url)))
    )
      return false;
  }
  if (
    p.email &&
    (typeof p.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
  )
    return false;
  if (
    !Object.values(value.copy).every((x) => typeof x === "string") ||
    !Array.isArray(value.experiences)
  )
    return false;
  if (!Array.isArray(value.projects) || value.projects.length > 100)
    return false;
  if (
    value.archivedProjects !== undefined &&
    (!Array.isArray(value.archivedProjects) ||
      value.archivedProjects.length > 500)
  )
    return false;
  const slugs = new Set();
  for (const project of [
    ...value.projects,
    ...((value.archivedProjects as unknown[]) ?? []),
  ]) {
    if (
      !record(project) ||
      ![
        "slug",
        "title",
        "subtitle",
        "category",
        "role",
        "year",
        "period",
        "award",
      ].every((k) => typeof project[k] === "string")
    )
      return false;
    if (!/^[a-z0-9-]+$/.test(project.slug as string) || slugs.has(project.slug))
      return false;
    slugs.add(project.slug);
    for (const key of ["summaryLines", "overviewLines", "tags", "roleTags"]) {
      if (
        !Array.isArray(project[key]) ||
        !(project[key] as unknown[]).every((x) => typeof x === "string")
      )
        return false;
    }
    const groups: Record<string, string[]> = {
      roles: ["title", "description"],
      technologyStack: ["category", "description"],
      metrics: ["value", "label", "note"],
      pipeline: ["label", "description"],
      improvements: ["before", "after", "evidence"],
      timeline: ["date", "title", "description"],
    };
    for (const [key, keys] of Object.entries(groups)) {
      if (
        !Array.isArray(project[key]) ||
        !(project[key] as unknown[]).every(
          (x) => record(x) && keys.every((k) => typeof x[k] === "string"),
        )
      )
        return false;
    }
    if (
      !(project.technologyStack as Record<string, unknown>[]).every(
        (g) =>
          Array.isArray(g.technologies) &&
          g.technologies.every((x) => typeof x === "string"),
      )
    )
      return false;
    if (
      !(project.timeline as Record<string, string>[]).every((t) =>
        /^(\d{4}-\d{2}-\d{2}|\d{2}\.\d{2})$/.test(t.date),
      )
    )
      return false;
  }
  return true;
}
export function textFields(content: unknown): TextField[] {
  const result: TextField[] = [];
  function visit(value: unknown, path: FieldPath, depth: number) {
    if (depth > 12) return;
    if (typeof value === "string")
      result.push({ path, value, label: path.join(" / ") });
    else if (Array.isArray(value))
      value.forEach((item, index) => visit(item, [...path, index], depth + 1));
    else if (record(value))
      Object.entries(value).forEach(([key, item]) => {
        if (!key.startsWith("_") && !blocked.has(key))
          visit(item, [...path, key], depth + 1);
      });
  }
  visit(content, [], 0);
  return result;
}
export function fieldId(path: FieldPath): string {
  return JSON.stringify(path);
}
export function setText<T>(content: T, path: unknown, value: unknown): T {
  if (
    !Array.isArray(path) ||
    typeof value !== "string" ||
    value.length > 12000 ||
    !textFields(content).some((f) => fieldId(f.path) === fieldId(path))
  )
    throw new Error("수정할 수 없는 텍스트 필드입니다.");
  const next = structuredClone(content);
  let target: any = next;
  for (const key of path.slice(0, -1)) target = target[key];
  target[path[path.length - 1]] = value;
  if (!isPortfolioContent(next))
    throw new Error("이메일, URL 또는 날짜 형식을 확인해 주세요.");
  return next;
}
export function trustedMessage(
  event: { origin: string; source: unknown },
  source: unknown,
  origin: string,
): boolean {
  return !!source && event.source === source && event.origin === origin;
}
export function setRoleTags<T>(
  content: T,
  projectIndex: number | null,
  tags: string[],
): T {
  if (
    !isPortfolioContent(content) ||
    !Array.isArray(tags) ||
    tags.some((tag) => !["Full Stack Developer", "AI PM"].includes(tag))
  )
    throw new Error("지원하지 않는 역할 태그입니다.");
  const next = structuredClone(content) as T & {
    profile: { roleTags?: string[] };
    projects: Array<{ roleTags: string[] }>;
  };
  const target =
    projectIndex === null
      ? next.profile
      : Number.isInteger(projectIndex) && projectIndex >= 0
        ? next.projects[projectIndex]
        : undefined;
  if (!target) throw new Error("프로젝트를 찾을 수 없습니다.");
  target.roleTags = [...new Set(tags)];
  return next;
}
import type { TimelineProject } from "../src/data/timelineProjects";

type ProjectContent = {
  projects: TimelineProject[];
  archivedProjects?: TimelineProject[];
};
export type NewProject = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  technologies: string;
  role: string;
  period: string;
};
export const emptyProjectInput: NewProject = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  category: "",
  technologies: "",
  role: "",
  period: "",
};
function checkedProjects<T extends ProjectContent>(content: T): T {
  if (!isPortfolioContent(content))
    throw new Error("프로젝트 데이터 형식이 올바르지 않습니다.");
  return content;
}
export function addProject<T extends ProjectContent>(
  content: T,
  input: NewProject,
): T {
  checkedProjects(content);
  if (
    Object.keys(emptyProjectInput).some(
      (key) =>
        typeof input[key as keyof NewProject] !== "string" ||
        input[key as keyof NewProject].length > 12000,
    )
  )
    throw new Error("입력 내용을 확인해 주세요.");
  const title = input.title.trim(),
    slug = input.slug.trim();
  if (!title || title.length > 120)
    throw new Error("프로젝트 이름을 1~120자로 입력해 주세요.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80)
    throw new Error("주소에는 영문 소문자·숫자·하이픈을 사용해 주세요.");
  if (
    [...content.projects, ...(content.archivedProjects ?? [])].some(
      (p) => p.slug === slug,
    )
  )
    throw new Error("이미 사용 중인 주소입니다. 휴지통도 확인해 주세요.");
  if (content.projects.length >= 100)
    throw new Error("프로젝트는 최대 100개까지 노출할 수 있습니다.");
  const tags = [
    ...new Set(
      input.technologies
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  if (tags.length > 30 || tags.some((t) => t.length > 100))
    throw new Error("기술은 이름당 100자, 최대 30개까지 입력해 주세요.");
  const overviewLines = input.description
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const project: TimelineProject & { _key: string } = {
    _key: "project-" + slug,
    slug,
    title,
    subtitle: input.subtitle.trim(),
    category: input.category.trim(),
    role: input.role.trim(),
    roleTags: [],
    year: "",
    period: input.period.trim(),
    award: "",
    summaryLines: overviewLines.length
      ? overviewLines.slice(0, 2)
      : input.subtitle.trim()
        ? [input.subtitle.trim()]
        : [],
    overviewLines,
    tags,
    roles: [],
    metrics: [],
    pipeline: [],
    improvements: [],
    timeline: [],
    technologyStack: tags.length
      ? [
          {
            _key: "technologies",
            category: "Technologies",
            description: "",
            technologies: tags,
          } as TimelineProject["technologyStack"][number],
        ]
      : [],
  };
  return checkedProjects({
    ...content,
    projects: [...content.projects, project],
  });
}
export function moveProject<T extends ProjectContent>(
  content: T,
  slug: string,
  offset: -1 | 1,
): T {
  checkedProjects(content);
  const index = content.projects.findIndex((p) => p.slug === slug);
  if (index < 0 || (offset !== -1 && offset !== 1))
    throw new Error("이동할 프로젝트를 찾을 수 없습니다.");
  const target = index + offset;
  if (target < 0 || target >= content.projects.length) return content;
  const projects = [...content.projects];
  [projects[index], projects[target]] = [projects[target], projects[index]];
  return checkedProjects({ ...content, projects });
}
export function archiveProject<T extends ProjectContent>(
  content: T,
  slug: string,
): T {
  checkedProjects(content);
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) throw new Error("삭제할 프로젝트를 찾을 수 없습니다.");
  if ((content.archivedProjects?.length ?? 0) >= 500)
    throw new Error("휴지통이 가득 찼습니다.");
  return checkedProjects({
    ...content,
    projects: content.projects.filter((p) => p.slug !== slug),
    archivedProjects: [...(content.archivedProjects ?? []), project],
  });
}
export function restoreProject<T extends ProjectContent>(
  content: T,
  slug: string,
): T {
  checkedProjects(content);
  const project = content.archivedProjects?.find((p) => p.slug === slug);
  if (!project) throw new Error("복원할 프로젝트를 찾을 수 없습니다.");
  if (content.projects.length >= 100)
    throw new Error("프로젝트는 최대 100개까지 노출할 수 있습니다.");
  return checkedProjects({
    ...content,
    projects: [...content.projects, project],
    archivedProjects: content.archivedProjects?.filter((p) => p.slug !== slug),
  });
}
export function rebaseProjectField(
  previous: ProjectContent,
  next: ProjectContent,
  path: FieldPath,
): FieldPath {
  if (path[0] !== "projects") return path;
  const slug = previous.projects[Number(path[1])]?.slug;
  const index = next.projects.findIndex((p) => p.slug === slug);
  return index < 0
    ? ["profile", "intro"]
    : ["projects", index, ...path.slice(2)];
}
