const { resolve } = require('path');

const PROJECT_DIR = resolve(__dirname, '../../../../');
const APP_DIR = resolve(PROJECT_DIR, 'frontend');
const DIST_DIR = resolve(PROJECT_DIR, 'public/dist');

module.exports = { PROJECT_DIR, APP_DIR, DIST_DIR };
