/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var child_process = require("child_process");
var responseCodes = require("../response_codes.js");


var createHeightMap = function(format, buffer, callback) {
	"use strict";


	if (!module.exports.isImage(format)) {
		return callback(new Error("Invalid image format"));
	}

	var im = child_process.spawn("convert", ["-colorspace", "gray", "+contrast", format + ":-", format + ":-"]);
	im.stdin.write(buffer);
	im.stdin.end();

	var bufOut = [];

	im.stdout.on("data", function(data) {
		bufOut.push(data);
	});

	im.stderr.on("data", function(data) {
		// If there is any output on stderr, we assume something has gone wrong
		return callback(responseCodes.PROCESS_ERROR(data.toString()));
	});

	im.stdout.on("close", function(code) {
		// If the conversion process has a non-zero return value.
			callback(responseCodes.OK, Buffer.concat(bufOut));
	});
};

module.exports.createHeightMap = createHeightMap;

