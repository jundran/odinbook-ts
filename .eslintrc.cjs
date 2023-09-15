module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
		// 'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/strict-type-checked', // Stricter linting than above
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
	plugins: ['react-refresh'],
  parser: '@typescript-eslint/parser',
	parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
	 settings: {
		react: { "version": "detect" }
	 },
  rules: {
		'indent': ['error','tab',{ 'SwitchCase': 1 }],
		'linebreak-style': ['error','unix'],
		'quotes': ['error','single'],
		'semi': ['error','never'],
		'keyword-spacing': ['error',{ 'before': true, 'after': true }],
		'func-call-spacing': ['error','never'],
		'space-before-function-paren': ['error','always'],
		'eol-last': ['error','always'],
		'comma-dangle': ['error','never'],
		'no-trailing-spaces': 'error',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

		// TypeScript - strict-type-checked
		'@typescript-eslint/no-non-null-assertion': 'off',

		// TypeScript - stylistic-type-checked
		'@typescript-eslint/consistent-type-definitions': ['interface' | 'type']
  }
}
