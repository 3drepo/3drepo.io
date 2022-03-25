const { v4Path } = require('../../interop');
// eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require, require-sort/require-sort
const HttpsReq = require(`${v4Path}/libs/httpsReq`);

module.exports = HttpsReq;