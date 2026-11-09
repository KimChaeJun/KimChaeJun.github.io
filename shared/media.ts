export interface ProjectMedia {
  _key: string;
  kind: "image" | "video";
  src: string;
  title: string;
  description: string;
  alt: string;
  image?: { _type: "image"; asset: { _type: "reference"; _ref: string } };
  video?: { _type: "file"; asset: { _type: "reference"; _ref: string } };
}
export const MAX_MEDIA = 40;
export function safeMediaUrl(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    /[\s\\\u0000-\u001f]/.test(value)
  )
    return false;
  if (/^\/media\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function validProjectMedia(value: unknown): value is ProjectMedia[] {
  if (!Array.isArray(value) || value.length > MAX_MEDIA) return false;
  const keys = new Set<string>();
  return value.every((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item._key !== "string" ||
      !/^[a-zA-Z0-9_-]{1,100}$/.test(item._key) ||
      keys.has(item._key)
    )
      return false;
    keys.add(item._key);
    if (!["image", "video"].includes(item.kind) || !safeMediaUrl(item.src))
      return false;
    if (
      ![
        ["title", 160],
        ["description", 3000],
        ["alt", 500],
      ].every(
        ([key, max]) =>
          typeof item[key] === "string" && item[key].length <= Number(max),
      )
    )
      return false;
    if (!item.title.trim() || !item.alt.trim()) return false;
    if (item.asset !== undefined) return false;
    return ["image", "video"].every((kind) => {
      const wrapper = item[kind];
      return (
        wrapper === undefined ||
        (item.kind === kind &&
          wrapper?._type === (kind === "image" ? "image" : "file") &&
          wrapper.asset?._type === "reference" &&
          new RegExp(
            "^" + (kind === "image" ? "image" : "file") + "-[a-zA-Z0-9-]+$",
          ).test(wrapper.asset._ref))
      );
    });
  });
}
type MediaContent = {
  projects: Array<{ slug: string; media?: ProjectMedia[] }>;
};
function update<T extends MediaContent>(
  content: T,
  slug: string,
  change: (items: ProjectMedia[]) => ProjectMedia[],
): T {
  const index = content.projects.findIndex((p) => p.slug === slug);
  if (index < 0) throw new Error("프로젝트를 찾을 수 없습니다.");
  const items = change(content.projects[index].media ?? []);
  if (!validProjectMedia(items))
    throw new Error(
      "제목·대체 설명·파일 주소를 확인해 주세요. 자료는 최대 40개입니다.",
    );
  return {
    ...content,
    projects: content.projects.map((p, i) =>
      i === index ? { ...p, media: items } : p,
    ),
  };
}
export function upsertProjectMedia<T extends MediaContent>(
  content: T,
  slug: string,
  item: ProjectMedia,
): T {
  return update(content, slug, (items) =>
    items.some((m) => m._key === item._key)
      ? items.map((m) => (m._key === item._key ? item : m))
      : [...items, item],
  );
}
export function moveProjectMedia<T extends MediaContent>(
  content: T,
  slug: string,
  key: string,
  offset: -1 | 1,
): T {
  return update(content, slug, (items) => {
    const i = items.findIndex((m) => m._key === key);
    if (i < 0 || ![-1, 1].includes(offset))
      throw new Error("이동할 자료를 찾을 수 없습니다.");
    const next = [...items],
      to = i + offset;
    if (to >= 0 && to < items.length) [next[i], next[to]] = [next[to], next[i]];
    return next;
  });
}
export function removeProjectMedia<T extends MediaContent>(
  content: T,
  slug: string,
  key: string,
): T {
  return update(content, slug, (items) => {
    if (!items.some((m) => m._key === key))
      throw new Error("자료를 찾을 수 없습니다.");
    return items.filter((m) => m._key !== key);
  });
}
export function validateMediaFile(
  file: { name: string; type: string; size: number },
  kind: "image" | "video",
) {
  const allowed: Record<string, RegExp | undefined> =
    kind === "image"
      ? {
          "image/png": /\.png$/i,
          "image/jpeg": /\.jpe?g$/i,
          "image/webp": /\.webp$/i,
          "image/gif": /\.gif$/i,
          "image/avif": /\.avif$/i,
        }
      : { "video/mp4": /\.mp4$/i, "video/webm": /\.webm$/i };
  const rule = allowed[file.type];
  if (!rule?.test(file.name))
    throw new Error(
      kind === "image"
        ? "PNG·JPG·WebP·GIF·AVIF 이미지를 선택하세요."
        : "MP4·WebM 영상을 선택하세요.",
    );
  const limit = (kind === "image" ? 15 : 100) * 1024 * 1024;
  if (file.size <= 0 || file.size > limit)
    throw new Error(
      kind === "image"
        ? "이미지는 15MB 이하로 올려 주세요."
        : "영상은 100MB 이하로 올려 주세요.",
    );
}
