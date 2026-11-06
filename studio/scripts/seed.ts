import { getCliClient } from "sanity/cli";
import { fallbackContent } from "../../src/data/fallback";
import { cmsConfig } from "../../src/lib/cmsConfig";
import { isPortfolioContent } from "../../shared/editor";
function withKeys(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map((item, index) =>
      item && typeof item === "object"
        ? { ...(withKeys(item) as object), _key: "item" + index }
        : item,
    );
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, withKeys(item)]),
    );
  return value;
}
async function seed() {
  if (!isPortfolioContent(fallbackContent))
    throw new Error("Invalid public content");
  const client = getCliClient({ apiVersion: cmsConfig.apiVersion });
  const existing = await client.getDocument(cmsConfig.documentId);
  if (existing) {
    const missing = Object.fromEntries(
      Object.entries(fallbackContent.copy).map(([key, value]) => [
        "content.copy." + key,
        value,
      ]),
    );
    await client.patch(cmsConfig.documentId).setIfMissing(missing).commit();
    console.log(
      "Existing portfolio preserved; missing copy fields initialized.",
    );
    return;
  }
  await client.createIfNotExists({
    _id: cmsConfig.documentId,
    _type: "portfolio",
    content: withKeys(fallbackContent),
  });
  console.log(
    "Seeded " +
      fallbackContent.projects.length +
      " verified public project records.",
  );
}
seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
