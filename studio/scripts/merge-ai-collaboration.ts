import { getCliClient } from 'sanity/cli'
import { readFileSync, writeFileSync } from 'node:fs'
import { cmsConfig } from '../../src/lib/cmsConfig'
import { isPortfolioContent } from '../../shared/editor'
import aiCollaboration from '../../src/data/aiCollaboration.json'
import type { PortfolioContent } from '../../src/types/content'

// Preview first; apply only this reviewed set of new fields at the same revision.
async function main() {
  const client = getCliClient({ apiVersion: cmsConfig.apiVersion }).withConfig({ useCdn: false })
  const doc = await client.getDocument<{_id: string; _rev: string; content: PortfolioContent}>(cmsConfig.documentId)
  if (!doc || !isPortfolioContent(doc.content)) throw new Error('Invalid current content')
  const sets: Record<string, unknown> = {}
  for (const [slug, cases] of Object.entries(aiCollaboration)) {
    const index = doc.content.projects.findIndex(project => project.slug === slug)
    if (index < 0) throw new Error('Expected active project missing: ' + slug)
    if (doc.content.projects[index].aiCollaboration !== undefined) throw new Error('Existing AI content must be reviewed before replacing: ' + slug)
    sets[`content.projects[${index}].aiCollaboration`] = cases.map((item, i) => ({...item, _key: 'ai'+i}))
  }
  const next = structuredClone(doc.content)
  next.projects.forEach(project => { project.aiCollaboration = aiCollaboration[project.slug as keyof typeof aiCollaboration] ?? project.aiCollaboration })
  if (!isPortfolioContent(next)) throw new Error('Invalid merged content')
  const previewPath = '../.ai-collaboration.local/cms-preview.json'
  if (!process.argv.includes('--apply')) {
    writeFileSync('../.ai-collaboration.local/cms-before.json', JSON.stringify(doc,null,2))
    writeFileSync(previewPath, JSON.stringify({revision:doc._rev, sets},null,2))
    console.log(JSON.stringify({mode:'preview', revision:doc._rev, projects:Object.keys(sets).length, cases:Object.values(aiCollaboration).flat().length, preserved:'profile, copy, order, existing fields, archive'}))
    return
  }
  const reviewed = JSON.parse(readFileSync(previewPath,'utf8'))
  if (reviewed.revision !== doc._rev || JSON.stringify(reviewed.sets) !== JSON.stringify(sets)) throw new Error('Content changed after preview; review again')
  await client.patch(cmsConfig.documentId).ifRevisionId(doc._rev).set(sets).commit()
  const after = await client.getDocument<{_id:string;_rev:string;content:PortfolioContent}>(cmsConfig.documentId)
  if (!after || !isPortfolioContent(after.content)) throw new Error('Post-publish verification failed')
  const strip = (content:PortfolioContent) => ({...content, projects:content.projects.map(({aiCollaboration: _cases, ...rest}) => rest)})
  if (JSON.stringify(strip(after.content)) !== JSON.stringify(strip(doc.content))) throw new Error('Unrelated content changed during publish; inspect latest document')
  writeFileSync('../.ai-collaboration.local/cms-after.json', JSON.stringify(after,null,2))
  console.log(JSON.stringify({mode:'applied', revision:after._rev, projects:after.content.projects.length, unrelatedContentPreserved:true}))
}
main().catch(error => {console.error(error.message);process.exitCode=1})
