import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isPortfolioContent,
  archiveProject,
  restoreProject,
  textFields,
} from "../shared/editor.ts";
import {
  safeMediaUrl,
  validProjectMedia,
  upsertProjectMedia,
  moveProjectMedia,
  removeProjectMedia,
  validateMediaFile,
  type ProjectMedia,
} from "../shared/media.ts";
const projects = JSON.parse(
  readFileSync(
    new URL("../src/data/verifiedProjects.json", import.meta.url),
    "utf8",
  ),
);
const content = {
  profile: {
    name: "",
    role: "",
    intro: "",
    email: "",
    location: "",
    availability: "",
    skills: [],
  },
  projects,
  copy: {},
  experiences: [],
};
const one: ProjectMedia = {
  _key: "shot-one",
  kind: "image",
  src: "https://cdn.sanity.io/images/example/production/screen.png",
  title: "신청 화면",
  description: "입력 흐름",
  alt: "신청 정보를 입력하는 화면",
};
const two: ProjectMedia = {
  ...one,
  _key: "video-two",
  kind: "video",
  src: "https://cdn.sanity.io/files/example/production/demo.mp4",
  title: "시연 영상",
};
test("legacy content and empty media stay valid; malformed lists are rejected", () => {
  assert.ok(isPortfolioContent(content));
  assert.ok(validProjectMedia([]));
  for (const media of [
    null,
    {},
    [{}],
    [one, { ...one }],
    [{ ...one, title: "" }],
    [{ ...one, alt: "" }],
    [{ ...one, kind: "iframe" }],
    [{ ...one, asset: { _type: "reference", _ref: "portfolio" } }],
    Array(41).fill(one),
  ]) {
    assert.equal(
      isPortfolioContent({ ...content, projects: [{ ...projects[0], media }] }),
      false,
    );
  }
});
test("media URLs reject executable schemes, credentials, traversal and protocol-relative URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:image/svg+xml;base64,test",
    "file:///tmp/a",
    "http://insecure.test/a.png",
    "//evil.test/a.png",
    "/media/../secret",
    "https://user:pass@example.com/a.png",
    "https://example.com/\\a.png",
    "https://exa mple.com/a.png",
  ]) {
    assert.equal(safeMediaUrl(url), false, url);
  }
  assert.ok(safeMediaUrl("/media/sanjae-oneshot/product-step1.svg"));
  assert.ok(safeMediaUrl(one.src));
});
test("media mutations preserve project data and keep explicit empty lists after removal", () => {
  const slug = projects[0].slug;
  const a = upsertProjectMedia(content, slug, one),
    b = upsertProjectMedia(a, slug, two);
  assert.equal(content.projects[0].media, undefined);
  const swapped = moveProjectMedia(b, slug, two._key, -1);
  assert.deepEqual(swapped.projects[0].media, [two, one]);
  assert.deepEqual(swapped.projects[1], content.projects[1]);
  const edited = upsertProjectMedia(swapped, slug, {
    ...one,
    description: "직접 검증한 설명",
  });
  assert.equal(edited.projects[0].media[1].description, "직접 검증한 설명");
  assert.equal(edited.projects[0].media.length, 2);
  const archived = archiveProject(edited, slug),
    restored = restoreProject(archived, slug);
  assert.deepEqual(restored.projects.at(-1).media, edited.projects[0].media);
  const empty = removeProjectMedia(
    removeProjectMedia(edited, slug, one._key),
    slug,
    two._key,
  );
  assert.deepEqual(empty.projects[0].media, []);
  assert.ok(isPortfolioContent(empty));
  assert.throws(() => moveProjectMedia(b, slug, "missing", 1));
  assert.throws(() => upsertProjectMedia(b, "missing", one));
  assert.throws(() =>
    upsertProjectMedia(b, slug, { ...one, src: "javascript:alert(1)" }),
  );
  assert.equal(
    textFields(b).some((f) => f.path.includes("media")),
    false,
  );
});
test("file upload only accepts supported formats within the advertised limits", () => {
  validateMediaFile(
    { name: "screen.webp", type: "image/webp", size: 100 },
    "image",
  );
  validateMediaFile(
    { name: "demo.mp4", type: "video/mp4", size: 100 },
    "video",
  );
  for (const file of [
    { name: "code.svg", type: "image/svg+xml", size: 100 },
    { name: "fake.exe", type: "image/png", size: 100 },
    { name: "huge.png", type: "image/png", size: 16 * 1024 * 1024 },
    { name: "empty.png", type: "image/png", size: 0 },
  ])
    assert.throws(() => validateMediaFile(file, "image"));
  assert.throws(() =>
    validateMediaFile(
      { name: "demo.mp4", type: "video/mp4", size: 101 * 1024 * 1024 },
      "video",
    ),
  );
});
