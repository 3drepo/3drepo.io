module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testEnvironment: 'jest-fixed-jsdom',
	setupFilesAfterEnv: ['<rootDir>/internals/testing/setupTests.ts'],
	moduleNameMapper: {
		'@assets/(.*)': '<rootDir>/assets/$1',
		'@controls/(.*)': '<rootDir>/src/v5/ui/controls/$1',
		'^@/(.*)$': '<rootDir>/src/$1',
    	'@components/(.*)': '<rootDir>/src/v5/ui/components/$1',
		'^axios$': require.resolve('axios'),
		'^react-children-utilities$': '<rootDir>/test/mocks/react-children-utilities.js',
	},
	transform: {
		'^.+\\.svg$': '<rootDir>/internals/testing/svgTransform.ts',
		// Inline options are required here instead of relying on .babelrc because Babel's file-relative
		// configs (.babelrc) are not applied to files inside node_modules. The `modules: 'commonjs'`
		// option forces ESM->CJS conversion so that ESM-only packages (react-intl, @formatjs, etc.)
		// can be executed by Jest's CommonJS runtime.
		'^.+\\.(js|jsx)$': ['babel-jest', {
			presets: [
				['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
				['@babel/preset-react', { runtime: 'automatic' }],
			],
			plugins: ['@babel/plugin-transform-typescript', 'babel-plugin-styled-components'],
		}],
	},
	// ESM-only packages that need to be transformed by babel-jest (above) rather than loaded raw.
	// Without this, Jest's CJS runtime fails to execute their native import statements.
	transformIgnorePatterns: [
		"node_modules/(?!(byte-size|react-intl|intl-messageformat|@formatjs)/.*)"
	],
};

