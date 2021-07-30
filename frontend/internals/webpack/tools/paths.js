const { resolve } = require('path');

const PROJECT_DIR = resolve(__dirname, '../../../../');
const APP_DIR = resolve(PROJECT_DIR, 'frontend');
const DIST_DIR = resolve(PROJECT_DIR, 'public/dist');

const ASSETS_DIR =  resolve(APP_DIR, 'assets');
const SRC_DIR =  resolve(APP_DIR, 'src');

module.exports = { PROJECT_DIR, APP_DIR, DIST_DIR, ASSETS_DIR, SRC_DIR};