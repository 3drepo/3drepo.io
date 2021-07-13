module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:react/recommended'
	],
	ignorePatterns: ['/*.*'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json'
	},
	plugins: [
		'eslint-plugin-import',
		'eslint-plugin-react',
		'eslint-plugin-prefer-arrow',
		'@typescript-eslint',
		'@typescript-eslint/tslint'
	],
	rules: {
		'@typescript-eslint/array-type': [
			'error',
			{
				default: 'array-simple'
			}
		],
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/member-delimiter-style': [
			'warn',
			{
				multiline: {
					delimiter: 'semi',
					requireLast: true
				},
				singleline: {
					delimiter: 'semi',
					requireLast: false
				}
			}
		],
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-unused-expressions': 'error',
		'@typescript-eslint/no-var-requires': 'error',
		'@typescript-eslint/quotes': [
			'warn',
			'single',
			{
				allowTemplateLiterals: true
			}
		],
		'@typescript-eslint/require-await': 'warn',
		'@typescript-eslint/semi': ['warn', 'always'],
		'@typescript-eslint/type-annotation-spacing': 'error',
		'@typescript-eslint/no-unsafe-return': 'warn',
		'@typescript-eslint/no-unsafe-call': 'warn',
		'@typescript-eslint/no-unsafe-member-access': 'warn',
		'@typescript-eslint/no-unsafe-assignment': 'warn',
		'@typescript-eslint/restrict-template-expressions': 'warn',
		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/unbound-method': 'warn',
		'@typescript-eslint/no-misused-promises': 'warn',
		'@typescript-eslint/no-inferrable-types': 'warn',
		'@typescript-eslint/no-floating-promises': 'warn',
		'@typescript-eslint/no-shadow': 'error',
		'@typescript-eslint/restrict-plus-operands': 'off',
		'array-bracket-spacing': ['error', 'never'],
		'react/display-name': 'off',
		'react/prop-types': 'warn',
		'react/no-find-dom-node': 'off',
		'react/jsx-wrap-multilines': 'error',
		'brace-style': ['error', '1tbs'],
		'block-scoped-var': 'error',
		'comma-style': ['error', 'last'],
		curly: 'error',
		eqeqeq: 'error',
		'import/order': [
			'error',
			{
				'newlines-between': 'ignore'
			}
		],
		indent: ['warn', 'tab', { SwitchCase: 1 }],
		'max-classes-per-file': ['error', 1],
		'max-len': [
			'warn',
			{
				code: 125
			}
		],
		'no-bitwise': 'off',
		'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
		'no-debugger': 'error',
		'no-multiple-empty-lines': 'error',
		'no-template-curly-in-string': 'error',
		'no-throw-literal': 'error',
		'no-trailing-spaces': 'error',
		'no-undef-init': 'error',
		'no-unused-expressions': 'off',
		'no-var': 'error',
		'no-whitespace-before-property': 'error',
		'space-before-blocks': 'error',
		'object-shorthand': 'error',
		'prefer-const': 'error',
		'prefer-object-spread': 'error',
		'quote-props': ['error', 'as-needed', { unnecessary: false }],
		quotes: 'off',
		'react/jsx-boolean-value': ['error', 'never'],
		'react/jsx-curly-spacing': [
			'warn',
			{
				when: 'never'
			}
		],
		'react/jsx-equals-spacing': ['error', 'never'],
		'react/jsx-key': 'error',
		'react/no-string-refs': 'error',
		'react/jsx-tag-spacing': [
			'error',
			{
				afterOpening: 'allow',
				closingSlash: 'allow'
			}
		],
		'react/jsx-wrap-multilines': 'warn',
		'react/self-closing-comp': 'error',
		'require-await': 'off',
		semi: 'off',
		'space-in-parens': 'warn',
		'@typescript-eslint/tslint/config': [
			'error',
			{
				rules: {
					'import-spacing': true,
					whitespace: [
						true,
						'check-branch',
						'check-decl',
						'check-operator',
						'check-separator',
						'check-type',
						'check-typecast'
					]
				}
			}
		]
	},
	settings: {
		react: {
			version: 'detect'
		}
	}
};
