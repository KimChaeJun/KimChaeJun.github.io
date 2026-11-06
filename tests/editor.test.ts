import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isPortfolioContent,
  setText,
  setRoleTags,
  textFields,
  trustedMessage,
  addProject,
  archiveProject,
  restoreProject,
  moveProject,
  rebaseProjectField,
  emptyProjectInput,
} from "../shared/editor.ts";
const projects = JSON.parse(
  readFileSync(
    new URL("../src/data/verifiedProjects.json", import.meta.url),
    "utf8",
  ),
);
const content = {
  profile: {
    name: "김채준",
    role: "Full Stack Developer",
    intro: "소개",
    email: "",
    location: "Seoul",
    availability: "",
    skills: [],
    github: "https://github.com/KimChaeJun",
  },
  projects,
  experiences: [],
  copy: { hero: "아이디어를 서비스로" },
};
test("8 verified records preserve unknown role, period, award and metrics", () => {
  assert.equal(projects.length, 8);
  for (const p of projects) {
    assert.equal(p.role, "");
    assert.equal(p.period, "");
    assert.equal(p.award, "");
    assert.deepEqual(p.metrics, []);
    assert.equal(p.timelineBasis, "code");
  }
  assert.ok(isPortfolioContent(content));
});
test("editing text creates a new content value and preserves untouched projects", () => {
  const edited = setText(content, ["projects", 0, "title"], "새 제목");
  assert.equal(edited.projects[0].title, "새 제목");
  assert.notEqual(content.projects[0].title, "새 제목");
  assert.deepEqual(edited.projects[1], content.projects[1]);
});
test("readonly fields, unknown paths and prototype paths are rejected", () => {
  for (const path of [
    ["projects", 0, "slug"],
    ["profile", "notAField"],
    ["__proto__", "polluted"],
    ["projects", 99, "title"],
  ]) {
    assert.throws(() => setText(content, path, "bad"));
  }
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.ok(!textFields(content).some((f) => f.path.includes("slug")));
});
test("unsafe URLs, malformed dates and oversized input cannot be published", () => {
  assert.throws(() =>
    setText(content, ["profile", "github"], "javascript:alert(1)"),
  );
  assert.throws(() =>
    setText(content, ["projects", 0, "timeline", 0, "date"], "unknown"),
  );
  assert.throws(() => setText(content, ["copy", "hero"], "x".repeat(12001)));
  assert.equal(
    isPortfolioContent({
      ...content,
      projects: [{ ...projects[0], timeline: null }],
    }),
    false,
  );
});
test("preview messages must match both source window and exact origin", () => {
  const parent = {},
    other = {};
  assert.ok(
    trustedMessage(
      { source: parent, origin: "https://kimchaejun.github.io" },
      parent,
      "https://kimchaejun.github.io",
    ),
  );
  assert.equal(
    trustedMessage(
      { source: other, origin: "https://kimchaejun.github.io" },
      parent,
      "https://kimchaejun.github.io",
    ),
    false,
  );
  assert.equal(
    trustedMessage(
      { source: parent, origin: "https://evil.example" },
      parent,
      "https://kimchaejun.github.io",
    ),
    false,
  );
  assert.equal(
    trustedMessage(
      { source: null, origin: "https://kimchaejun.github.io" },
      null,
      "https://kimchaejun.github.io",
    ),
    false,
  );
});
test("AI PM remains opt-in and unsupported role tag writes are rejected", () => {
  const edited = setRoleTags(content, 0, ["AI PM", "AI PM"]);
  assert.deepEqual(edited.projects[0].roleTags, ["AI PM"]);
  assert.deepEqual(content.projects[0].roleTags, []);
  assert.throws(() => setRoleTags(content, 99, ["AI PM"]));
  assert.throws(() => setRoleTags(content, null, ["Administrator"]));
});

const newInput = {
  ...emptyProjectInput,
  title: "새 프로젝트",
  slug: "new-project",
  subtitle: "프로젝트 소개",
  description: "첫 번째 문단\n두 번째 문단",
  technologies: "React, TypeScript, React",
};
test("new projects contain entered facts and no invented roles, dates or results", () => {
  const next = addProject(content, newInput);
  const project = next.projects.at(-1);
  assert.equal(content.projects.length, 8);
  assert.equal(next.projects.length, 9);
  assert.equal(project.slug, "new-project");
  assert.deepEqual(project.tags, ["React", "TypeScript"]);
  assert.deepEqual(project.overviewLines, ["첫 번째 문단", "두 번째 문단"]);
  assert.equal(project.role, "");
  assert.equal(project.year, "");
  assert.deepEqual(project.timeline, []);
  assert.deepEqual(project.metrics, []);
  assert.ok(project._key);
  assert.ok(isPortfolioContent(next));
});
test("project creation rejects duplicate, archived and unsafe addresses", () => {
  const archived = archiveProject(content, projects[0].slug);
  for (const slug of [
    projects[0].slug,
    "../admin",
    "Bad Slug",
    "a/b",
    "",
    "-bad",
    "a--b",
  ]) {
    assert.throws(() => addProject(archived, { ...newInput, slug }));
  }
  assert.throws(() => addProject(content, { ...newInput, title: " " }));
});
test("delete and restore preserve every field and do not mutate the original", () => {
  const before = JSON.stringify(content);
  const deleted = archiveProject(content, projects[0].slug);
  assert.equal(deleted.projects.length, 7);
  assert.deepEqual(deleted.archivedProjects[0], projects[0]);
  assert.equal(JSON.stringify(content), before);
  const restored = restoreProject(deleted, projects[0].slug);
  assert.deepEqual(restored.projects.at(-1), projects[0]);
  assert.deepEqual(restored.archivedProjects, []);
  assert.throws(() => archiveProject(deleted, projects[0].slug));
});
test("the final project may be removed without falling back to seed data", () => {
  let next = { ...content, projects: [projects[0]] };
  const empty = archiveProject(next, projects[0].slug);
  assert.deepEqual(empty.projects, []);
  assert.ok(isPortfolioContent(empty));
  assert.equal(restoreProject(empty, projects[0].slug).projects.length, 1);
  assert.equal(isPortfolioContent({ ...empty, archivedProjects: [{}] }), false);
});
test("ordering moves exactly one position and respects boundaries", () => {
  const moved = moveProject(content, projects[1].slug, -1);
  assert.equal(moved.projects[0].slug, projects[1].slug);
  assert.equal(moved.projects[1].slug, projects[0].slug);
  assert.deepEqual(moved.projects.slice(2), projects.slice(2));
  assert.equal(moveProject(content, projects[0].slug, -1), content);
  assert.equal(moveProject(content, projects.at(-1).slug, 1), content);
  assert.throws(() => moveProject(content, "missing", 1));
  assert.deepEqual(moveProject(moved, projects[1].slug, 1).projects, projects);
});
test("selected fields follow project identity through reorder and deletion", () => {
  const selected = ["projects", 1, "overviewLines", 0];
  const moved = moveProject(content, projects[1].slug, -1);
  assert.deepEqual(rebaseProjectField(content, moved, selected), [
    "projects",
    0,
    "overviewLines",
    0,
  ]);
  const deleted = archiveProject(content, projects[0].slug);
  assert.deepEqual(rebaseProjectField(content, deleted, selected), [
    "projects",
    0,
    "overviewLines",
    0,
  ]);
  const removed = archiveProject(content, projects[1].slug);
  assert.deepEqual(rebaseProjectField(content, removed, selected), [
    "profile",
    "intro",
  ]);
  assert.ok(
    !textFields(deleted).some((f) => f.path.includes("archivedProjects")),
  );
});
