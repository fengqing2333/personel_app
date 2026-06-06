# Resume Storage Engine — Design Spec

**日期**: 2026-06-07  
**版本**: v1.0  
**状态**: Draft → 待用户审阅

---

## 1. 背景与动机

### 1.1 现状问题

| 问题 | 详情 |
|------|------|
| 数据分散 | 简历数据横跨 4 个 localStorage key（`resume-data`、`resume-layout`、`resume-manual-orders`、`resume-seed-version`），各 composable 独立读写 |
| 无 Schema 校验 | 字段缺失/类型错误静默通过，旧数据缺少新字段（如 `achievements`）不会自动补齐 |
| 迁移散落 | 版本升级逻辑内联在 `useResume.js` 的 `loadEntries()` 中，每次加字段需手动改函数 |
| 无备份机制 | 数据仅存 localStorage，清缓存/换设备即丢失，无法导出恢复 |
| 实习数据孤儿 | `type: 'internship'` 条目可创建可存储，但 Portal 从不展示（无对应 block，`experiences` 只查 `type: 'work'`） |
| JD 匹配无字段清单 | 后续 JD 匹配功能需要知道每条目的字段名、类型、权重，目前散落在 `ResumeForm.vue` 的 `fieldDefs` 和 seed 数据中 |

### 1.2 目标

1. 建立规范的存储架构，`src/storage/` 目录为项目唯一数据真相源
2. 所有简历数据收敛到单一 localStorage key，统一读写入口
3. Schema 驱动：字段定义 = 校验规则 = 默认值 = JD 匹配元数据
4. 版本化迁移管线：任意旧版本 → 链式升级 → 最新版本
5. 提供 JSON 导出/导入作为备份恢复机制
6. 修复实习经历不在 Portal 展示的问题

### 1.3 范围

| 包含 | 不包含 |
|------|--------|
| 简历模块所有数据（entries + layout + manualOrders） | theme / leave / salary 模块（保持现有 key 不变） |
| 存储层新建 + composable 重构 | Portal / Manage 视图组件改动（API 兼容） |
| 备份导出/导入按钮（加入管理页 UI） | 自动定时备份 / 云端备份 |
| Schema 预埋 JD 匹配权重字段 | JD 匹配功能的实现 |

---

## 2. 目录结构

```
src/storage/
├── schemas.js           # 所有条目类型的字段定义（字段名 / 类型 / 必填 / 默认值 / JD 匹配权重）
├── storageEngine.js     # 统一读写 API，初始化 / 读取 / 写入 / CRUD / 布局
├── migration.js         # 版本链迁移管线（v0→v1→v2→...→vN）
├── backup.js            # 导出 / 导入 / 恢复工具
└── __tests__/
    ├── schemas.test.js
    ├── storageEngine.test.js
    ├── migration.test.js
    └── backup.test.js
```

---

## 3. Schema 设计 (`schemas.js`)

### 3.1 条目类型总览（7 种）

| type | 中文名 | Portal 区块 | 备注 |
|------|--------|-------------|------|
| `profile` | 个人信息 | Hero + Profile Block | 每个用户仅一条 |
| `work` | 工作经历 | experiences (Timeline) | 与 internship 合并展示 |
| `internship` | 实习经历 | experiences (Timeline) | 合并到同一条时间线，标记"实习"标签 |
| `project` | 项目 | projects | — |
| `education` | 教育 | education | — |
| `skill` | 技能 | skills | — |
| `certificate` | 证书 | certificates | — |

### 3.2 Profile Schema

```js
export const PROFILE_SCHEMA = {
  name:       { type: 'string', required: true,  default: '',  matchWeight: 'high' },
  title:      { type: 'string', required: false, default: '',  matchWeight: 'high' },
  email:      { type: 'string', required: false, default: '',  matchWeight: 'low' },
  phone:      { type: 'string', required: false, default: '',  matchWeight: 'low' },
  location:   { type: 'string', required: false, default: '',  matchWeight: 'medium' },
  summary:    { type: 'text',   required: false, default: '',  matchWeight: 'high' },
  avatar:     { type: 'string', required: false, default: '',  matchWeight: null },
  github:     { type: 'string', required: false, default: '',  matchWeight: 'low' },
  website:    { type: 'string', required: false, default: '',  matchWeight: 'low' },
  tags:       { type: 'string[]', required: false, default: [], matchWeight: 'medium' },
}
```

