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

const { src, image, svg, pdfModel, dwgModel } = require('../../../helper/path');

const MimeTypes = require(`${src}/utils/helper/mimeTypes`);
const { determineTestGroup } = require('../../../helper/services');
const { readFileSync } = require('fs');

const ImgHelper = require(`${src}/utils/helper/images`);

const testCreateThumbnail = () => {
	describe('Create thumbnail', () => {
		test('Should work with a raster image', async () => {
			await ImgHelper.createThumbnail(readFileSync(image), MimeTypes.PNG, 10);
			await expect(ImgHelper.createThumbnail(readFileSync(image), 10)).resolves.not.toBeUndefined();
		});
		test('Should work with a svg image', async () => {
			await expect(ImgHelper.createThumbnail(readFileSync(svg), MimeTypes.SVG)).resolves.not.toBeUndefined();
		});
		test('Should work with a pdf document', async () => {
			await expect(ImgHelper.createThumbnail(readFileSync(pdfModel), MimeTypes.PDF)).resolves.not.toBeUndefined();
		});
		// The pdfjs library loads dynamically, so make sure the cached version
		// is used, and works, for subsequent conversions.
		test('Should work with a pdf document for the second time', async () => {
			await expect(ImgHelper.createThumbnail(readFileSync(pdfModel), MimeTypes.PDF)).resolves.not.toBeUndefined();
		});
		test('Should fail if it is not an image', async () => {
			await expect(ImgHelper.createThumbnail(readFileSync(dwgModel), MimeTypes.DWG)).rejects.not.toBeUndefined();
		});
		test('Should fail image is not passed in', async () => {
			await expect(ImgHelper.createThumbnail(undefined)).rejects.not.toBeUndefined();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreateThumbnail();
});
