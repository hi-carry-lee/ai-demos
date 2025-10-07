import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  // ========================================
  // 1. 忽略的文件和目录
  // ========================================
  {
    ignores: [
      'node_modules/**', // 依赖包目录，不需要检查
      'dist/**', // 编译输出目录（通常是生产构建）
      'build/**', // 编译输出目录（某些项目使用 build）
      'coverage/**', // 测试覆盖率报告目录
      '*.config.js', // JavaScript 配置文件（如 webpack.config.js）
      '*.config.mjs', // ES Module 配置文件
      'prisma/migrations/**', // Prisma 数据库迁移文件（自动生成，不应修改）
      '.env*', // 环境变量文件
      // 其他可能需要忽略的：
      'public/**', // 静态资源目录
      '*.min.js', // 压缩后的 JS 文件
      'scripts/**', // 构建脚本
      'docs/**', // 文档目录
    ],
  },

  // ========================================
  // 2. ESLint 核心推荐规则
  // ========================================
  // 包含 ESLint 官方推荐的基础规则（如 no-undef, no-unused-vars 等）
  // 其他选项：js.configs.all（所有规则，非常严格，不推荐）
  js.configs.recommended,

  // ========================================
  // 3. TypeScript 推荐规则
  // ========================================
  // 包含 TypeScript ESLint 推荐的类型安全规则
  // 其他选项：
  // - tseslint.configs.recommendedTypeChecked（需要类型检查的推荐规则）
  // - tseslint.configs.stylistic（代码风格规则）
  ...tseslint.configs.recommended,

  // ========================================
  // 4. TypeScript 严格规则
  // ========================================
  // 更严格的类型检查规则，适合追求代码质量的项目
  // 其他选项：
  // - tseslint.configs.strictTypeChecked（需要类型检查的严格规则）
  // - 如果觉得太严格，可以去掉这一行
  ...tseslint.configs.strict,

  // ========================================
  // 5. 自定义规则配置（核心部分）
  // ========================================
  {
    // 作用于所有 TypeScript 文件
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      // ECMAScript 版本：'latest' 表示最新版本
      // 其他选项：2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023
      ecmaVersion: 'latest',

      // 模块类型：'module' 表示 ES Module
      // 其他选项：'script'（传统脚本模式）, 'commonjs'（CommonJS）
      sourceType: 'module',

      parserOptions: {
        // TypeScript 项目配置文件路径
        project: './tsconfig.json',
        // tsconfig.json 所在的根目录
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      // 注册导入检查插件
      import: importPlugin,
    },

    rules: {
      // ========================================
      // TypeScript 规则（针对中小型项目优化）
      // ========================================

      // 禁止使用 any 类型
      // 可选值：'off' | 'warn' | 'error'
      // 设为 warn：开发时不会阻塞，但会提示（适合快速开发）
      '@typescript-eslint/no-explicit-any': 'error',

      // 要求函数必须显式声明返回类型
      // 可选值：'off' | 'warn' | 'error'
      // 设为 off：中小型项目可以依赖类型推断，减少样板代码
      '@typescript-eslint/explicit-function-return-type': 'off',

      // 要求导出的函数和类方法必须显式声明返回类型
      // 可选值：'off' | 'warn' | 'error'
      // 设为 off：同上，减少样板代码
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // 禁止未使用的变量
      // 可选值：'off' | 'warn' | ['error', options]
      // 配置项：
      // - argsIgnorePattern: 忽略以 _ 开头的参数（Express 中间件常用）
      // - varsIgnorePattern: 忽略以 _ 开头的变量
      // - caughtErrorsIgnorePattern: 忽略以 _ 开头的 catch 错误
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // 例如：(req, _res, next)
          varsIgnorePattern: '^_', // 例如：const _temp = ...
          caughtErrorsIgnorePattern: '^_', // 例如：catch(_error)
        },
      ],

      // 优先使用 ?? 而不是 ||
      // 可选值：'off' | 'warn' | 'error'
      // ?? 只在 null/undefined 时生效，|| 会对 0、'' 等假值生效
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',

      // 优先使用可选链 (?.) 而不是 && 链式判断
      // 可选值：'off' | 'warn' | 'error'
      // 例如：user?.profile?.name 而不是 user && user.profile && user.profile.name
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // 禁止使用非空断言（!）
      // 可选值：'off' | 'warn' | 'error'
      // 例如：user!.name（告诉编译器 user 一定不是 null）
      // 设为 warn：允许使用但会提示，因为有时确实需要
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // 强制使用 type import
      // 可选值：'off' | 'warn' | ['error', options]
      // prefer: 'type-imports' 表示类型导入必须使用 import type { Type } from '...'
      // 其他选项：'no-type-imports'（禁止使用 type import）
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // 禁止不必要的类
      // 可选值：'off' | 'warn' | ['error', options]
      // allowStaticOnly: true 允许只包含静态方法的类
      // 这在 Express.js 的 Controller 模式中很常见
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowStaticOnly: true, // 允许：class UserController { static getUser() {} }
          // 其他选项：
          // allowConstructorOnly: false  // 是否允许只有构造函数的类
          // allowEmpty: false            // 是否允许空类
          // allowWithDecorator: false    // 是否允许带装饰器的类
        },
      ],

      // ========================================
      // 代码质量规则
      // ========================================

      // 限制 console 的使用
      // 可选值：'off' | 'warn' | ['error', options]
      // allow: ['warn', 'error'] 允许 console.warn 和 console.error
      // 生产代码应避免使用 console.log，但保留错误日志
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // 禁止使用 debugger
      // 可选值：'off' | 'warn' | 'error'
      // debugger 只应在开发时使用，不应提交到代码库
      'no-debugger': 'error',

      // 优先使用 const 声明不会重新赋值的变量
      // 可选值：'off' | 'warn' | 'error'
      'prefer-const': 'error',

      // 禁止使用 var，应使用 let 或 const
      // 可选值：'off' | 'warn' | 'error'
      'no-var': 'error',

      // 禁止重复导入同一个模块
      // 可选值：'off' | 'warn' | 'error'
      'no-duplicate-imports': 'error',

      // 禁止无用的表达式
      // 可选值：'off' | 'warn' | 'error'
      // 例如：n + 1; （结果未使用）
      'no-unused-expressions': 'error',

      // 优先使用模板字符串而不是字符串拼接
      // 可选值：'off' | 'warn' | 'error'
      // 例如：`Hello ${name}` 而不是 'Hello ' + name
      'prefer-template': 'error',

      // 优先使用对象属性简写
      // 可选值：'off' | 'warn' | ['error', 'always' | 'never' | 'properties' | 'methods']
      // 例如：{ name } 而不是 { name: name }
      'object-shorthand': 'error',

      // ========================================
      // Node.js 特定规则
      // ========================================

      // 禁止使用 process.exit()
      // 可选值：'off' | 'warn' | 'error'
      // 应该通过抛出错误或返回错误码来退出，而不是强制退出
      'no-process-exit': 'error',

      // 禁止使用同步方法
      // 可选值：'off' | 'warn' | ['error', options]
      // 设为 warn：提示但不强制，因为有些场景（如启动脚本）需要同步
      // 例如：fs.readFileSync 应该用 fs.readFile
      'no-sync': 'warn',

      // ========================================
      // 导入规则（中小型项目简化版）
      // ========================================

      // 强制导入顺序
      // 可选值：'off' | 'warn' | ['error', options]
      'import/order': [
        'warn', // 设为 warn 不会阻塞开发
        {
          // 导入分组顺序：
          groups: [
            'builtin', // Node.js 内置模块（如 fs, path）
            'external', // 外部依赖（如 express, lodash）
            'internal', // 内部路径别名（如 @/utils）
            'parent', // 父级目录（如 ../）
            'sibling', // 同级目录（如 ./）
            'index', // 当前目录的 index 文件
          ],
          // 分组之间是否强制空行
          // 可选值：'always' | 'never' | 'always-and-inside-groups' | 'ignore'
          'newlines-between': 'never',
          // 字母排序
          alphabetize: {
            order: 'asc', // 升序排列（'asc' | 'desc' | 'ignore'）
            caseInsensitive: true, // 忽略大小写
          },
        },
      ],

      // 禁止导入未解析的模块
      // 可选值：'off' | 'warn' | 'error'
      // 设为 off：TypeScript 编译器会处理这个问题
      'import/no-unresolved': 'off',

      // 禁止重复导入同一模块
      // 可选值：'off' | 'warn' | 'error'
      'import/no-duplicates': 'error',

      // ========================================
      // 安全规则
      // ========================================

      // 禁止使用 eval()
      // 可选值：'off' | 'warn' | 'error'
      // eval() 可以执行任意代码，存在严重安全风险
      'no-eval': 'error',

      // 禁止隐式使用 eval()
      // 可选值：'off' | 'warn' | 'error'
      // 例如：setTimeout('alert("Hi!")', 100)
      'no-implied-eval': 'error',

      // 禁止使用 new Function()
      // 可选值：'off' | 'warn' | 'error'
      // new Function() 类似 eval()，存在安全风险
      'no-new-func': 'error',

      // ========================================
      // Express.js 兼容性规则
      // ========================================

      // 允许使用 namespace（命名空间）
      // 可选值：'off' | 'warn' | 'error'
      // Express.js 类型扩展需要使用 namespace：
      // declare global { namespace Express { interface Request { user: User } } }
      '@typescript-eslint/no-namespace': 'off',

      // 允许没有 return 的函数
      // 注意：这个规则名可能不存在，应该是 'explicit-function-return-type'
      // 如果确实存在，作用是允许不显式返回值的函数（Express 中间件常见）
      '@typescript-eslint/require-return': 'off',

      // 允许在非预期位置使用 void 类型
      // 可选值：'off' | 'warn' | 'error'
      // Express.js 中间件的返回类型通常是 void 或 Promise<void>
      '@typescript-eslint/no-invalid-void-type': 'off',
    },
  },

  // ========================================
  // 6. 测试文件特殊规则
  // ========================================
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      // 测试文件中允许使用 any 类型（方便 mock 数据）
      '@typescript-eslint/no-explicit-any': 'off',
      // 测试文件中允许使用 console（方便调试）
      'no-console': 'off',
      // 其他可能需要的：
      // '@typescript-eslint/no-non-null-assertion': 'off',  // 允许非空断言
      // 'no-magic-numbers': 'off',                          // 允许魔法数字
    },
  },

  // ========================================
  // 7. 配置文件特殊规则
  // ========================================
  {
    // 注意：files 中有重复的 '*.config.*'，应该删除一个
    files: ['*.config.*'],
    rules: {
      // 配置文件中不强制函数返回类型
      '@typescript-eslint/explicit-function-return-type': 'off',
      // 配置文件中允许使用 console
      'no-console': 'off',
      // 其他可能需要的：
      // '@typescript-eslint/no-var-requires': 'off',  // 允许 require()
      // 'import/no-extraneous-dependencies': 'off',   // 允许导入 devDependencies
    },
  },

  // ========================================
  // 8. 关闭与 Prettier 冲突的规则
  // ========================================
  // 必须放在最后，会覆盖之前的格式相关规则
  // eslint-config-prettier 会自动关闭所有与 Prettier 冲突的 ESLint 规则
  // 例如：indent, quotes, semi, max-len 等
  prettierConfig,
];
