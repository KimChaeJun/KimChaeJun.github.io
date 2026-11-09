import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { cmsConfig } from "../../src/lib/cmsConfig";
import { isPortfolioContent } from "../../shared/editor";
import seeds from "../../src/data/projectMedia.json";
import type { PortfolioContent } from "../../src/types/content";
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
    throw Error("Invalid current content");
  const next = structuredClone(doc.content),
    sets: Record<string, unknown> = {};
  for (const [slug, media] of Object.entries(seeds)) {
    const index = next.projects.findIndex((p) => p.slug === slug);
    if (index < 0) throw Error("Project missing: " + slug);
    if (next.projects[index].media !== undefined)
      throw Error("Existing media must not be overwritten: " + slug);
    next.projects[index].media =
      media as PortfolioContent["projects"][number]["media"];
    sets["content.projects[" + index + "].media"] = media;
  }
  if (!isPortfolioContent(next)) throw Error("Invalid media content");
  mkdirSync("../.project-showcase.local", { recursive: true });
  const plan = { revision: doc._rev, sets };
  if (!process.argv.includes("--apply")) {
    writeFileSync(
      "../.project-showcase.local/cms-before.json",
      JSON.stringify(doc, null, 2),
    );
    writeFileSync(
      "../.project-showcase.local/cms-plan.json",
      JSON.stringify(plan, null, 2),
    );
    writeFileSync(
      "../.project-showcase.local/preview-content.json",
      JSON.stringify(next, null, 2),
    );
    console.log(
      JSON.stringify({
        mode: "preview",
        projectCount: next.projects.length,
        mediaCount: Object.values(seeds).flat().length,
        revision: doc._rev,
      }),
    );
    return;
  }
  const reviewed = JSON.parse(
    readFileSync("../.project-showcase.local/cms-plan.json", "utf8"),
  );
  if (!isDeepStrictEqual(plan, reviewed))
    throw Error("Review changed content again");
  const result = await client
    .patch(cmsConfig.documentId)
    .ifRevisionId(doc._rev)
    .set(sets)
    .commit();
  if (!isDeepStrictEqual(result.content, next))
    throw Error("Unexpected content after publication");
  writeFileSync(
    "../.project-showcase.local/cms-after.json",
    JSON.stringify(result, null, 2),
  );
  console.log(
    JSON.stringify({
      mode: "applied",
      revision: result._rev,
      unrelatedContentPreserved: true,
    }),
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
