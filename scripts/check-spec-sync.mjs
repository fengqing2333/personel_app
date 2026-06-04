#!/usr/bin/env node
/**
 * check-spec-sync.mjs — 校验 src/ 行为变更必须伴随 specs/ 同步
 *
 * 唯一依据：openspec/specs/workflow/spec.md "补充规则 #8：规约同步硬约束"
 *
 *   "任何 src/ 下的行为变更（新增/修改/删除可观测行为），
 *    必须在同一变更目录的 specs/ 中有对应描述。"
 *
 * 触发逻辑：
 *  1. 找到当前唯一活跃变更目录（openspec/changes/ 下、非 archive 的目录）
 *  2. 收集 git 暂存区（默认）或工作区相对 HEAD 的 diff
 *  3. 若 src/ 有改动但本次 diff 中没有任何 openspec/changes/<active>/specs/ 改动
 *     → ERROR（除非用户显式 SKIP，见下方）
 *
 * 跳过机制（用于纯重构/样式/注释，但必须留痕）：
 *  - 设置环境变量 SKIP_SPEC_SYNC=1 即放行，并在控制台 WARN
 *    （规范要求：放行时必须在对应 review.md 中显式声明"无行为变更"）
 *
 * 退出码：
 *  0 = 通过（或无活跃变更 / 无 src/ 改动 / 显式 SKIP）
 *  1 = 校验失败
 *
 * 依赖：仅 Node.js 内置 child_process / fs（无 npm 依赖）
 */

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CHANGES_DIR = join(ROOT, 'openspec', 'changes')

const COLOR = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`
}

function listActiveChanges() {
  if(!existsSync(CHANGES_DIR)) return []
  return readdirSync(CHANGES_DIR)
    .filter((n) => n !== 'archive')
    .map((n) => ({ name: n, path: join(CHANGES_DIR, n) }))
    .filter((e) => statSync(e.path).isDirectory())
}

function gitDiffFiles() {
  // 优先取暂存区（pre-commit 场景），若为空则取工作区相对 HEAD
  let staged = ''
  try {
    staged = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf8' })
  } catch {
    // 仓库未 git init 或 git 不可用 → 跳过校验
    return null
  }
  let files = staged.split('\n').map((s) => s.trim()).filter(Boolean)
  if (files.length === 0) {
    try {
      const worktree = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' })
      files = worktree.split('\n').map((s) => s.trim()).filter(Boolean)
    } catch {
      // HEAD 不存在（首次提交）→ 返回空集
      files = []
    }
  }
  return files
}

function main() {
  console.log(COLOR.bold('🔎 check-spec-sync — 规约同步校验'))

  if (process.env.SKIP_SPEC_SYNC === '1') {
    console.log(COLOR.yellow('! 已设置 SKIP_SPEC_SYNC=1：放行本次校验'))
    console.log(COLOR.yellow('  请在对应变更目录的 review.md 中显式声明"无行为变更"'))
    process.exit(0)
  }

  const actives = listActiveChanges()
  if (actives.length === 0) {
    console.log(COLOR.gray('  (无活跃变更目录，跳过)'))
    process.exit(0)
  }
  if (actives.length > 1) {
    console.log(COLOR.yellow(`! 检测到 ${actives.length} 个活跃变更目录，将合并校验：`))
    for (const a of actives) console.log(COLOR.gray(`    - ${a.name}`))
  }

  const files = gitDiffFiles()
  if (files === null) {
    console.log(COLOR.gray('  (git 不可用，跳过)'))
    process.exit(0)
  }
  if (files.length === 0) {
    console.log(COLOR.gray('  (本次无 git diff，跳过)'))
    process.exit(0)
  }

  const srcChanged = files.filter((f) => f.startsWith('src/') && !f.includes('__tests__/'))
  const specChanged = files.filter((f) =>
    actives.some((a) => f.startsWith(`openspec/changes/${a.name}/specs/`))
  )

  if (srcChanged.length === 0) {
    console.log(COLOR.green('✓ 无 src/ 行为变更（或仅测试），无需同步 specs/'))
    process.exit(0)
  }

  if (specChanged.length === 0) {
    console.error('')
    console.error(COLOR.red(COLOR.bold('✗ check-spec-sync: src/ 有行为变更但 specs/ 未同步')))
    console.error('  受影响 src 文件（前 5 条）：')
    for (const f of srcChanged.slice(0, 5)) console.error(`    - ${f}`)
    console.error('')
    console.error('  规则依据：openspec/specs/workflow/spec.md 补充规则 #8（规约同步硬约束）')
    console.error('  处置选项：')
    console.error('    1) 在活跃变更目录的 specs/ 下补齐对应描述，重新 git add 后再提交')
    console.error('    2) 若属纯重构/纯样式/纯注释，使用 SKIP_SPEC_SYNC=1 git commit ...')
    console.error('       并在变更目录的 review.md 中显式声明"无行为变更"')
    process.exit(1)
  }

  console.log(COLOR.green(`✓ src/ 变更 ${srcChanged.length} 个文件，specs/ 同步 ${specChanged.length} 个文件`))
  process.exit(0)
}

main()