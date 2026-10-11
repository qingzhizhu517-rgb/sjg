import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

const rules = {
  'no-unreachable': 'error',
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-dupe-args': 'error',
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  complexity: ['error', 60],
}

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/target/**', 'promo-film/**', '**/.local/**'] },
  {
    files: ['{display-v2,admin-frontend,sjg-datav}/src/**/*.{js,jsx,ts,tsx}', 'shared/*.js', 'scripts/*.mjs'],
    languageOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' },
    rules,
  },
  {
    files: ['{display-v2,admin-frontend}/src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules,
  },
]
