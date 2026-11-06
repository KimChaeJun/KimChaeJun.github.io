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
  if (
    !Array.isArray(value.projects) ||
    !value.projects.length ||
    value.projects.length > 100
  )
    return false;
  const slugs = new Set();
  for (const project of value.projects) {
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
