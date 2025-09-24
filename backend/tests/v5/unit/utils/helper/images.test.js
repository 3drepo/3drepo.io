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
const { determineTestGroup } = require('../../../helper/services');
const { readFileSync } = require('fs');

const ImgHelper = require(`${src}/utils/helper/images`);

const testCreateThumbnail = () => {
	describe('Create thumbnail', () => {
		test('Should work with a raster image', async () => {
			await ImgHelper.createThumbnail(readFileSync(image), 10);
			await expect(ImgHelper.createThumbnail(readFileSync(image), 10)).resolves.not.toBeUndefined();
		});
		test('Should work with a svg image', async () => {
			await expect(ImgHelper.createThumbnail(readFileSync(svg))).resolves.not.toBeUndefined();
		});
		test('Should work with a pdf document', async () => {
			await expect(ImgHelper.createThumbnail(readFileSync(pdfModel))).resolves.not.toBeUndefined();
		});
		test('Should fail if it is not an image', async () => {
			await expect(ImgHelper.createThumbnail(readFileSync(dwgModel))).rejects.not.toBeUndefined();
		});
		test('Should fail image is not passed in', async () => {
			await expect(ImgHelper.createThumbnail(undefined)).rejects.not.toBeUndefined();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreateThumbnail();
});
