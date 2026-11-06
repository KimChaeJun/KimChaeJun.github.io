import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";
import { cmsConfig } from "../../src/lib/cmsConfig";
import {
  addProject,
  archiveProject,
  restoreProject,
  moveProject,
  emptyProjectInput,
} from "../../shared/editor";
import type { PortfolioContent } from "../../src/types/content";
async function verify() {
  const client = getCliClient({ apiVersion: cmsConfig.apiVersion }).withConfig({
    useCdn: false,
  });
  const id = "qa-project-management-" + randomUUID();
  let created = false;
  try {
    let content: PortfolioContent = {
      profile: {
        name: "QA",
        role: "",
        intro: "",
        email: "",
        location: "",
        availability: "",
        skills: [],
      },
      projects: [],
      experiences: [],
      copy: {},
    };
    let doc = await client.create({ _id: id, _type: "portfolioQa", content });
    created = true;
    const oldRevision = doc._rev;
    content = addProject(content, {
      ...emptyProjectInput,
      title: "QA A",
      slug: "qa-a",
    });
    content = addProject(content, {
      ...emptyProjectInput,
      title: "QA B",
      slug: "qa-b",
    });
    doc = await client
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ content })
      .commit();
    content = moveProject(content, "qa-b", -1);
    doc = await client
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ content })
      .commit();
    assert.deepEqual(
      doc.content.projects.map((p: { slug: string }) => p.slug),
      ["qa-b", "qa-a"],
    );
    content = archiveProject(content, "qa-a");
    doc = await client
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ content })
      .commit();
    const stored = await client.getDocument<{ content: PortfolioContent }>(id);
    assert.equal(stored?.content.projects.length, 1);
    assert.equal(stored?.content.archivedProjects?.[0].slug, "qa-a");
    content = restoreProject(content, "qa-a");
    doc = await client
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ content })
      .commit();
    assert.equal(doc.content.projects.length, 2);
    assert.deepEqual(doc.content.archivedProjects, []);
    await assert.rejects(
      client
        .patch(id)
        .ifRevisionId(oldRevision)
        .set({ content: { ...content, projects: [] } })
        .commit(),
      (error: { statusCode?: number }) => error.statusCode === 409,
    );
    const unchanged = await client.getDocument<{ content: PortfolioContent }>(
      id,
    );
    assert.equal(unchanged?.content.projects.length, 2);
    console.log(
      "PASS: add, reorder, archive, reload, restore, stale revision rejection.",
    );
  } finally {
    if (created) {
      await client.delete(id);
      console.log(
        "Temporary QA document removed. Live portfolio was not modified.",
      );
    }
  }
}
verify().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
