import { createClient } from '@sanity/client'
import { fallbackContent } from '../data/fallback'
import type { PortfolioContent } from '../types/content'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'

const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2026-08-10',
      useCdn: true,
      perspective: 'published',
    })
  : null

const portfolioQuery = `{
  "profile": *[_type == "profile"][0] {
    name,
    role,
    intro,
    email,
    location,
    availability,
    github,
    linkedin,
    skills
  },
  "projects": *[_type == "project" && coalesce(visible, true) == true] | order(order asc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    description,
    "coverImage": coverImage.asset->url,
    tags,
    role,
    year,
    liveUrl,
    githubUrl,
    featured
  },
  "experiences": *[_type == "experience" && coalesce(visible, true) == true] | order(order asc, startDate desc) {
    _id,
    company,
    position,
    summary,
    startDate,
    endDate,
    current
  }
}`

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!client) {
    return fallbackContent
  }

  const content = await client.fetch<Partial<PortfolioContent>>(portfolioQuery)

  return {
    profile: content.profile ?? fallbackContent.profile,
    projects: content.projects?.length ? content.projects : fallbackContent.projects,
    experiences: content.experiences?.length
      ? content.experiences
      : fallbackContent.experiences,
  }
}
