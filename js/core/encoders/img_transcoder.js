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

module.exports.transcode = function (fromFormat, toFormat, buffer, callback) {
	if (!(/(gif|jpg|jpeg|tiff|png)$/i).test(fromFormat))
		return callback(new Error('Invalid from format'));

	if (!(/(gif|jpg|jpeg|tiff|png)$/i).test(toFormat))
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
