#!/usr/bin/env node
/**
 * check-workflow.mjs — 阶段闸门自动校验脚本
 *
 * 唯一依据: openspec/specs/workflow/spec.md "阶段闸门" 章节。
 * 仅扫描 openspec/changes/ 下的活跃变更目录（不进入 archive/）。
 *
 * 检查项（来自 v1.3.0 design.md D4）：
 *  1. 目录命名格式: v<MAJOR>-<MINOR>-<PATCH>-<kebab-name>
 *  2. 必备文件存在: proposal.md / design.md / tasks.md / .openspec.yaml
 *  3. proposal.md 标题前缀 [V<x.y.z>]
 *  4. specs/ 目录存在且非空
 *  5. tasks.md 是否全部勾选 → 若全部勾选，则要求 review.md 存在且结论为"通过"
 *
 * 退出码：
 *  0 = 全部通过（可能含 WARN）
 *  1 = 至少一个 ERROR
 *
 * 依赖：仅 Node.js 内置 fs / path（无 npm 依赖）。
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CHANGES_DIR = join(ROOT, 'openspec', 'changes')

const DIR_NAME_RE = /^v\d+-\d+-\d+-[a-z0-9-]+$/
const PROPOSAL_TITLE_RE = /^#\s*\[V\d+\.\d+\.\d+\]/m
const TASK_ITEM_RE = /^\s*-\s*\[([ xX])\]/gm

const COLOR = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`
}

let errorCount = 0
let warnCount = 0

function err(dir, msg) {
  errorCount++
  console.log(`  ${COLOR.red('✗ ERROR')}  ${msg}`)
}

function warn(dir, msg) {
  warnCount++
  console.log(`  ${COLOR.yellow('! WARN ')}  ${msg}`)
}

function ok(msg) {
  console.log(`  ${COLOR.green('✓ OK   ')}  ${msg}`)
}

function listActiveChanges() {
  if (!existsSync(CHANGES_DIR)) return []
  return readdirSync(CHANGES_DIR)
    .filter((name) => name !== 'archive')
    .map((name) => join(CHANGES_DIR, name))
    .filter((p) => statSync(p).isDirectory())
}

function isDirNonEmpty(p) {
  if (!existsSync(p) || !statSync(p).isDirectory()) return false
  return readdirSync(p).length > 0
}

function fileHasContent(p) {
  return existsSync(p) && readFileSync(p, 'utf8').trim().length > 0
}

function checkOne(changeDir) {
  const name = basename(changeDir)
  console.log(`\n${COLOR.bold(`▶ ${name}`)}`)

  // 1. 目录命名
  if (DIR_NAME_RE.test(name)) {
    ok('目录命名符合 v<MAJOR>-<MINOR>-<PATCH>-<kebab-name>')
  } else {
    err(changeDir, `目录名 "${name}" 不符合 v<MAJOR>-<MINOR>-<PATCH>-<kebab-name>`)
  }

  // 2. 必备文件
  const required = ['proposal.md', 'design.md', 'tasks.md', '.openspec.yaml']
  for (const f of required) {
    const fp = join(changeDir, f)
    if (fileHasContent(fp)) {
      ok(`${f} 存在且非空`)
    } else if (existsSync(fp)) {
      err(changeDir, `${f} 存在但内容为空`)
    } else {
      err(changeDir, `${f} 缺失`)
    }
  }

  // 3. proposal 标题格式
  const proposalPath = join(changeDir, 'proposal.md')
  if (existsSync(proposalPath)) {
    const proposal = readFileSync(proposalPath, 'utf8')
    if (PROPOSAL_TITLE_RE.test(proposal)) {
      ok('proposal.md 标题前缀符合 [V<x.y.z>] 格式')
    } else {
      // 标题前缀可能是 # V1.3.1 — ...(中划线变体也可接受),只警告
      warn(changeDir, `proposal.md 标题未严格匹配 [V<x.y.z>] 前缀(检查 # [V1.3.0] xxx 形式)`)
    }
  }

  // 4. specs/ 目录
  const specsDir = join(changeDir, 'specs')
  if (existsSync(specsDir)) {
    let hasFile = false
    const walk = (p) => {
      for (const e of readdirSync(p)) {
        const ep = join(p, e)
        if (statSync(ep).isDirectory()) walk(ep)
        else if (e.endsWith('.md')) hasFile = true
      }
    }
    walk(specsDir)
    if (hasFile) ok('specs/ 目录存在且含至少一个 .md 文件')
    else warn(changeDir, 'specs/ 目录存在但无任何 .md 文件(若属纯重构/纯样式/纯注释,需在 review.md 中显式声明)')
  } else {
    warn(changeDir, 'specs/ 目录不存在(若属纯重构/纯样式/纯注释,需在 review.md 中显式声明)')
  }

  // 5. tasks 全勾 + review.md
  const tasksPath = join(changeDir, 'tasks.md')
  let allChecked = false
  if (existsSync(tasksPath)) {
    const tasks = readFileSync(tasksPath, 'utf8')
    const matches = [...tasks.matchAll(TASK_ITEM_RE)]
    const total = matches.length
    const unchecked = matches.filter((m) => m[1] === ' ').length
    const checked = total - unchecked
    if (total === 0) {
      warn(changeDir, 'tasks.md 中未发现任何复选框任务项')
    } else if (unchecked === 0) {
      ok(`tasks.md 全部勾选(${checked}/${total})`)
      allChecked = true
    } else {
      ok(`tasks.md 已勾选 ${checked}/${total}(未完成 ${unchecked} 项)`)
    }
  }

  // review.md 仅在 tasks 全部勾选(意味着已进入 Phase 3.5/4)时强制
  const reviewPath = join(changeDir, 'review.md')
  if (allChecked) {
    if (!existsSync(reviewPath)) {
      err(changeDir, 'tasks.md 已全部勾选但 review.md 缺失(Phase 3.5 闸门未通过)')
    } else {
      const review = readFileSync(reviewPath, 'utf8')
      // 结论段: 寻找"## 结论"或"## 6./## 7. 结论"等
      const conclusionPassed = /\n-\s*\[[xX]\]\s*通过/.test(review)
      if (conclusionPassed) {
        ok('review.md 结论已勾选"通过"')
      } else {
        err(changeDir, 'review.md 存在但"结论"段未勾选"通过"(归档前必须通过)')
      }
    }
  } else if (existsSync(reviewPath)) {
    ok('review.md 存在(草稿,tasks 完成后再校验结论)')
  }
}

function main() {
  console.log(COLOR.bold('🔎 check-workflow — 阶段闸门校验'))
  const changes = listActiveChanges()
  if (changes.length === 0) {
    console.log(COLOR.gray('  (无活跃变更目录)'))
    process.exit(0)
  }
  for (const c of changes) checkOne(c)
  console.log('')
  console.log(COLOR.bold('— 汇总 —'))
  console.log(`扫描变更: ${changes.length}`)
  console.log(`  ${errorCount > 0 ? COLOR.red(`ERROR: ${errorCount}`) : COLOR.green('ERROR: 0')}`)
  console.log(`  ${warnCount > 0 ? COLOR.yellow(`WARN : ${warnCount}`) : COLOR.green('WARN : 0')}`)
  process.exit(errorCount > 0 ? 1 : 0)
}

main()