module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	plugins: ['import'],
	settings: {
		'import/parsers': {
		  '@typescript-eslint/parser': ['.ts', '.tsx']
		},
		'import/resolver': {
			'typescript': {
				'alwaysTryTypes': true,
			},
		},
	},
	extends: [
		'airbnb-typescript',
		'plugin:security/recommended',
		'plugin:react/jsx-runtime',
		'plugin:import/recommended',
		'plugin:import/typescript',
	],
	parserOptions: {
		ecmaVersion: 2020,
		project: './tsconfig.json'
	},
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
		'jsx-a11y/click-events-have-key-events': 'off',
		'jsx-a11y/no-static-element-interactions': 'off',
		'no-plusplus': 'off',
		'object-curly-newline': 'off',
		'max-len': [
			'error',
			{
				code: 160,
				ignoreComments: true,
				ignoreTemplateLiterals: true,
				ignoreStrings: true,
				ignorePattern: "<(\S*?)[^>]>.?</\1>|<.*?/>",
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
		'indent': 'off',
		'import/prefer-default-export': 'off',
		'import/no-named-as-default': 'off',
		'import/no-named-as-default-member': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1 }],
		'@typescript-eslint/no-unsafe-argument': 'off',
		'react/jsx-indent': ['error', 'tab'],
		'react/jsx-props-no-spreading': 'off',
		'react/prop-types': 'off',
		'react/require-default-props': 'off',
		'react/jsx-indent-props': ['error', 'tab'],
		'react/jsx-one-expression-per-line':  'off',
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/jsx-filename-extension': ['warn', { 'extensions': ['.ts', '.tsx'] }], 
		'no-case-declarations': 'off',
	}
};
