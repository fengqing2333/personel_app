/**
 * schemas.js — 简历条目类型字段定义（唯一真相源）
 *
 * 每个字段:
 *   type:        JavaScript 类型 / 语义类型
 *   required:    是否必填
 *   default:     默认值（normalizeEntry 补全缺失字段时使用）
 *   matchWeight: JD 匹配权重 (high | medium | low | null)，null = 不参与匹配
 */

export const PROFILE_SCHEMA = {
  name:     { type: 'string',   required: true,  default: '',   matchWeight: 'high' },
  title:    { type: 'string',   required: false, default: '',   matchWeight: 'high' },
  email:    { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  phone:    { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  location: { type: 'string',   required: false, default: '',   matchWeight: 'medium' },
  summary:  { type: 'text',     required: false, default: '',   matchWeight: 'high' },
  avatar:   { type: 'string',   required: false, default: '',   matchWeight: null },
  github:   { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  website:  { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  tags:     { type: 'string[]', required: false, default: [],   matchWeight: 'medium' },
}

export const WORK_INTERNSHIP_SCHEMA = {
  company:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  position:     { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  startDate:    { type: 'month',    required: true,  default: '',  matchWeight: null },
  endDate:      { type: 'month',    required: false, default: '',  matchWeight: null },
  description:  { type: 'text',     required: false, default: '',  matchWeight: 'high' },
  achievements: { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
  location:     { type: 'string',   required: false, default: '',  matchWeight: 'low' },
  logo:         { type: 'string',   required: false, default: '',  matchWeight: null },
  tags:         { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

export const PROJECT_SCHEMA = {
  name:         { type: 'string',   required: true,  default: '',     matchWeight: 'high' },
  role:         { type: 'string',   required: true,  default: '',     matchWeight: 'high' },
  startDate:    { type: 'month',    required: true,  default: '',     matchWeight: null },
  endDate:      { type: 'month',    required: false, default: '',     matchWeight: null },
  description:  { type: 'text',     required: false, default: '',     matchWeight: 'high' },
  technologies: { type: 'string[]', required: false, default: [],     matchWeight: 'high' },
  url:          { type: 'string',   required: false, default: '',     matchWeight: 'low' },
  featured:     { type: 'boolean',  required: false, default: false,  matchWeight: null },
  tags:         { type: 'string[]', required: false, default: [],     matchWeight: 'medium' },
}

export const EDUCATION_SCHEMA = {
  school:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  degree:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  field:       { type: 'string',   required: false, default: '',  matchWeight: 'medium' },
  gpa:         { type: 'string',   required: false, default: '',  matchWeight: 'low' },
  startDate:   { type: 'month',    required: true,  default: '',  matchWeight: null },
  endDate:     { type: 'month',    required: false, default: '',  matchWeight: null },
  description: { type: 'text',     required: false, default: '',  matchWeight: 'medium' },
  logo:        { type: 'string',   required: false, default: '',  matchWeight: null },
  tags:        { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

export const SKILL_SCHEMA = {
  skillName:   { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  category:    { type: 'string',   required: false, default: '',  matchWeight: 'medium' },
  proficiency: { type: 'number',   required: false, default: 1,   matchWeight: 'low' },
  tags:        { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

export const CERTIFICATE_SCHEMA = {
  name:        { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  issuer:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  date:        { type: 'month',    required: true,  default: '',  matchWeight: null },
  description: { type: 'text',     required: false, default: '',  matchWeight: 'medium' },
  url:         { type: 'string',   required: false, default: '',  matchWeight: 'low' },
  tags:        { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

/** 所有条目类型的 schema 注册表 */
export const SCHEMAS = {
  profile:     PROFILE_SCHEMA,
  work:        WORK_INTERNSHIP_SCHEMA,
  internship:  WORK_INTERNSHIP_SCHEMA,
  project:     PROJECT_SCHEMA,
  education:   EDUCATION_SCHEMA,
  skill:       SKILL_SCHEMA,
  certificate: CERTIFICATE_SCHEMA,
}

/** 按类型获取 schema，未知类型返回 null */
export function getSchema(type) {
  return SCHEMAS[type] || null
}

/** 获取某类型的 JD 可匹配字段列表（matchWeight !== null 的字段） */
export function getMatchableFields(type) {
  const schema = SCHEMAS[type]
  if (!schema) return []
  return Object.entries(schema)
    .filter(([, def]) => def.matchWeight !== null)
    .map(([key, def]) => ({ key, type: def.type, weight: def.matchWeight }))
}

/** 对单条 entry 补全 schema 定义的默认值，保留多余字段（自愈） */
export function normalizeEntry(entry) {
  const schema = SCHEMAS[entry.type]
  if (!schema) return entry
  const result = { ...entry }
  for (const [key, def] of Object.entries(schema)) {
    if (result[key] === undefined || result[key] === null) {
      result[key] = def.default
    }
  }
  return result
}
