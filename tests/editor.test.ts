import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isPortfolioContent,
  setText,
  setRoleTags,
  textFields,
  trustedMessage,
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
