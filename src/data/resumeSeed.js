/**
 * 简历示例种子数据
 *
 * 内容对齐 design-previews/version-a-warm-charcoal.html
 * （陈远舟 · 字节跳动 / 蚂蚁集团 / 美团 / Atlas / Chartify / devkit-cli / chen.dev）
 *
 * 注入条件:
 *   - localStorage 中无 'resume-data' 键(首次访问)
 *   - 或键存在但解析为空数组
 */

export const RESUME_SEED = [
  // profile
  {
    type: 'profile',
    name: '陈远舟',
    title: '高级前端工程师 · 设计系统 / 可视化方向',
    email: 'chen@example.dev',
    phone: '+86 138-0000-0000',
    location: '北京 · 朝阳',
    summary:
      '7 年前端经验，专注复杂业务前端架构与设计系统建设。喜欢把混乱抽象成秩序，把秩序写成可复用的代码。业余时间写博客、做开源、拍胶片。',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    github: 'chenyz',
    website: 'chen.dev',
    tags: [],
  },

  // work × 3
  {
    type: 'work',
    company: '字节跳动 · 抖音电商',
    position: '高级前端工程师 / 设计系统负责人',
    startDate: '2023.06',
    endDate: '',
    location: '北京',
    description:
    '主导抖音电商商家工作台的设计系统建设，从零搭建组件库与设计 token 体系，服务于 6 个业务线 200+ 页面。',
    achievements: [
      '设计并落地基于 Design Token 的多主题方案，迁移成本降低 60%',
      '推动组件库覆盖率从 0 提升至 78%，PR review 周期缩短 40%',
      'Tech Lead 5 人小组，制定前端规范与代码评审标准',
    ],
    tags: ['Design Tokens', 'Vue 3', 'Monorepo'],
  },
  {
    type: 'work',
    company: '蚂蚁集团 · 数字金融',
    position: '前端工程师',
    startDate: '2020.04',
    endDate: '2023.05',
    location: '杭州',
    description:
      '负责蚂蚁财富 PC 端核心业务，包括基金交易、组合管理、行情可视化模块。',
    achievements: [
      '重构行情图表 SDK，首屏渲染从 1.2s 优化至 380ms',
      '推动构建工具 Webpack → Vite 迁移，本地启动从 45s 降至 3s',
    ],
    tags: ['React', 'Canvas', 'Vite'],
  },
  {
    type: 'work',
    company: '美团 · 到店事业群',
    position: '初级前端工程师',
    startDate: '2018.07',
    endDate: '2020.03',
    location: '北京',
    description: '参与商家 SaaS 工作台开发，主导报表中心模块。',
    achievements: [],
    tags: ['Vue 2', 'ECharts'],
  },

  // project × 4
  {
    type: 'project',
    name: 'Atlas Design System',
    role: '项目负责人',
    title: '企业级设计系统',
    description:
      '企业级设计系统，包含 80+ 组件、主题引擎与可视化文档站，覆盖 6 条业务线。',
    startDate: '2023.07',
    endDate: '',
    tags: ['Vue 3', 'TypeScript', 'Vite'],
    featured: true,
    url: '',
  },
  {
    type: 'project',
    name: 'Chartify',
    role: '核心开发者',
    title: '金融行情图表库',
    description:
      '轻量金融行情图表库，基于 Canvas 渲染，支持 K 线/分时/盘口，性能优于同类 3 倍。',
    startDate: '2021.05',
    endDate: '2023.02',
    tags: ['Canvas', 'Web Worker'],
    featured: true,
    url: '',
  },
  {
    type: 'project',
    name: 'devkit-cli',
    role: '作者',
    title: '前端脚手架工具',
    description:
      '前端脚手架工具，集成模板生成、Lint、自动发版。GitHub ★ 1.2k，月下载 2 万+。',
    startDate: '2020.09',
    endDate: '',
    tags: ['Node.js', 'Inquirer'],
    featured: false,
    url: 'github.com/chenyz/devkit-cli',
  },
  {
    type: 'project',
    name: 'chen.dev',
    role: '作者',
    title: '个人博客与技术写作平台',
    description:
      '个人博客与技术写作平台，月访问 2 万+，原创文章 80+ 篇，主题被 200+ 开发者复用。',
    startDate: '2019.03',
    endDate: '',
    tags: ['Astro', 'MDX'],
    featured: false,
    url: 'chen.dev',
  },

  // skill × 6（对齐设计稿 6 条）
  { type: 'skill', skillName: 'Vue / React', category: '前端', proficiency: 5 },
  { type: 'skill', skillName: 'TypeScript', category: '前端', proficiency: 5 },
  { type: 'skill', skillName: '设计系统 / Tokens', category: '前端', proficiency: 4 },
  { type: 'skill', skillName: 'Canvas / WebGL', category: '可视化', proficiency: 4 },
  { type: 'skill', skillName: 'Node.js', category: '后端', proficiency: 4 },
  { type: 'skill', skillName: 'UI / 视觉设计', category: '设计协作', proficiency: 3 },

  // education × 1
  {
    type: 'education',
    school: '浙江大学',
    degree: '学士',
    field: '软件工程',
    gpa: '3.8 / 4.0',
    startDate: '2014.09',
    endDate: '2018.06',
    description: '校优秀毕业生 · ACM 程序设计竞赛区域赛银奖',
    tags: ['CS', 'ACM'],
  },

  // certificate × 3（对齐设计稿）
  {
    type: 'certificate',
    name: 'AWS Solutions Architect Associate',
    issuer: 'Amazon Web Services',
    date: '2023',
    description: 'AWS 官方架构师认证',
    url: '',
  },
  {
    type: 'certificate',
    name: '蚂蚁前端 P6 → P7 晋升',
    issuer: '蚂蚁集团',
    date: '2022',
    description: '内部技术职级晋升答辩通过',
    url: '',
  },
  {
    type: 'certificate',
    name: 'VueConf 2023 受邀讲师',
    issuer: 'Vue.js 中国社区',
    date: '2023',
    description: '主题分享：设计系统在大型业务下的落地实践',
    url: '',
  },
]