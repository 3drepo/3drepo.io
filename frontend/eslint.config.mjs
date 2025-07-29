import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import pluginSecurity from 'eslint-plugin-security';
import pluginReact from 'eslint-plugin-react';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import stylistic from '@stylistic/eslint-plugin';
import * as path from 'node:path';
import licensePlugin from './internals/eslint-rules/license-header.mjs';
// import recommendedTypeChecked from '@typescript-eslint/eslint-plugin/configs/recommendedTypeChecked.js';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const browserGlobals = {
  ...globals.browser,
  AudioWorkletGlobalScope: false // this is the default,
};

delete browserGlobals['AudioWorkletGlobalScope '];

export default tseslint.config(
	js.configs.recommended,
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	// recommendedTypeChecked,
	{
		ignores: [
			'**/src/locales/**',
			'src/v4/',
			'src/globals',
			'internals/',
			'test/',
			'ts-rules/',
			'node_modules/',
			'docs/',
			'plopfile.js',
			'eslint-rules/',
			'globals/',
			'unity/',
			'src/v5/ui/components/viewer/drawingViewer/snapping/**.ts',
			'**/**.js'
		],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser,
			parserOptions: {
				project: path.resolve('./tsconfig.json'),
				ecmaVersion: 2020,
				sourceType: 'module',
			},
			sourceType: 'script',
			globals: {
				...browserGlobals,
				React: 'readonly',
				ClientConfig: 'readonly'
			},
		},
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx'],
			},
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
				},
			},
			react: {
				version: 'detect',
			},
		},
		plugins: {
			import: pluginImport,
			security: pluginSecurity,
			react: pluginReact,
			'jsx-a11y': pluginJsxA11y,
			license: licensePlugin,
			'@stylistic': stylistic,
		},
		rules: {
			'license/license-header': 'error',

			// stylistic rules
			'@stylistic/arrow-parens': ['error', 'always'],
			'@stylistic/no-tabs': ['error', { allowIndentationTabs: true }],
			'@stylistic/max-len': ['error', {
				code: 160,
				ignoreComments: true,
				ignoreTemplateLiterals: true,
				ignoreStrings: true,
				ignorePattern: '<(\\S*?)[^>]>.*?</\\1>|<.*?/>',
			}],
			'@stylistic/indent': ['error', 'tab', { SwitchCase: 1 }],
			'@stylistic/jsx-indent-props': ['error', 'tab'],

			// other rules
			'jsx-a11y/click-events-have-key-events': 'off',
			'jsx-a11y/no-static-element-interactions': 'off',
			'no-plusplus': 'off',
			'object-curly-newline': 'off',
			'no-throw-literal': 'off',
			'no-restricted-syntax': 'off',
			'no-underscore-dangle': ['error', { allow: ['_id'] }],
			'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
			'security/detect-non-literal-fs-filename': 'off',
			'security/detect-object-injection': 'off',
			'import/prefer-default-export': 'off',
			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/consistent-type-definitions': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/array-type': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-vars': ['error', {
				'ignoreRestSiblings': true,
				'caughtErrors': 'none'
			}],
			"@typescript-eslint/no-dynamic-delete": "off",
			'no-unused-vars': 'off',
			'react/jsx-props-no-spreading': 'off',
			'react/prop-types': 'off',
			'react/require-default-props': 'off',
			'react/jsx-one-expression-per-line': 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/jsx-filename-extension': ['warn', { extensions: ['.ts', '.tsx'] }],
			'no-case-declarations': 'off',
		},
	},
);
