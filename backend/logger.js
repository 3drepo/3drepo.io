/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var winston  = require("winston");
var config   = require("./config.js");
var shortid  = require("shortid");
var C        = require("./constants");

// Custom logging levels for logger
var myCustomLevels = {
    levels: {
		error: 0,
		warn: 1,
		info: 2,
		debug: 3,
		trace: 4
    },
    colors: {
        trace: "magenta",
        debug: "white",
        info: "yellow",
        warn: "orange",
        error: "red"
    }
};

// Creates logger which outputs to both the console
// and a log file simultaneously
// Levels are set separately in the config.
var logger = new(winston.Logger)({
    levels: myCustomLevels.levels,
    colors: myCustomLevels.colors,
    transports: [

    new(winston.transports.Console)({
        colorize: true,
        level: config.logfile.console_level,
    }),

    new(winston.transports.File)
    ({
        level: config.logfile.file_level,
        filename: config.logfile.filename
    })]

});

var repoLogger = function(req, res, id) {
    "use strict";

    var self = this instanceof repoLogger ? this : Object.create(repoLogger.prototype);

    self.uid = id;

    if (req)
    {
        self.session        = req.session;
        self.req = req;
    }

    self.res =res;



    self.logger = logger;
    self.startTime = (new Date()).getTime();

    return self;
};

repoLogger.prototype.logMessage = function(type, msg, meta)
{
	"use strict";

    var currentTime  = (new Date()).getTime();
    var timeDiff     = currentTime - this.startTime;

    let metadata = Object.assign({}, meta, {
        uid: this.uid,
    });

    this.session && this.session.user && (metadata.username = this.session.user.username);
    this.req && this.req.method && (metadata.method = this.req.method);
    this.req && this.req.originalUrl && (metadata.url = this.req.originalUrl);

    this.logger.log(type, (new Date()).toString() + "\t" + this.uid + "\t" + msg + " [" + timeDiff + " ms]", metadata);
};

repoLogger.prototype.logInfo = function(msg, meta) {
	"use strict";

	this.logMessage("info", msg, meta);
};

repoLogger.prototype.logError = function(msg) {
	"use strict";

    this.logMessage("error", msg);
};

repoLogger.prototype.logDebug = function(msg) {
	"use strict";

	this.logMessage("debug", msg);
};

repoLogger.prototype.logWarning = function(msg) {
	"use strict";

    this.logMessage("warn", msg);
};

repoLogger.prototype.logTrace = function(msg) {
    "use strict";

    this.logMessage("trace", msg);
};

module.exports.startRequest = function(req, res, next)
{
	"use strict";

    req[C.REQ_REPO] = {};
	req[C.REQ_REPO].logger = new repoLogger(req, res, shortid.generate()); // Create logger for this request
    req[C.REQ_REPO].logger.logInfo("BEGIN " + req.method + " " + req.url);

    next();
};

module.exports.endRequest = function(req)
{
	"use strict";
    req[C.REQ_REPO].logger.logInfo("END " + req.method + " " + req.url);
};

module.exports.systemLogger = new repoLogger(null, null, "system");

