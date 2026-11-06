import { defineConfig } from "sanity";
import { schemaTypes } from "./schemaTypes";
import { HomepageEditor } from "./components/HomepageEditor";
import { cmsConfig } from "../src/lib/cmsConfig";
export default defineConfig({
  name: "portfolio",
  title: "김채준 포트폴리오",
  projectId: cmsConfig.projectId,
  dataset: cmsConfig.dataset,
  tools: [{ name: "edit", title: "홈페이지 편집", component: HomepageEditor }],
  schema: { types: schemaTypes },
});
