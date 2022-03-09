module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		'airbnb-typescript',
		'plugin:security/recommended',
		'plugin:react/jsx-runtime',
	],
	parserOptions: {
		ecmaVersion: 2020,
		project: './tsconfig.json'
	},
	ignorePatterns: ['/*.*', "**/src/locales/**"],
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
		'no-plusplus': 'off',
		'object-curly-newline': 'off',
		'max-len': [
			'error',
			{
				code: 120,
				ignoreComments: true,
				ignoreTemplateLiterals: true,
				ignoreStrings: true,
			},
		],
		'no-throw-literal': 'off',
		'no-restricted-syntax': 'off',
		'no-underscore-dangle': [
			'error',
			{
				allow: ['_id'],
			},
		],
		'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
		'security/detect-non-literal-fs-filename': 'off',
		'security/detect-object-injection': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'indent': 'off',
		'import/prefer-default-export': 'off',
		'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1 }],
		'react/jsx-indent': ['error', 'tab'],
		'react/jsx-props-no-spreading': 'off',
		'react/prop-types': 'off',
		'react/require-default-props': 'off',
		'react/jsx-indent-props': ['error', 'tab'],
		'react/jsx-one-expression-per-line':  'off',
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/jsx-filename-extension': ['warn', { 'extensions': ['.ts', '.tsx'] }], 
	}
};
