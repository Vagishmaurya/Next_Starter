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
      'style/multiline-ternary': 'off',

      // Disable problematic rules
      'no-console': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
      'react/no-nested-component-definitions': 'warn',
      'react/no-unstable-context-value': 'warn',
      'react-refresh/only-export-components': 'warn',
      'react/no-array-index-key': 'warn',
      'react-dom/no-missing-button-type': 'warn',
      'react-dom/no-dangerously-set-innerhtml': 'warn',
      'react-web-api/no-leaked-timeout': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'next/no-img-element': 'warn',
      'ts/no-use-before-define': 'off',
      'react-hooks/purity': 'off',

      // Relax style rules
      'style/comma-dangle': 'off',
      'style/quotes': 'off',
      'style/quote-props': 'off',
      'style/arrow-parens': 'off',
      'style/operator-linebreak': 'off',
      'style/indent-binary-ops': 'off',
      'style/indent': 'off',
      'style/jsx-one-expression-per-line': 'off',
      'style/jsx-closing-tag-location': 'off',
    },
  },
);
