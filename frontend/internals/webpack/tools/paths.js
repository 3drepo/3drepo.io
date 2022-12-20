const { resolve } = require('path');

const PROJECT_DIR = resolve(__dirname, '../../../../');
const APP_DIR = resolve(PROJECT_DIR, 'frontend');
const PUBLIC_DIR = resolve(PROJECT_DIR, 'public');
const DIST_DIR = resolve(PUBLIC_DIR, 'dist');

const ASSETS_DIR =  resolve(APP_DIR, 'assets');
const SRC_DIR =  resolve(APP_DIR, 'src');
const UI =  resolve(SRC_DIR, 'v5', 'ui');

const COMPONENTS = resolve(UI, 'components');
const CONTROLS = resolve(UI, 'controls');

module.exports = { PROJECT_DIR, APP_DIR, DIST_DIR , PUBLIC_DIR ,ASSETS_DIR, SRC_DIR, COMPONENTS, CONTROLS };