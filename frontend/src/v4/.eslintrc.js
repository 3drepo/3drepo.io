module.exports = {
	root: true,
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
		'license-header': 'error',
		'@typescript-eslint/array-type': [
			'error',
			{
				default: 'array-simple'
			}
		],
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/member-delimiter-style': [
			'off',
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
			'off',
			'single',
			{
				allowTemplateLiterals: true
			}
		],
		'@typescript-eslint/require-await': 'off',
		'@typescript-eslint/semi': ['off', 'always'],
		'@typescript-eslint/type-annotation-spacing': 'error',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-argument': 'off',
		'@typescript-eslint/restrict-template-expressions': 'off',
		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/unbound-method': 'off',
		'@typescript-eslint/no-misused-promises': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-floating-promises': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'@typescript-eslint/restrict-plus-operands': 'off',
		'array-bracket-spacing': ['error', 'never'],
		'react/display-name': 'off',
		'react/prop-types': 'off',
		'react/no-find-dom-node': 'off',
		'react/jsx-wrap-multilines': 'error',
		'brace-style': ['error', '1tbs'],
		'block-scoped-var': 'error',
		'comma-style': ['error', 'last'],
		eqeqeq: 'error',
		'import/order': [
			'error',
			{
				'newlines-between': 'ignore',
				"pathGroups": [{
					"pattern": "@/**",
					"group": "external"
				}],
			},
		],
		indent: ['off', 'tab', { SwitchCase: 1 }],
		'max-classes-per-file': ['error', 1],
		'max-len': [
			'off',
			{
				code: 120
			}
		],
		'no-bitwise': 'off',
		'no-console': ['error', { allow: ['off', 'error', 'debug'] }],
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
			'off',
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
		'react/jsx-wrap-multilines': 'off',
		'react/self-closing-comp': 'error',
		'require-await': 'off',
		semi: 'off',
		'space-in-parens': 'off',
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
		],
		'@typescript-eslint/explicit-module-boundary-types': "off",
		'@typescript-eslint/no-unused-vars': "off",
		'react/jsx-in-scope': "off",
		'react/jsx-uses-react': "off",
		'react/react-in-jsx-scope': "off",
		'@typescript-eslint/no-explicit-any': "off"
	},
	settings: {
		react: {
			version: 'detect'
		}
	}
};
