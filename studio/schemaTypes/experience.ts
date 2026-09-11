import { defineField, defineType } from 'sanity'

export const experienceType = defineType({
  name: 'experience',
  title: '경력',
  type: 'document',
  fields: [
    defineField({ name: 'company', title: '회사명', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'position', title: '직무', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'summary', title: '주요 업무와 성과', type: 'text', rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: 'startDate', title: '시작일', type: 'date', validation: (rule) => rule.required() }),
    defineField({ name: 'endDate', title: '종료일', type: 'date' }),
    defineField({ name: 'current', title: '현재 재직 중', type: 'boolean', initialValue: false }),
    defineField({ name: 'visible', title: '사이트에 공개', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: '노출 순서', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { title: 'company', subtitle: 'position' },
  },
})
