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
var supportedFormats = ["gif", "jpg", "jpeg", "tiff", "png", "pdf"];
var responseCodes = require("../response_codes.js");

var dbInterface = require("../db_interface.js");

var C           = require("../constants.js");

module.exports.isImage = function(format)
{
	"use strict";

	if (!format) {
		return false;
	}

	format = format.toLowerCase();

	for (var i in supportedFormats)
	{
		if (supportedFormats[i] === format) {
			return true;
		}
	}

	return false;
};

// Ability to transcode with ImageMagick
// -- Won't use for now.
module.exports.transcode = function (fromFormat, toFormat, buffer, callback) {
	"use strict";

	if (!this.isImage(fromFormat)) {
		return callback(new Error("Invalid from image format"));
	}

	if (!this.isImage(toFormat)) {
		return callback(new Error("Invalid to image format"));
	}

	var im = child_process.spawn("convert", [fromFormat + ":-", toFormat + ":-"]);
	im.stdin.write(buffer);
	im.stdin.end();

	var bufOut = [];

	im.stdout.on("data", function(data) {
		bufOut.push(data);
	});

	im.stdout.on("end", function() {
		callback(null, Buffer.concat(bufOut));
	});
};

var createHeightMap = function(format, buffer, callback) {
	"use strict";

	if (!module.exports.isImage(format)) {
		return callback(new Error("Invalid image format"));
	}

	var im = child_process.spawn("convert", ["-colorspace", "gray", "+conrast", format + ":-", format + ":-"]);
	im.stdin.write(buffer);
	im.stdin.end();

	var bufOut = [];

	im.stdout.on("data", function(data) {
		bufOut.push(data);
	});

	im.stderr.on("data", function(data) {
		// If there is any output on stderr, we assume something has gone wrong
		return callback(responseCodes.PROCESS_ERROR(data.data));
	});

	im.stdout.on("close", function(code) {
		// If the conversion process has a non-zero return value.
			callback(responseCodes.OK, Buffer.concat(bufOut));
	});
};

module.exports.route = function(router)
{
	"use strict";

	var imgObject = function(req, res, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, params.uid, null, null, true, {}, function(err, type, uid, fromStash, obj)
		{
			if(err.value) {
				return err_callback(err);
			}

			if (type === "texture")
			{
				if (params.subformat === "heightmap")
				{
					createHeightMap(params.format, obj.textures[params.uid].data.buffer, function(err, grayImage) {
						if (err.value) {
							return err_callback(err);
						}

						res.write(grayImage);
						res.end();
					});
				} else {
					res.write(obj.textures[params.uid].data.buffer);
					res.end();
				}
			} else {
				err_callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
			}
		});
	};

	router.get("jpg", "/:account/:project/:uid", imgObject);
	router.get("png", "/:account/:project/:uid", imgObject);
	router.get("bmp", "/:account/:project/:uid", imgObject);
	router.get("gif", "/:account/:project/:uid", imgObject);

	router.get("pdf", "/:account/:project/:uid", function(req, res, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, params.uid, null, null, true, {}, function(err, type, uid, fromStash, obj)
		{
			if (err.value) {
				return err_callback(err);
			}

			if (obj.metas[uid])
			{
				res.write(obj.metas[uid].data.buffer);
				res.end();
			}
		});
	});

	// Get Avatar image
	router.get("jpg", "/:account", function(req, res, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getAvatar(params.account, function(err, avatar) {
			if (err.value) {
				return err_callback(err);
			}

			if(!avatar) {
				return err_callback(responseCodes.USER_DOES_NOT_HAVE_AVATAR);
			}

			var type = null;

			if (avatar.media_type) {
				type = avatar.media_type;
			} else if (avatar.mime) {
				type = avatar.mime;
			}

			if(!type) {
				return err_callback(responseCodes.AVATAR_INVALID_IMAGE_TYPE);
			}

			var imageTokens = type.split(/\//);

			if (imageTokens[0] !== "image") {
				return err_callback(responseCodes.AVATAR_IS_NOT_AN_IMAGE);
			}

			if (imageTokens[1] !== "jpeg") {
				return err_callback(responseCodes.AVATAR_IS_NOT_A_JPEG);
			}

			res.write(avatar.data.buffer);
			res.end();
		});
	});
};


