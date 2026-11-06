import { createClient } from "@sanity/client";
import { cmsConfig } from "./cmsConfig";
import { isPortfolioContent } from "../../shared/editor";
import type { PortfolioContent } from "../types/content";
const client = createClient({
  ...cmsConfig,
  useCdn: false,
  perspective: "published",
});
export async function getPortfolioContent(): Promise<PortfolioContent> {
  const content: unknown = await client.fetch(
    '*[_id == $id && _type == "portfolio"][0].content',
    { id: cmsConfig.documentId },
  );
  if (!isPortfolioContent(content))
    throw new Error("공개 콘텐츠를 불러오지 못했습니다.");
  return content as PortfolioContent;
}
export function subscribePortfolio(onChange: () => void) {
  const sub = client
    .listen(
      "*[_id == $id]",
      { id: cmsConfig.documentId },
      { includeResult: false, visibility: "query" },
    )
    .subscribe({ next: onChange, error: () => undefined });
  return () => sub.unsubscribe();
}
