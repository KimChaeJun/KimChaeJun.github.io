import { defineField, defineType } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: '프로젝트',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '프로젝트명', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: '주소용 이름',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'summary', title: '한 줄 소개', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'description', title: '상세 설명', type: 'text', rows: 5, validation: (rule) => rule.required() }),
    defineField({
      name: 'coverImage',
      title: '대표 이미지',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: '대체 텍스트', type: 'string' }],
    }),
    defineField({
      name: 'tags',
      title: '사용 기술',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'role', title: '담당 역할', type: 'string' }),
    defineField({ name: 'year', title: '연도', type: 'string' }),
    defineField({ name: 'liveUrl', title: '배포 URL', type: 'url' }),
    defineField({ name: 'githubUrl', title: 'GitHub URL', type: 'url' }),
    defineField({ name: 'featured', title: '대표 프로젝트', type: 'boolean', initialValue: false }),
    defineField({ name: 'visible', title: '사이트에 공개', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: '노출 순서', type: 'number', initialValue: 0 }),
  ],
  orderings: [
    {
      title: '노출 순서',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'role', media: 'coverImage' },
  },
})
