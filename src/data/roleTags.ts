export const roleTagOptions = [
  { title: 'Full Stack Developer', value: 'Full Stack Developer' },
  { title: 'AI PM', value: 'AI PM' },
]

export function getRoleTags(primaryRole: string, additionalTags?: readonly string[] | null) {
  const tags = [
    ...new Set([primaryRole, ...(additionalTags ?? [])].map((tag) => tag.trim()).filter(Boolean)),
  ]
  const coveredRoles = new Set(['FE Developer', 'BE Developer', 'Infra Developer'])
  return tags.includes('Full Stack Developer') ? tags.filter((tag) => !coveredRoles.has(tag)) : tags
}
