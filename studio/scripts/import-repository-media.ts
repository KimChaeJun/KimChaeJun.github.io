import { getCliClient } from "sanity/cli";
import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { cmsConfig } from "../../src/lib/cmsConfig";
import { isPortfolioContent } from "../../shared/editor";
import type { PortfolioContent } from "../../src/types/content";
import seeds from "../../src/data/projectMedia.json";
import sources from "../../docs/project-media-sources.json";

async function main() {
  const client = getCliClient({ apiVersion: cmsConfig.apiVersion }).withConfig({
    useCdn: false,
  });
  const doc = await client.getDocument<{
    _id: string;
    _rev: string;
    content: PortfolioContent;
  }>(cmsConfig.documentId);
  if (!doc || !isPortfolioContent(doc.content))
    throw Error("Invalid existing content");
  const next = structuredClone(doc.content);
  const sets: Record<string, unknown> = {};
  const added: Record<string, number> = {};
  for (const source of sources.items) {
    const bytes = readFileSync("../" + source.file);
    if (createHash("sha256").update(bytes).digest("hex") !== source.sha256)
      throw Error("Asset changed: " + source.file);
  }
  for (const slug of new Set(sources.items.map((item) => item.slug))) {
    const index = next.projects.findIndex((project) => project.slug === slug);
    if (index < 0) throw Error("Project missing: " + slug);
    const project = next.projects[index];
    const incoming = (
      seeds as Record<string, NonNullable<typeof project.media>>
    )[slug];
    if (!incoming) throw Error("Seed missing: " + slug);
    const current = project.media ?? [];
    const additions = incoming.filter(
      (item) =>
        !current.some(
          (existing) =>
            existing._key === item._key || existing.src === item.src,
        ),
    );
    if (!additions.length) continue;
    project.media = [...current, ...additions];
    sets[`content.projects[${index}].media`] = project.media;
    added[slug] = additions.length;
  }
  if (!isPortfolioContent(next)) throw Error("Invalid combined content");
  const directory = "../.repository-media.local";
  mkdirSync(directory, { recursive: true });
  const plan = { revision: doc._rev, sets, added };
  if (!process.argv.includes("--apply")) {
    writeFileSync(directory + "/cms-before.json", JSON.stringify(doc, null, 2));
    writeFileSync(directory + "/cms-plan.json", JSON.stringify(plan, null, 2));
    writeFileSync(
      directory + "/preview-content.json",
      JSON.stringify(next, null, 2),
    );
    console.log(
      JSON.stringify({
        mode: "preview",
        revision: doc._rev,
        added,
        existingMediaPreserved: true,
      }),
    );
    return;
  }
  const reviewed = JSON.parse(
    readFileSync(directory + "/cms-plan.json", "utf8"),
  );
  if (!isDeepStrictEqual(reviewed, plan))
    throw Error("Current content changed; review again before applying");
  if (!Object.keys(sets).length) {
    console.log("No new media to import");
    return;
  }
  const result = await client
    .patch(cmsConfig.documentId)
    .ifRevisionId(doc._rev)
    .set(sets)
    .commit();
  if (!isDeepStrictEqual(result.content, next))
    throw Error("Unexpected publication result");
  writeFileSync(directory + "/cms-after.json", JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify({
      mode: "applied",
      revision: result._rev,
      added,
      unrelatedContentPreserved: true,
    }),
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
