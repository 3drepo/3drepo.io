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

var child_process = require('child_process');
var supportedFormats = ['gif', 'jpg', 'jpeg', 'tiff', 'png'];
var responseCodes = require('../response_codes.js');

module.exports.isImage = function(format)
{
	var format = format.toLowerCase();

	for (var i in supportedFormats)
	{
		if (supportedFormats[i] == format)
			return true;
	}

	return false;
}

// Ability to transcode with ImageMagick
// -- Won't use for now.
module.exports.transcode = function (fromFormat, toFormat, buffer, callback) {
	if (!this.isImage(fromFormat))
		return callback(new Error('Invalid from image format'));

	if (!this.isImage(toFormat))
		return callback(new Error('Invalid to image format'));

	var im = child_process.spawn('convert', [fromFormat + ':-', toFormat + ':-']);
	im.stdin.write(buffer);
	im.stdin.end();

	var bufOut = [];

	im.stdout.on('data', function(data) {
		bufOut.push(data);
	});

	im.stdout.on('end', function() {
		callback(null, Buffer.concat(bufOut));
	});
};

module.exports.route = function(router)
{
	var imgObject = function(res, params, err_callback) {
		router.dbInterface.getObject(params.account, params.project, params.uid, null, null, function(err, type, uid, obj)
		{
			if(err.value)
				return err_callback(err);

			if (type == "texture")
			{
			  res.write(obj.textures[uid].data.buffer);
			  res.end();
			} else {
				err_callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
			}
		});
	};

	router.get('jpg', '/:account/:project/:uid', imgObject);
	router.get('png', '/:account/:project/:uid', imgObject);
	router.get('bmp', '/:account/:project/:uid', imgObject);
	router.get('gif', '/:account/:project/:uid', imgObject);

	// Get Avatar image
	router.get('jpg', '/:account', function(res, params, err_callback) {
		router.dbInterface.getAvatar(params.account, function(err, avatar) {
			if (err.value)
				return err_callback(err);

			if(!avatar)
				return err_callback(responseCodes.USER_DOES_NOT_HAVE_AVATAR);

			var imageTokens = avatar.media_type.split(/\//);

			if (!(imageTokens[0] == 'image'))
				return err_callback(responseCodes.AVATAR_IS_NOT_AN_IMAGE);

			if (!(imageTokens[1]) == 'jpeg')
				return err_callback(responseCodes.AVATAR_IS_NOT_A_JPEG);

			res.write(avatar.data.buffer);
			res.end();
		});
	});
};


