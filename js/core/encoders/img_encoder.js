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
	var imgObject = function(res, params) {
		router.dbInterface.getObject(params.account, params.project, params.uid, null, null, function(err, type, uid, obj)
		{
			if(err) throw err;

			if (type == "texture")
			{
			  res.write(obj.textures[uid].data.buffer);
			  res.end();
			} else {
				throw new Error("Type of object not supported");
			}
		});
	};

	router.get('jpg', '/:account/:project/:uid', imgObject);
	router.get('png', '/:account/:project/:uid', imgObject);
	router.get('bmp', '/:account/:project/:uid', imgObject);
	router.get('gif', '/:account/:project/:uid', imgObject);

	// Get Avatar image
	router.get('jpg', '/:account', function(res, params) {
		router.dbInterface.getAvatar(params.account, function(err, avatar) {
			if (err)
				return res.sendStatus(500);

			if(!avatar)
				return res.sendStatus(404); // User does not have avatar

			var imageTokens = avatar.media_type.split(/\//);

			if (!(imageTokens[0] == 'image'))
			{
				logger.log('error', 'Avatar is not an image.');
				res.sendStatus(500);
			}

			if (!(imageTokens[1]) == 'jpeg')
			{
				logger.log('error', 'Avatar is not a JPEG');
				res.sendStatus(500);
			}

			res.write(avatar.data.buffer);
			res.end();
		});
	});
};


