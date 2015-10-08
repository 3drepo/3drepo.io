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

var _       = require('underscore');
var winston = require('winston');
var config = require('./config.js');

// Custom logging levels for logger
var myCustomLevels = {
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    },
    colors: {
        debug: 'white',
        info: 'yellow',
        warn: 'orange',
        error: 'red'
    }
};

// Creates logger which outputs to both the console
// and a log file simultaneously
// Levels are set separately in the config.
var logger = new(winston.Logger)({
    levels: myCustomLevels.levels,
    transports: [
    new(winston.transports.Console)({
        level: config.logfile.console_level,
    }), new(winston.transports.File)
    ({
        level: config.logfile.file_level,
        filename: config.logfile.filename
    })]
});

module.exports.logger = logger;
module.exports.onError = function(err) {
	logger.log('error', err.stack);
}