### 3.3 Work / Internship Schema（共享）

```js
export const WORK_INTERNSHIP_SCHEMA = {
  company:      { type: 'string',    required: true,  default: '',  matchWeight: 'high' },
  position:     { type: 'string',    required: true,  default: '',  matchWeight: 'high' },
  startDate:    { type: 'month',     required: true,  default: '',  matchWeight: null },
  endDate:      { type: 'month',     required: false, default: '',  matchWeight: null },
  description:  { type: 'text',      required: false, default: '',  matchWeight: 'high' },
  achievements: { type: 'string[]',  required: false, default: [],  matchWeight: 'medium' },
  location:     { type: 'string',    required: false, default: '',  matchWeight: 'low' },
  logo:         { type: 'string',    required: false, default: '',  matchWeight: null },
  tags:         { type: 'string[]',  required: false, default: [],  matchWeight: 'medium' },
}
```

**设计决策**：`work` 和 `internship` 共享完全相同的字段定义，仅通过条目 `type` 区分。Portal 合并查询时，`internship` 条目自动附加视觉标记。

### 3.4 Project / Education / Skill / Certificate Schema

```js
export const PROJECT_SCHEMA = {
  name:         { type: 'string',    required: true,  default: '',  matchWeight: 'high' },
  role:         { type: 'string',    required: true,  default: '',  matchWeight: 'high' },
  startDate:    { type: 'month',     required: true,  default: '',  matchWeight: null },
  endDate:      { type: 'month',     required: false, default: '',  matchWeight: null },
  description:  { type: 'text',      required: false, default: '',  matchWeight: 'high' },
  technologies: { type: 'string[]',  required: false, default: [],  matchWeight: 'high' },
  url:          { type: 'string',    required: false, default: '',  matchWeight: 'low' },
  featured:     { type: 'boolean',   required: false, default: false, matchWeight: null },
  tags:         { type: 'string[]',  required: false, default: [],  matchWeight: 'medium' },
}

export const EDUCATION_SCHEMA = {
  school:       { type: 'string',  required: true,  default: '',  matchWeight: 'high' },
  degree:       { type: 'string',  required: true,  default: '',  matchWeight: 'high' },
  field:        { type: 'string',  required: false, default: '',  matchWeight: 'medium' },
  gpa:          { type: 'string',  required: false, default: '',  matchWeight: 'low' },
  startDate:    { type: 'month',   required: true,  default: '',  matchWeight: null },
  endDate:      { type: 'month',   required: false, default: '',  matchWeight: null },
  description:  { type: 'text',    required: false, default: '',  matchWeight: 'medium' },
  logo:         { type: 'string',  required: false, default: '',  matchWeight: null },
  tags:         { type: 'string[]', required: false, default: [], matchWeight: 'medium' },
}

export const SKILL_SCHEMA = {
  skillName:    { type: 'string',  required: true,  default: '',    matchWeight: 'high' },
  category:     { type: 'string',  required: false, default: '',    matchWeight: 'medium' },
  proficiency:  { type: 'number',  required: false, default: 1,     matchWeight: 'low' },
  tags:         { type: 'string[]', required: false, default: [],   matchWeight: 'medium' },
}

export const CERTIFICATE_SCHEMA = {
  name:         { type: 'string',  required: true,  default: '',  matchWeight: 'high' },
  issuer:       { type: 'string',  required: true,  default: '',  matchWeight: 'high' },
  date:         { type: 'month',   required: true,  default: '',  matchWeight: null },
  description:  { type: 'text',    required: false, default: '',  matchWeight: 'medium' },
  url:          { type: 'string',  required: false, default: '',  matchWeight: 'low' },
  tags:         { type: 'string[]', required: false, default: [], matchWeight: 'medium' },
}
```

### 3.5 Schema 注册表

