import assert from "node:assert/strict";
import { getCliClient } from "sanity/cli";
import { readFileSync, writeFileSync } from "node:fs";
import { cmsConfig } from "../../src/lib/cmsConfig";
import { fallbackContent } from "../../src/data/fallback";
import { isPortfolioContent } from "../../shared/editor";
import {
  upsertProjectMedia,
  moveProjectMedia,
  removeProjectMedia,
  type ProjectMedia,
} from "../../shared/media";
async function main() {
  const client = getCliClient({ apiVersion: cmsConfig.apiVersion }).withConfig({
    useCdn: false,
  });
  const id = "qa-project-media-" + Date.now(),
    uploaded: string[] = [];
  let created = false;
  const started = Date.now();
  try {
    const image = await client.assets.upload(
      "image",
      readFileSync("../.project-showcase.local/qa-image.png"),
      { filename: "portfolio-media-qa.png", contentType: "image/png" },
    );
    if (Date.parse(image._createdAt) >= started) uploaded.push(image._id);
    const video = await client.assets.upload(
      "file",
      readFileSync("../.project-showcase.local/qa-video.mp4"),
      { filename: "portfolio-media-qa.mp4", contentType: "video/mp4" },
    );
    if (Date.parse(video._createdAt) >= started) uploaded.push(video._id);
    const base = {
      ...fallbackContent,
      projects: fallbackContent.projects
        .slice(0, 1)
        .map((p) => ({ ...p, media: [] })),
    };
    const imageItem: ProjectMedia = {
      _key: "qa-image",
      kind: "image",
      src: image.url,
      title: "검증용 이미지",
      description: "업로드·저장 검증",
      alt: "테스트 패턴",
      asset: { _type: "reference", _ref: image._id },
    };
    const videoItem: ProjectMedia = {
      _key: "qa-video",
      kind: "video",
      src: video.url,
      title: "검증용 영상",
      description: "업로드·재생 검증",
      alt: "꽃 영상",
      asset: { _type: "reference", _ref: video._id },
    };
    let content = upsertProjectMedia(
      upsertProjectMedia(base, base.projects[0].slug, imageItem),
      base.projects[0].slug,
      videoItem,
    );
    let doc = await client.create({ _id: id, _type: "portfolio", content });
    created = true;
    const revision = doc._rev;
    content = moveProjectMedia(content, base.projects[0].slug, "qa-video", -1);
    doc = await client
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ content })
      .commit();
    const restored = await client.getDocument<any>(id);
    assert.ok(restored);
    assert.ok(isPortfolioContent(restored.content));
    assert.deepEqual(
      restored.content.projects[0].media.map((m: ProjectMedia) => m._key),
      ["qa-video", "qa-image"],
    );
    content = removeProjectMedia(
      removeProjectMedia(content, base.projects[0].slug, "qa-image"),
      base.projects[0].slug,
      "qa-video",
    );
    doc = await client
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ content })
      .commit();
    const emptied = await client.getDocument<any>(id);
    assert.ok(emptied);
    assert.deepEqual(emptied.content.projects[0].media, []);
    await assert.rejects(
      client.patch(id).ifRevisionId(revision).set({ content: base }).commit(),
      (e: any) => e.statusCode === 409,
    );
    writeFileSync(
      "../.project-showcase.local/upload-verification.json",
      JSON.stringify(
        { imageUrl: image.url, videoUrl: video.url, passed: true },
        null,
        2,
      ),
    );
    console.log(
      "PASS: real image/video uploads, references, reorder, reload, remove, stale revision rejection.",
    );
  } finally {
    if (created) await client.delete(id);
    for (const assetId of uploaded) await client.delete(assetId);
    console.log("Removed only this run's temporary QA document and assets.");
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
