export interface Profile {
  name: string
  role: string
  intro: string
  email: string
  location: string
  availability: string
  github?: string
  linkedin?: string
  skills: string[]
}

export interface Project {
  _id: string
  title: string
  slug: string
  summary: string
  description: string
  coverImage?: string
  tags: string[]
  role: string
  year: string
  liveUrl?: string
  githubUrl?: string
  featured: boolean
}

export interface Experience {
  _id: string
  company: string
  position: string
  summary: string
  startDate: string
  endDate?: string
  current: boolean
}

export interface PortfolioContent {
  profile: Profile
  projects: Project[]
  experiences: Experience[]
}