```js
export const SCHEMAS = {
  profile:     PROFILE_SCHEMA,
  work:        WORK_INTERNSHIP_SCHEMA,
  internship:  WORK_INTERNSHIP_SCHEMA,     // 共享 work schema
  project:     PROJECT_SCHEMA,
  education:   EDUCATION_SCHEMA,
  skill:       SKILL_SCHEMA,
  certificate: CERTIFICATE_SCHEMA,
}

/** 按类型获取 schema */
export function getSchema(type) {
  return SCHEMAS[type] || null
}

/** 获取所有 JD-matchable 字段（matchWeight !== null），返回扁平列表供匹配引擎使用 */
export function getMatchableFields(type) {
  const schema = SCHEMAS[type]
  if (!schema) return []
  return Object.entries(schema)
    .filter(([_, def]) => def.matchWeight !== null)
    .map(([key, def]) => ({ key, type: def.type, weight: def.matchWeight }))
}
```

### 3.6 自愈函数

```js
/** 对单条 entry 补全 schema 定义的默认值，保留多余字段 */
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
```

---

## 4. StorageEngine (`storageEngine.js`)

### 4.1 存储结构

localStorage 单 key：`resume-storage-v2`

```json
{
  "version": 2,
  "entries": [
    { "id": 1, "type": "profile", "name": "陈远舟", ... },
    { "id": 2, "type": "work", "company": "字节跳动", ... },
    { "id": 3, "type": "internship", "company": "微软亚洲研究院", ... }
  ],
  "layout": {
    "layout": "single",
    "blocks": {
      "profile":      { "visible": true, "order": 0 },
      "experiences":  { "visible": true, "order": 1 },
      "projects":     { "visible": true, "order": 2 },
      "skills":       { "visible": true, "order": 3 },
      "education":    { "visible": true, "order": 4 },
      "certificates": { "visible": true, "order": 5 },
      "awards":       { "visible": true, "order": 6 },
      "activities":   { "visible": false, "order": 7 }
    },
    "themeId": "warm-charcoal",
    "glowEnabled": false
  },
  "manualOrders": {
    "work": [2, 5, 3],
    "project": [7, 4]
  }
}
```

### 4.2 API

```js
/** 初始化（应用启动时调用一次，执行迁移+seed注入+自愈+持久化） */
function init(): void

/** 按类型筛选条目（支持单类型或数组），自动应用手动排序 */
function getByType(type: string | string[]): Entry[]

/** 新增条目（自增 id + schema 补全 + 自动持久化） */
function addEntry(type: string, data: object): Entry

/** 更新条目（合并写入 + 自动持久化） */
function updateEntry(id: number, data: object): Entry | null

/** 删除条目（软删除副本保留在内存，自动持久化） */
function removeEntry(id: number): boolean

/** 撤销最近删除 */
function undoRemove(): boolean

/** 提交删除（清空软删除副本） */
function commitRemoval(): void

/** 获取所有条目（只读引用，不拷贝） */
function getAll(): Entry[]

/** 读写布局配置（写入自动合并 + 持久化） */
function getLayout(): LayoutState
function setLayout(partial: Partial<LayoutState>): void

/** 读写手动排序（写入自动持久化） */
function getManualOrder(type: string): number[]
function setManualOrder(type: string, orderedIds: number[]): void
function clearManualOrder(type: string): void

/** 测试用：清理内存状态 + localStorage */
function __reset(): void
```

### 4.3 初始化流程

```
init()
  ├── 1. 尝试读取 localStorage 'resume-storage-v2'
  ├── 2. 不存在 → 检查旧 4-key 迁移（migrateFromLegacyKeys）
  ├── 3. entries 为空 + 无旧数据 → 注入 RESUME_SEED（首次访问）
  ├── 4. 版本检查 → 执行迁移管线（runMigrations）
  ├── 5. normalizeEntry() 逐条自愈（补全缺失字段）
  └── 6. 写回 localStorage
```

### 4.4 旧数据迁移函数

