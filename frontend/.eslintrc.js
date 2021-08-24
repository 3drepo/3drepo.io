module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		'airbnb-typescript',
		'plugin:security/recommended',
	],
	parserOptions: {
		ecmaVersion: 2020,
		project: './tsconfig.json'
	},
	ignorePatterns: ['/*.*'],
	parser: '@typescript-eslint/parser',
	rules: {
		'license-header': 'error',
		'arrow-parens': ['error', 'always'],
		'no-tabs': [
			'error',
			{
				allowIndentationTabs: true,
			},
		],
		'no-plusplus': 0,
		'object-curly-newline': 0,
		'max-len': [
			'error',
			{
				code: 120,
				ignoreComments: true,
				ignoreTemplateLiterals: true,
				ignoreStrings: true,
			},
		],
		'no-throw-literal': 0,
		'no-restricted-syntax': 0,
		'no-underscore-dangle': [
			'error',
			{
				allow: ['_id'],
			},
		],
		'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
		'security/detect-non-literal-fs-filename': 0,
		'security/detect-object-injection': 0,
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'indent': 'off',
		'import/prefer-default-export': 'off',
		'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1 }],
		'react/jsx-indent': ['error', 'tab'],
		'react/jsx-props-no-spreading': 'off',
		'react/prop-types': 'off',
		'react/require-default-props': 'off',
	}
};
