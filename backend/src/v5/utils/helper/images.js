/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { pdf } = require('pdf-to-img');
const sharp = require('sharp');

const ImageHelper = {};

ImageHelper.createThumbnail = async (buffer, mimeType, width = 600, density = 150) => {
	if (!buffer) throw new Error('Image not provided');

	let imgBuffer;
	if (mimeType === 'application/pdf') {
		const base64 = buffer.toString('base64');
		const dataUrl = `data:${mimeType};base64,${base64}`;
		const document = await pdf(dataUrl, { scale: 1 });
		imgBuffer = await document.getPage(1);
	} else {
		imgBuffer = await sharp(buffer, { density })
			.flatten({ background: '#ffffff' })
			.toFormat('jpeg')
			.toBuffer();
	}

	// (As far as I can tell) we have to export the buffer and re-import it for resize,
	// otherwise it optimises out the density setting and we will miss out detailed lines.
	return sharp(imgBuffer)
		.resize(width, undefined, {
			fit: 'outside',
		}).toBuffer();
};
module.exports = ImageHelper;
