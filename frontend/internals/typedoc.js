module.exports = {
  name: '3D Repo Frontend',
  out: '../docs',
  entryPoints: ['../src/globals'],
  entryPointStrategy: 'expand',
  tsconfig: './tsconfig.docs.json',
  exclude: '**/node_modules/**/*.*',
  excludeExternals: true,
  excludeReferences: true,
  compilerOptions: {
    strictNullChecks: false,
    skipLibCheck: true
  }
};

