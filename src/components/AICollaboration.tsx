import { useState } from 'react'
import type { AICollaborationCase, TimelineProject } from '../data/timelineProjects'
import { Editable } from './Editable'
import './aiCollaboration.css'

function Case({ item, slug }: { item: AICollaborationCase; slug: string }) {
  const steps = [
    ['01', '문제 상황', item.problem],
    ['02', 'AI와 진행한 작업', item.approach],
    ['03', '나의 판단·검토', item.humanReview],
    ['04', '결과와 한계', item.outcome],
  ]
  return <article className="ai-case">
    <div className="ai-case-meta">
      <span className="ai-tool"><Editable scope={slug} value={item.tools} /></span>
      <span><Editable scope={slug} value={item.stage} /></span>
    </div>
    <h3><Editable scope={slug} value={item.title} /></h3>
    <dl className="ai-case-steps">
      {steps.map(([number, label, value]) => <div key={number}>
        <dt><span aria-hidden="true">{number}</span>{label}</dt>
        <dd><Editable scope={slug} value={value} /></dd>
      </div>)}
    </dl>
    <p className="ai-evidence"><strong>확인 근거</strong><Editable scope={slug} value={item.evidence} /></p>
  </article>
}

export function AICollaborationSummary({ project }: { project: TimelineProject }) {
  const item = project.aiCollaboration?.[0]
  if (!item) return null
  return <div className="ai-summary">
    <span>AI 협업 · <Editable scope={project.slug} value={item.tools} /> · <Editable scope={project.slug} value={item.stage} /></span>
    <p><Editable scope={project.slug} value={item.title} /></p>
  </div>
}

export function AIWorkbench({ projects }: { projects: TimelineProject[] }) {
  const available = projects.filter(p => p.aiCollaboration?.length)
  const [selected, setSelected] = useState('')
  const project = available.find(p => p.slug === selected)
    ?? available.find(p => p.aiCollaboration?.some(c => c.stage.includes('구현')))
    ?? available[0]
  if (!project) return null
  return <section className="section ai-workbench" id="ai-collaboration" aria-labelledby="ai-heading">
    <div className="ai-heading">
      <div><p className="eyebrow">WORKING WITH AI</p><h2 id="ai-heading">AI와 함께, 어떻게 문제를 풀었나요?</h2></div>
      <p>어떤 상황에서 AI에 무엇을 맡겼는지, 직접 판단한 범위와 확인된 결과를 프로젝트별로 기록합니다.</p>
    </div>
    <div className="ai-project-picker" role="group" aria-label="AI 협업 사례 프로젝트 선택">
      {available.map(p => <button type="button" key={p.slug} aria-pressed={p.slug === project.slug}
        onClick={() => setSelected(p.slug)}>{p.title}</button>)}
    </div>
    <div className="ai-selected" aria-live="polite" aria-atomic="true">
      <div className="ai-project-heading"><h3>{project.title}</h3><a href={'#/projects/' + project.slug}>프로젝트 자세히 보기 <span aria-hidden="true">↗</span></a></div>
      <Case item={project.aiCollaboration![0]} slug={project.slug} />
    </div>
    <p className="ai-scope-note">구현·오류 수정과 검토·문서화 사례를 구분했습니다. 개발 당시 도구별 활용 과정은 확인되는 대로 보완합니다.</p>
  </section>
}

export function AICollaborationDetail({ project }: { project: TimelineProject }) {
  if (!project.aiCollaboration?.length) return null
  return <section className="section ai-detail" aria-labelledby="ai-detail-heading">
    <p className="eyebrow">AI COLLABORATION / PROCESS & EVIDENCE</p>
    <h2 id="ai-detail-heading">AI를 활용한 문제 해결 과정</h2>
    <p className="section-description">도구의 역할부터 직접 검토한 범위, 결과를 뒷받침하는 근거까지.</p>
    {project.aiCollaboration.map((item, index) => <Case key={index} item={item} slug={project.slug} />)}
  </section>
}
