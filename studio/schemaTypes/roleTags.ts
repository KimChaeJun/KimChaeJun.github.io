import { defineField } from 'sanity'
import { roleTagOptions } from '../../src/data/roleTags'

export const roleTagsField = defineField({
  name: 'roleTags',
  title: '추가 역할 태그',
  description: '대표 직무에 더할 역할을 선택합니다. AI PM은 선택한 경우에만 표시됩니다.',
  type: 'array',
  of: [{ type: 'string' }],
  options: { list: roleTagOptions },
  initialValue: [],
  validation: (rule) => rule.unique(),
})
