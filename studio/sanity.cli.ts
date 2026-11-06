import { defineCliConfig } from "sanity/cli";
import { cmsConfig } from "../src/lib/cmsConfig";
export default defineCliConfig({
  api: { projectId: cmsConfig.projectId, dataset: cmsConfig.dataset },
  project: { basePath: "/admin" },
});
