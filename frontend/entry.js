// Keep this in sync with dependencies of frontend/package.json
require("angular");
require("angular-ui-router");
require("angular-material");
// require("angular-animate");
require("angular-sanitize");
require("angular-aria");
require("angular-recaptcha");
// require("material-design-icons");
window.io = require("socket.io-client"); // Otherwise io is undefined

// TYPESCRIPT COMPILED GLOBALS
UnityUtil = require("./_built/amd/globals/unity-util.js").UnityUtil;
Pin = require("./_built/amd/globals/pin.js").Pin;
Viewer = require("./_built/amd/globals/viewer.js").Viewer;
