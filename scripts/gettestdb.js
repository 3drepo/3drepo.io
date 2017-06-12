#!/usr/bin/env node
var config = require("../config/test/config.js");
var host = config.db.host + ":" + config.db.port;
console.log(host);