```js
function migrateFromLegacyKeys() {
  const entries = safeStorage.get('resume-data', [])
  const layout = safeStorage.get('resume-layout', null)
  const manualOrders = safeStorage.get('resume-manual-orders', {})
  const seedVersion = safeStorage.get('resume-seed-version', null)

  if (entries.length === 0 && !layout && !seedVersion) {
    return null // 完全没有旧数据
  }

  return {
    version: 1,           // 后续由 runMigrations 升级到最新
    entries,
    layout: layout || DEFAULT_LAYOUT,
    manualOrders,
  }
}
```

**安全策略**：迁移后旧 key **不删除**，仅在应用内停止读写。用户可自行清理。

---

## 5. 迁移管线 (`migration.js`)

### 5.1 设计原则

- 每个版本对应一个纯函数 `(data) => newData`
- 链式执行：当前版本 v → v+1 → v+2 → ... → CURRENT_VERSION
- 迁移只处理**数据内容改写**（如字段提取、类型转换）。字段补全由 `normalizeEntry()` 处理，不需要写迁移
- `CURRENT_VERSION` 常量，升级时递增

### 5.2 迁移注册表

```js
export const CURRENT_VERSION = 2

export const MIGRATIONS = {
  1: (data) => ({
    ...data,
    version: 1,
    // v0→v1: 旧 4-key 合并为单 key（migrateFromLegacyKeys 已处理，此处为占位）
  }),
  2: (data) => ({
    ...data,
    version: 2,
    // v1→v2: education 条目补充 gpa 字段提取（迁移已有逻辑）
    entries: data.entries.map(e =>
      e.type === 'education' ? extractGpaFromDescription(e) : e
    ),
  }),
}

export function runMigrations(data) {
  const startVersion = data.version || 0
  let result = data
  for (let v = startVersion + 1; v <= CURRENT_VERSION; v++) {
    if (MIGRATIONS[v]) {
      result = MIGRATIONS[v](result)
    }
  }
  return result
}
```

### 5.3 未来扩展示例

```js
// 假设 v3 新增 internship 到 experiences 区块合并逻辑
3: (data) => ({
  ...data,
  version: 3,
  layout: ensureExperiencesBlock(data.layout),
})
```

---

## 6. 备份模块 (`backup.js`)

### 6.1 API

```js
/** 导出全部数据为 JSON 字符串 */
function exportAll(): string

/** 从 JSON 字符串导入数据。校验失败返回 { success: false, errors: [...] } */
function importAll(json: string): { success: boolean, errors?: string[] }

/** 触发浏览器下载 JSON 文件 */
function downloadBackup(): void

/** 验证 JSON 结构是否合法（schema 校验所有 entries） */
function validate(data: object): { valid: boolean, errors: string[] }
```

### 6.2 使用场景

- **导出**：管理页「导出数据」按钮 → 触发 `downloadBackup()` → 浏览器下载 `resume-backup-YYYY-MM-DD.json`
- **导入**：管理页「导入数据」按钮 → 读取文件 → 调用 `importAll(json)` → schema 校验 → 成功则覆盖存储
- **恢复**：导入文件后自动刷新 Portal 视图

### 6.3 安全策略

- 导入前深拷贝校验（不直接覆盖现有数据）
- 校验无错误才写入
- 校验失败返回具体错误列表（哪条 entry 哪个字段有问题）

---

## 7. Composable 重构

### 7.1 useResume.js

**重构原则**：外部 API 签名完全不变，内部 delegate 到 storageEngine。

保留的 API（签名不变）：
```
entries        → ref (直接引用 engine internal ref)
getByType(type) → 改为 getByType(type | string[]) 支持数组
add / update / remove / undoRemove / commitRemoval
setManualOrder / clearManualOrder
getAll / loadEntries / saveEntries
```

移除的内部逻辑：
- `loadEntries()` 中的 seed 注入 → 移到 engine.init()
- `migrateEntries()` → 移到 migration.js
- `safeStorage.set/get` 调用 → 移到 engine

### 7.2 useResumeLayout.js

**重构原则**：`reactive` 状态 + `deep watch` 自动持久化机制保留，但读写底层改为 engine。

保留的 API（签名不变）：
```
state (readonly)
orderedVisibleBlocks, themeVars (computed)
toggleBlock, setLayout, setTheme, toggleGlow, reorderBlocks, resetLayout
```

