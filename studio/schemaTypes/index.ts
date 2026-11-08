import { fallbackContent } from "../../src/data/fallback";
import { defineType } from "sanity";
const strings = (names: string[]) =>
  names.map((name) => ({ name, title: name, type: "string" }));
const list = (name: string, fields: string[]) => ({
  name,
  type: "array",
  of: [{ type: "object", fields: strings(fields) }],
});
const stringList = (name: string) => ({
  name,
  type: "array",
  of: [{ type: "string" }],
});
export const portfolioType = defineType({
  name: "portfolio",
  title: "포트폴리오",
  type: "document",
  fields: [
    {
      name: "content",
      title: "공개 콘텐츠",
      type: "object",
      fields: [
        {
          name: "profile",
          type: "object",
          fields: [
            ...strings([
              "name",
              "role",
              "intro",
              "email",
              "location",
              "availability",
              "github",
              "linkedin",
            ]),
            stringList("skills"),
            stringList("roleTags"),
          ],
        },
        {
          name: "copy",
          type: "object",
          fields: strings(Object.keys(fallbackContent.copy)),
        },
        {
          name: "projects",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                ...strings([
                  "slug",
                  "title",
                  "subtitle",
                  "category",
                  "role",
                  "year",
                  "period",
                  "award",
                  "timelineBasis",
                ]),
                ...["summaryLines", "overviewLines", "tags", "roleTags"].map(
                  stringList,
                ),
                list("roles", ["title", "description"]),
                list("aiCollaboration", ["title", "tools", "stage", "problem", "approach", "humanReview", "outcome", "evidence"]),
                {
                  name: "technologyStack",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      fields: [
                        ...strings(["category", "description"]),
                        stringList("technologies"),
                      ],
                    },
                  ],
                },
                list("metrics", ["value", "label", "note"]),
                list("pipeline", ["label", "description"]),
                list("improvements", ["before", "after", "evidence"]),
                list("timeline", ["date", "title", "description"]),
              ],
            },
          ],
        },
        {
          name: "archivedProjects",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                ...strings([
                  "slug",
                  "title",
                  "subtitle",
                  "category",
                  "role",
                  "year",
                  "period",
                  "award",
                  "timelineBasis",
                ]),
                ...["summaryLines", "overviewLines", "tags", "roleTags"].map(
                  stringList,
                ),
                list("roles", ["title", "description"]),
                list("aiCollaboration", ["title", "tools", "stage", "problem", "approach", "humanReview", "outcome", "evidence"]),
                {
                  name: "technologyStack",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      fields: [
                        ...strings(["category", "description"]),
                        stringList("technologies"),
                      ],
                    },
                  ],
                },
                list("metrics", ["value", "label", "note"]),
                list("pipeline", ["label", "description"]),
                list("improvements", ["before", "after", "evidence"]),
                list("timeline", ["date", "title", "description"]),
              ],
            },
          ],
        },
        list("experiences", [
          "company",
          "position",
          "summary",
          "startDate",
          "endDate",
        ]),
      ],
    },
  ],
  preview: { prepare: () => ({ title: "김채준 포트폴리오" }) },
});
export const schemaTypes = [portfolioType];
