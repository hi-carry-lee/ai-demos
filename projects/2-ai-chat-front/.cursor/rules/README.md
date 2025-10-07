# React + TypeScript Cursor Rules

这个目录包含了为 React + TypeScript 项目定制的 Cursor Rules，旨在提供一致的开发体验和最佳实践指导。

## 📁 规则文件概览

### 🎯 核心规则

| 文件名                    | 描述                       | 适用文件                                                  |
| ------------------------- | -------------------------- | --------------------------------------------------------- |
| `project-overview.mdc`    | 项目概览和工作原则         | `**/*.tsx`, `**/*.ts`, `**/*.jsx`, `**/*.js`, `**/*.json` |
| `code-style.mdc`          | 代码风格和 TypeScript 规范 | `**/*.tsx`, `**/*.ts`, `**/*.jsx`, `**/*.js`              |
| `component-templates.mdc` | 组件开发模板和最佳实践     | `**/*.tsx`, `**/*.jsx`                                    |

### 🛠️ 技术栈规则

| 文件名                   | 描述                              | 适用文件                           |
| ------------------------ | --------------------------------- | ---------------------------------- |
| `state-management.mdc`   | Zustand + TanStack Query 状态管理 | `**/*.tsx`, `**/*.ts`              |
| `form-validation.mdc`    | React Hook Form + Zod 表单验证    | `**/*.tsx`, `**/*.ts`              |
| `styling-guidelines.mdc` | Tailwind CSS + Shadcn UI 样式指南 | `**/*.tsx`, `**/*.jsx`, `**/*.css` |
| `api-integration.mdc`    | API 集成和 HTTP 请求最佳实践      | `**/*.tsx`, `**/*.ts`              |

### 🚨 质量保证

| 文件名                | 描述               | 适用文件                                     |
| --------------------- | ------------------ | -------------------------------------------- |
| `common-pitfalls.mdc` | 常见陷阱和错误预防 | `**/*.tsx`, `**/*.ts`, `**/*.jsx`, `**/*.js` |

## 🚀 技术栈支持

这些规则专门为以下技术栈设计：

- **React 19.x** - 最新的 React 版本
- **TypeScript 5.x** - 严格的类型检查
- **Vite 7.x** - 快速的构建工具
- **Tailwind CSS 4.x** - 实用优先的 CSS 框架
- **Shadcn UI** - 高质量的组件库
- **React Router 7.x** - 客户端路由
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 服务器状态管理
- **React Hook Form** - 表单处理
- **Zod** - 模式验证
- **next-themes** - 主题管理
- **Axios** - HTTP 客户端
- **Sonner** - 通知组件

## 📋 使用指南

### 1. 开发新组件

当需要创建新组件时，参考以下流程：

1. **查看 `project-overview.mdc`** - 了解项目结构和开发原则
2. **参考 `component-templates.mdc`** - 选择合适的组件模板
3. **遵循 `code-style.mdc`** - 确保代码风格一致
4. **应用 `styling-guidelines.mdc`** - 使用正确的样式规范

### 2. 状态管理

- **客户端状态** → 参考 `state-management.mdc` 中的 Zustand 部分
- **服务器状态** → 参考 `state-management.mdc` 中的 TanStack Query 部分
- **表单状态** → 参考 `form-validation.mdc`

### 3. API 集成

- **HTTP 请求** → 参考 `api-integration.mdc`
- **错误处理** → 参考 `api-integration.mdc` 和 `common-pitfalls.mdc`

### 4. 样式开发

- **Tailwind CSS** → 参考 `styling-guidelines.mdc`
- **Shadcn UI** → 参考 `styling-guidelines.mdc` 中的组件扩展部分
- **响应式设计** → 参考 `styling-guidelines.mdc` 中的响应式部分

## ⚠️ 常见陷阱

在开发过程中，请特别注意 `common-pitfalls.mdc` 中提到的常见错误：

- React Hooks 使用错误
- TypeScript 类型安全问题
- 状态管理最佳实践
- 性能优化注意事项
- 样式和可访问性问题

## 🔧 自定义和扩展

这些规则可以根据项目需求进行自定义：

1. **修改现有规则** - 编辑对应的 `.mdc` 文件
2. **添加新规则** - 创建新的 `.mdc` 文件
3. **调整适用范围** - 修改 `globs` 配置

## 📚 学习资源

为了更好地使用这些规则，建议了解以下技术：

- [React 官方文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)

## 🤝 贡献

如果你发现规则中的问题或有改进建议，请：

1. 检查现有规则是否已经覆盖
2. 提供具体的改进建议
3. 考虑向后兼容性
4. 确保规则适用于中小型项目

---

**注意**: 这些规则专为中小型 React 项目设计，避免过度工程化，注重实用性和开发效率。
