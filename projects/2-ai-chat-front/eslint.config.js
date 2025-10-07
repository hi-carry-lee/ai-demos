import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react'; // 🔥 新增：React 核心规则插件
import tseslint from 'typescript-eslint';

/**
 * 这是一个适合中型项目的eslint配置，根据项目实际情况，可以适当调整
 */
export default [
  // ========================================
  // 1. 全局忽略文件
  // ========================================
  // 忽略编译输出目录和其他不需要检查的文件
  {
    ignores: [
      'dist/**', // 构建输出目录
      'build/**', // 备用构建目录
      'node_modules/**', // 依赖包（通常会自动忽略，但显式声明更清晰）
      'coverage/**', // 测试覆盖率报告
      '*.config.js', // JavaScript 配置文件
      '*.config.mjs', // ES Module 配置文件
      '.eslintcache', // ESLint 缓存文件
      // 其他可能需要忽略的：
      // 'public/**',      // 静态资源目录
      // 'storybook-static/**', // Storybook 构建输出
    ],
  },

  // ========================================
  // 2. JavaScript 推荐规则（基础）
  // ========================================
  // ESLint 核心推荐规则，适用于所有 JavaScript 代码
  js.configs.recommended,

  // ========================================
  // 3. TypeScript 推荐规则
  // ========================================
  // TypeScript ESLint 的推荐配置
  // 其他选项：
  // - tseslint.configs.strict（更严格的类型检查）
  // - tseslint.configs.stylistic（代码风格规则）
  ...tseslint.configs.recommended,

  // ========================================
  // 4. React 相关配置（核心部分）
  // ========================================
  {
    // 仅对 TypeScript React 文件生效
    files: ['**/*.{ts,tsx}'],

    // 🔥 问题 1：缺少 React 插件
    // 原配置只有 react-hooks 和 react-refresh，缺少核心的 eslint-plugin-react
    plugins: {
      react, // React 核心规则（检查 JSX、组件等）
      'react-hooks': reactHooks, // React Hooks 规则
      'react-refresh': reactRefresh, // Vite Fast Refresh 规则
    },

    languageOptions: {
      // 🔥 问题 2：ecmaVersion 应该设置为 'latest' 或更高版本
      // 2020 版本较旧，建议使用 'latest' 或 2023+
      // 可选值：2015, 2016, ..., 2023, 2024, 'latest'
      ecmaVersion: 'latest',

      // 浏览器全局变量（如 window、document）
      globals: globals.browser,

      // 🔥 问题 3：缺少 JSX 解析配置
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // 启用 JSX 语法支持
        },
        // 你的项目使用了 TypeScript 项目引用（Project References）
        // tsconfig.json 是根配置文件，主要用于引用其他配置
        // tsconfig.app.json 是实际的应用配置文件，包含了编译选项和路径映射
        project: './tsconfig.app.json',
        // 这是 Node.js 的 ES 模块语法，等同于 __dirname，明确告诉 ESLint 当前配置文件的目录就是根目录
        tsconfigRootDir: import.meta.dirname,
      },
    },

    // 🔥 问题 4：缺少 React 版本配置
    // React 插件需要知道项目使用的 React 版本
    settings: {
      react: {
        version: 'detect', // 自动检测 React 版本（推荐）
        // 其他选项：
        // version: '18.3',  // 手动指定版本
        // version: '19.0',  // React 19
      },
    },

    rules: {
      // ========================================
      // React 核心规则
      // ========================================

      // 禁止缺少 key 属性（列表渲染必须有 key）
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true, // 检查 <> </> 语法
          checkKeyMustBeforeSpread: true, // key 必须在 spread 之前
        },
      ],

      // 禁止在 JSX 中使用未声明的变量
      'react/jsx-no-undef': 'error',

      // 禁止重复的 props
      'react/jsx-no-duplicate-props': 'error',

      // 禁止使用危险的 props（如 dangerouslySetInnerHTML）
      'react/no-danger': 'warn',

      // 禁止在 setState 中直接使用 this.state
      'react/no-access-state-in-setstate': 'error',

      // 禁止使用已废弃的方法
      'react/no-deprecated': 'warn',

      // 禁止在 componentDidMount 中使用 setState
      'react/no-did-mount-set-state': 'error',

      // 禁止在 componentDidUpdate 中使用 setState
      'react/no-did-update-set-state': 'error',

      // 🔥 React 19 相关：不再需要导入 React
      // React 17+ 使用新的 JSX 转换，不需要显式导入 React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // 优先使用函数组件而不是类组件（现代 React 推荐）
      'react/prefer-stateless-function': 'warn',

      // 要求为没有子元素的组件使用自闭合标签
      'react/self-closing-comp': 'error',

      // ========================================
      // React Hooks 规则（关键！）
      // ========================================

      // 🔥 问题 5：原配置使用 extends 方式，应该直接配置规则
      // React Hooks 的依赖检查（防止遗漏依赖）
      'react-hooks/rules-of-hooks': 'error', // 检查 Hook 使用规则
      'react-hooks/exhaustive-deps': 'warn', // 检查 Hook 依赖数组（设为 warn 因为有时需要手动控制）

      // ========================================
      // React Refresh 规则（Vite HMR）
      // ========================================

      // 仅导出 React 组件（确保 Fast Refresh 正常工作）
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true, // 允许导出常量（如 const CONSTANT = 'value'）
        },
      ],

      // ========================================
      // TypeScript + React 优化规则
      // ========================================

      // 🔥 针对中小型项目的优化：
      // TypeScript 已经提供类型检查，可以放宽某些规则

      // 允许在快速开发时使用 any（但会有警告）
      '@typescript-eslint/no-explicit-any': 'warn',

      // 不强制要求函数返回类型（TypeScript 会推断）
      '@typescript-eslint/explicit-function-return-type': 'off',

      // 不强制要求导出函数的返回类型
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // 未使用的变量报错，但允许以 _ 开头的变量
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // 忽略 _props, _event 等
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // 优先使用 type import（减少打包体积）
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports', // 使用内联语法：import { type User } from '...'
        },
      ],

      // ========================================
      // 代码质量规则
      // ========================================

      // 限制 console 使用（保留 warn 和 error）
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // 优先使用 const
      'prefer-const': 'error',

      // 禁止使用 var
      'no-var': 'error',

      // 优先使用模板字符串
      'prefer-template': 'error',
    },
  },

  // ========================================
  // 5. 测试文件特殊规则
  // ========================================
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      // 测试文件中放宽某些规则
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'react-hooks/exhaustive-deps': 'off', // 测试中可能不需要完整依赖
    },
  },

  // ========================================
  // 6. 配置文件特殊规则
  // ========================================
  {
    files: ['*.config.{js,ts}', 'vite.config.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off', // 配置文件可能需要 require
    },
  },
];
