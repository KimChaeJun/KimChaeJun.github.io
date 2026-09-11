import { defineField, defineType } from 'sanity'

export const profileType = defineType({
  name: 'profile',
  title: '프로필',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: '이름', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'role', title: '직무', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'intro', title: '소개', type: 'text', rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: 'email', title: '이메일', type: 'string', validation: (rule) => rule.required().email() }),
    defineField({ name: 'location', title: '활동 지역', type: 'string' }),
    defineField({ name: 'availability', title: '현재 상태', type: 'string', description: '예: Open to work' }),
    defineField({ name: 'github', title: 'GitHub URL', type: 'url' }),
    defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
    defineField({
      name: 'skills',
      title: '기술 스택',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role' },
  },
})
