/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { generateRandomString, generateUUID, generateRandomBuffer } = require('../../../helper/services');
const { src, image } = require('../../../helper/path');
const { UUIDToString } = require('../../../../../src/v5/utils/helper/uuids');
const config = require('../../../../../src/v5/utils/config');
const fs = require('fs');

const YupHelper = require(`${src}/utils/helper/yup`);

const testId = () => {
	describe.each([
		['1', false],
		['5c6ea70f-a55f-4cf2-9055-93db43503944', true],
		[0, false],
		[true, false],
	])('ID validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.id.isValid(data)).resolves.toBe(res);
		});
	});
};

const testColorArr = () => {
	describe.each([
		['1', false],
		[0, false],
		[true, false],
		[[], false],
		[['a', 'b', 'c'], false],
		[[1], false],
		[[1, 2, 3], true],
		[[256, 256, 256], false],
		[[0, 0, 0], true],
		[[-1, -1, -1], false],
		[[1, 2, 3, 4], true],
		[[1, 2, 3, 5, 5], false],
		[[0.1, 2, 3, 4], false],
	])('Colour array validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.colorArr.isValid(data)).resolves.toBe(res);
		});
	});
};

const testRGBColor = () => {
	describe.each([
		['1', false],
		[0, false],
		[true, false],
		[[], false],
		['#000000', true],
		['#FFFFFF', true],
		['#FF5733', true],
		['#123456', true],
		['#ABCDEF', true],
		['#ABCDEFAA', false],
		['#ZZZZZZ', false],
		['#12345G', false],
		['#1234567', false],
	])('RGB Colour validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.rgbColor.isValid(data)).resolves.toBe(res);
		});
	});
};

const testUsername = () => {
	describe.each([
		['1', false],
		['1a', true],
		['5c6ea70f-a55f-4cf2-9055-93db43503944', true],
		['5c6ea70f_a55f_4cf2_9055_93db43503944', true],
		['5c6ea70f!a55f!4cf2!9055!93db43503944', false],
		[generateRandomString(66), false],
		[0, false],
		[true, false],
	])('Username validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.strings.username.isValid(data)).resolves.toBe(res);
		});
	});
};

const testTitle = () => {
	describe.each([
		['', false],
		[generateRandomString(120), true],
		[generateRandomString(121), false],
	])('Title validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.strings.title.isValid(data)).resolves.toBe(res);
		});
	});
};

const testShortDesc = () => {
	describe.each([
		['', false],
		[generateRandomString(660), true],
		[generateRandomString(661), false],
	])('Short description validator', (data, res) => {
		test(`${data.length} characters should return ${res}`, async () => {
			await expect(YupHelper.types.strings.shortDescription.isValid(data)).resolves.toBe(res);
		});
	});
};

const testLongDesc = () => {
	describe.each([
		['', false],
		[generateRandomString(1200), true],
		[generateRandomString(1201), false],
	])('Long description validator', (data, res) => {
		test(`${data.length} characters should return ${res}`, async () => {
			await expect(YupHelper.types.strings.longDescription.isValid(data)).resolves.toBe(res);
		});
	});
};

const testTimestamp = () => {
	describe.each([
		['', false],
		['a', false],
		[-1, false],
		[null, false],
		[new Date(2000, 1, 1).getTime() - 1, false],
		[new Date(2000, 1, 1).getTime(), true],
		[324093824093285092385094354340395834, false],
	])('Timestamp validator', (data, res) => {
		test(`${data} characters should return ${res}`, async () => {
			await expect(YupHelper.types.timestamp.isValid(data)).resolves.toBe(res);
		});
	});
};

const testDateInThePast = () => {
	describe.each([
		['a', false],
		[new Date(2000, 1, 1), true],
		[new Date().getTime() + 10000, false],
		[null, false],
		[324093824093285092385094354340395834, false],
	])('Date in the past validator', (data, res) => {
		test(`${data} characters should return ${res}`, async () => {
			await expect(YupHelper.types.dateInThePast.isValid(data)).resolves.toBe(res);
		});
	});
};

const testEmbeddedImage = () => {
	describe.each([
		[null, true, true],
		[null, false, false],
	])('Image validator', (data, isNullable, res) => {
		test(`${data} characters should return ${res}`, async () => {
			await expect(YupHelper.types.embeddedImage(isNullable).isValid(data)).resolves.toBe(res);
		});
	});
};

const testEmbeddedImageOrRef = () => {
	const existingRef = generateUUID();
	const imageBuffer = fs.readFileSync(image, { encoding: 'base64' });
	const tooLargeImageBuffer = generateRandomBuffer(config.fileUploads.resourceSizeLimit + 1).toString('base64');

	describe.each([
		['null', null, false],
		['valid ref', UUIDToString(existingRef), true],
		['image buffer', imageBuffer, true],
		['too large image buffer', tooLargeImageBuffer, false],
	])('Image validator', (description, data, res) => {
		test(`${description} should return ${res}`, async () => {
			await expect(YupHelper.types.embeddedImageOrRef().isValid(data)).resolves.toBe(res);
		});
	});
};

describe('utils/helper/yup', () => {
	testId();
	testColorArr();
	testUsername();
	testTitle();
	testShortDesc();
	testLongDesc();
	testTimestamp();
	testEmbeddedImage();
	testEmbeddedImageOrRef();
	testDateInThePast();
	testRGBColor();
});