改变：
- `initialize()` 从 `safeStorage.get('resume-layout')` 改为 `engine.getLayout()`
- `watch` 持久化从 `safeStorage.set('resume-layout', ...)` 改为 `engine.setLayout(...)`

### 7.3 __resetForTests

两个 composable 的测试重置函数需更新，改为清理 engine 内部状态：
```js
export function __resetForTests() {
  engine.__reset()  // 清理内存状态 + localStorage
}
```

---

## 8. 实习经历修复

### 8.1 问题

`ResumePortal.vue` 中 `experiences` 区块只查询 `type: 'work'`，`internship` 条目被忽略。

### 8.2 修复

**改动点 1**：`storageEngine.getByType` 支持数组参数

```js
function getByType(type) {
  const types = Array.isArray(type) ? type : [type]
  const filtered = entries.value.filter(e => types.includes(e.type))
  // ... 排序逻辑不变
}
```

**改动点 2**：`ResumePortal.vue` `blockProps('experiences')` 传数组

```js
case 'experiences':
  return {
    label: '工作经历',
    title: 'Experience',
    items: resume.getByType(['work', 'internship']),
    itemType: 'experience',
    collapsible: true,
  }
```

**改动点 3**：`ResumeBlockTimeline.vue` 根据 `item.type` 显示标签

```vue
<!-- 在 timeline 条目的 company 行增加徽标 -->
<span v-if="item.type === 'internship'" class="internship-badge">实习</span>
```

**改动点 4**：`isBlockEmpty` 检查 `['work', 'internship']`

```js
function isBlockEmpty(blockId) {
  // ...
  if (blockId === 'experiences') {
    return resume.getByType(['work', 'internship']).length === 0
  }
  // ...
}
```

### 8.3 样式

```css
.internship-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}
```

---

## 9. 测试策略

### 9.1 测试范围

| 模块 | 测试重点 |
|------|----------|
| `schemas.test.js` | 所有 schema 字段定义完整性、默认值正确性、`getMatchableFields` 返回正确 |
| `storageEngine.test.js` | CRUD 全流程、多类型查询、旧数据迁移、seed 注入、normalize 自愈 |
| `migration.test.js` | 各版本迁移函数幂等性、链式执行正确性 |
| `backup.test.js` | 导出完整性、导入校验、拒绝损坏数据、往返一致性 |
| `useResume.test.js` | 更新以适配 engine（现有用例覆盖，确保 API 兼容） |
| `useResumeLayout.test.js` | 更新以适配 engine |

### 9.2 黄金用例

- storage engine 初始化 + seed 注入
- `getByType(['work', 'internship'])` 合并查询 + 排序
- 旧 4-key 迁移到新单 key
- normalizeEntry 补全缺失字段
- backup exportAll → importAll 往返一致性

---

## 10. 实施顺序

| 阶段 | 内容 | 依赖 |
|------|------|------|
| Phase 1 | `schemas.js` — 字段定义 | 无 |
| Phase 2 | `migration.js` — 迁移管线 | 无 |
| Phase 3 | `storageEngine.js` — 核心引擎 | Phase 1 + 2 |
| Phase 4 | `backup.js` — 备份模块 | Phase 3 |
| Phase 5 | 重构 `useResume.js` — delegate 到 engine | Phase 3 |
| Phase 6 | 重构 `useResumeLayout.js` — delegate 到 engine | Phase 3 |
| Phase 7 | 修复实习经历展示 | Phase 5 |
| Phase 8 | 管理页增加导入/导出按钮 | Phase 4 |
| Phase 9 | 全量测试 + 黄金用例 | Phase 1-8 |

---

## 11. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 旧数据迁移失败 | 旧 key 不删除，可手动恢复；engine 读失败时 fallback 到空数组 |
| schema 校验过严拒绝合法数据 | `normalizeEntry` 只补全不删除多余字段；`importAll` 校验失败只拒绝不覆盖 |
| composable API 变更破坏组件 | 严格保持外部 API 签名不变，Phase 5/6 只改内部实现 |

## 12. 与旧版存储设计的关系

本文档取代 `docs/superpowers/specs/2026-06-04-resume-storage-design.md`（早期草案，布局与数据模型均已过时）。
