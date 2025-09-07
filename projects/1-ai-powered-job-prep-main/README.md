# 说明

1. 使用 canary 版本的 Nextjs 是因为它想使用新的缓存机制，当前 Nextjs 已经来到 15.5，不知道正式版是否已经支持
2. package.json 中为什么使用 overrides，是因为 clerk 在安装的时候，不支持 canary 版本；
3. arcjet 是用来进行安全防护的，可以用来防止恶意请求，以及进行流量控制；
4. @t3-oss/env-nextjs：专门为 Next.js 应用设计的环境变量验证库，由 T3 Stack 团队开发。它提供了类型安全的环境变量管理
5. tweakcn:专为 shadcn/ui 组件库 设计的可视化主题编辑器和生成工具,不是 shadcn/ui 的替代品，而是帮助开发者更便捷地定制 shadcn/ui 主题样式

## 数据库配置

1. Drizzle：drizzle-kit 的作用是：drizzle 的开发工具包，支持数据库迁移管理，schema 管理，可视化界面等等；
