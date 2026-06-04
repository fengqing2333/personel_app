#!/usr/bin/env node
/**
 * check-commit-msg.mjs — 校验 commit message 必须携带 [V<x.y.z>] 版本号前缀
 *
 * 唯一依据：openspec/specs/workflow/spec.md "补充规则 #7：Git 提交信息必须携带版本号"
 *
 * 用法：
 *   作为 husky commit-msg hook 调用：node scripts/check-commit-msg.mjs "$1"
 *   也可独立调用：node scripts/check-commit-msg.mjs path/to/COMMIT_EDITMSG
 *
 * 校验规则：
 *  - 第一行必须形如 `[V<MAJOR>.<MINOR>.<PATCH>] <subject>`，例如 `[V1.4.5] fix: xxx`
 *  - 允许 commit 流程自动生成的特殊提交（merge / revert / fixup / squash）放行
 *
 * 退出码：
 *  0 = 通过
 *  1 = 校验失败
 *
 * 依赖：仅 Node.js 内置 fs（无 npm 依赖）
 */

import { readFileSync, existsSync } from 'node:fs'

const COLOR = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`
}

const VERSION_PREFIX_RE = /^\[V\d+\.\d+\.\d+\]\s+\S+/
// 允许放行的特殊提交首行模式
const ALLOW_LIST = [
  /^Merge\b/i,
  /^Revert\b/i,
  /^fixup!\s/i,
  /^squash!\s/i,
  /^amend!\s/i
]

function main() {
  const msgFile = process.argv[2]
  if (!msgFile) {
    console.error(COLOR.red('✗ check-commit-msg: 缺少 commit message 文件路径参数'))
    process.exit(1)
  }
  if (!existsSync(msgFile)) {
    console.error(COLOR.red(`✗ check-commit-msg: 找不到文件 ${msgFile}`))
    process.exit(1)
  }

  const raw = readFileSync(msgFile, 'utf8')
  // 去掉 git 自动添加的注释行（# 开头）后取第一行非空
  const firstLine = raw
    .split('\n')
    .map((l) => l.trimEnd())
    .find((l) => l.trim() && !l.startsWith('#')) || ''

  if (ALLOW_LIST.some((re) => re.test(firstLine))) {
    console.log(COLOR.yellow(`! check-commit-msg: 放行特殊提交：${firstLine.slice(0, 60)}`))
    process.exit(0)
  }

  if (VERSION_PREFIX_RE.test(firstLine)) {
    console.log(COLOR.green(`✓ check-commit-msg: 版本号前缀合规`))
    process.exit(0)
  }

  console.error('')
  console.error(COLOR.red(COLOR.bold('✗ check-commit-msg: commit message 缺少版本号前缀')))
  console.error(`  实际首行：${COLOR.yellow(firstLine || '(空)')}`)
  console.error(`  期望格式：${COLOR.green('[V<MAJOR>.<MINOR>.<PATCH>] <subject>')}`)
  console.error(`  示例    ：${COLOR.green('[V1.4.5] fix: 修复门户侧边栏渲染异常')}`)
  console.error('')
  console.error('  依据：openspec/specs/workflow/spec.md 补充规则 #7')
  process.exit(1)
}

main()