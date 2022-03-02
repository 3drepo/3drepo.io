module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 2020,
		project: './tsconfig.json'
	},
	rules: {
		'import/no-extraneous-dependencies': 'off'
	}
};