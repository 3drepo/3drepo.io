const { v4Path } = require('../../interop');
// eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require, require-sort/require-sort
const elastic = require(`${v4Path}/handler/elastic`);

module.exports = elastic;
