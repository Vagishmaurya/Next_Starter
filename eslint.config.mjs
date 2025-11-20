import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import antfu from '@antfu/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import storybook from 'eslint-plugin-storybook';

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: true,

    lessOpinionated: true,
    isInEditor: false,

    stylistic: {
      semi: true,
    },

    formatters: {
      css: true,
    },

    ignores: [
      'migrations/**/*',
    ],
  },

  // Accessibility Rules
  jsxA11y.flatConfigs.recommended,

  // E2E Testing Rules
  {
    files: [
      '**/*.spec.ts',
      '**/*.e2e.ts',
    ],
    ...playwright.configs['flat/recommended'],
  },

  // Storybook Rules
  ...storybook.configs['flat/recommended'],

  // Custom Rule Overrides
  {
    rules: {
      'antfu/no-top-level-await': 'off',
      'style/brace-style': ['error', '1tbs'],
      'ts/consistent-type-definitions': ['error', 'type'],
      'react/prefer-destructuring-assignment': 'off',
      'node/prefer-global/process': 'off',
      'test/padding-around-all': 'error',
      'test/prefer-lowercase-title': 'off',
    },
  },
);
