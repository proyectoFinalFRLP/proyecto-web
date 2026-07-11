import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactPlugin from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.claude']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    plugins: {
      react: reactPlugin,
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Console
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Variables
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-warning-comments': ['warn', { terms: ['TODO', 'FIXME', 'HACK'], location: 'start' }],

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'function',
          filter: { regex: '^use[A-Z]', match: true },
          format: ['camelCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // React
      'react/no-array-index-key': 'error',
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/hook-use-state': 'error',
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }],
      'react/no-unstable-nested-components': ['error', { allowAsProps: false }],

      // Código general
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',

      // Imports
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  // ── Boundaries de dependencia entre capas (ver docs/guidelines/architecture.md §3.2)
  // Se enforcean por el path del import (no por resolución de módulos), así no
  // dependen del resolver de aliases ni reordenan el resto de los imports.

  // features → NO puede importar de app ni de otra feature
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['app', 'app/*', 'app/**'],
              message:
                'features → app está prohibido: la configuración global vive en app/ (architecture.md §3.2).',
            },
            {
              group: ['features', 'features/*', 'features/**'],
              message:
                'Import cross-feature prohibido: lo compartido va a shared/. Dentro de la misma feature usá rutas relativas (architecture.md §3.2).',
            },
          ],
        },
      ],
    },
  },

  // shared → NO puede importar de features ni de app (es la capa más baja)
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['features', 'features/*', 'features/**', 'app', 'app/*', 'app/**'],
              message:
                'shared no puede depender de features ni de app: es la capa más baja (architecture.md §3.2).',
            },
          ],
        },
      ],
    },
  },

  // app → solo puede importar features en app/router/ (registro de rutas)
  {
    files: ['src/app/**/*.{ts,tsx}'],
    ignores: ['src/app/router/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['features', 'features/*', 'features/**'],
              message:
                'app → features solo se permite en app/router/ (registro de rutas). Ver architecture.md §3.2.',
            },
          ],
        },
      ],
    },
  },
])
