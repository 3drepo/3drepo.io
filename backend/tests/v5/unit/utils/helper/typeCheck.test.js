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

const { src, image } = require('../../../helper/path');
const fs = require('fs');

const TypeChecker = require(`${src}/utils/helper/typeCheck`);
const { generateUUID } = require(`${src}/utils/helper/uuids`);

const testIsBuffer = () => {
	describe.each(
		[
			[Buffer.from('abc'), true],
			['', false],
			[3, false],
			[undefined, false],
		],
	)('Is Buffer', (item, isTrue) => {
		test(`${item} should return ${isTrue}`, () => {
			expect(TypeChecker.isBuffer(item)).toBe(isTrue);
		});
	});
};

const testIsString = () => {
	describe.each(
		[
			[Buffer.from('abc'), false],
			['', true],
			['some random string', true],
			[3, false],
			[undefined, false],
		],
	)('Is String', (item, isTrue) => {
		test(`${item} should return ${isTrue}`, () => {
			expect(TypeChecker.isString(item)).toBe(isTrue);
		});
	});
};

const testIsObject = () => {
	describe.each(
		[
			[Buffer.from('abc'), true],
			['', false],
			['some random string', false],
			[3, false],
			[undefined, false],
			[{}, true],
			[{ a: 1, b: 'xyz' }, true],
			[[], false],
			[[1, 2, 3], false],
		],
	)('Is Object', (item, isTrue) => {
		test(`${item} should return ${isTrue}`, () => {
			expect(TypeChecker.isObject(item)).toBe(isTrue);
		});
	});
};

const testIsBooleanString = () => {
	describe.each(
		[
			['abc', false],
			['true', true],
			['True', true],
			['TRUE', true],
			['false', true],
			['False', true],
			['FALSE', true],
			[undefined, false],
		],
	)('Is Boolean String', (item, isTrue) => {
		test(`${item} should return ${isTrue}`, () => {
			expect(TypeChecker.isBooleanString(item)).toBe(isTrue);
		});
	});
};

const testIsNumberString = () => {
	describe.each(
		[
			['abc', false],
			['true', false],
			['12345', true],
			[undefined, false],
		],
	)('Is Number String', (item, isTrue) => {
		test(`${item} should return ${isTrue}`, () => {
			expect(TypeChecker.isNumberString(item)).toBe(isTrue);
		});
	});
};

const testIsUUIDString = () => {
	describe.each(
		[
			[Buffer.from('abc'), false],
			['7591fbdb-52b9-490a-8a77-fdb57c57dbc8', true],
			['', false],
			['some random string', false],
			[3, false],
			[undefined, false],
		],
	)('Is UUID String', (item, isTrue) => {
		test(`${item} should return ${isTrue}`, () => {
			expect(TypeChecker.isUUIDString(item)).toBe(isTrue);
		});
	});
};

const testIsUUID = () => {
	describe.each(
		[
			[Buffer.from('abc'), false],
			['7591fbdb-52b9-490a-8a77-fdb57c57dbc8', false],
			[generateUUID(), true],
			['', false],
			['some random string', false],
			[3, false],
			[undefined, false],
		],
	)('Is UUID', (item, isTrue) => {
		test(`${item} should return ${isTrue}`, () => {
			expect(TypeChecker.isUUID(item)).toBe(isTrue);
		});
	});
};

const testFileMimeFromBuffer = () => {
	const buffer = fs.readFileSync(image);

	describe.each(
		[
			['Valid buffer', buffer, 'image/png'],
			['Empty string', '', undefined],
			['Number', 3, undefined],
			['Null value', null, undefined],
		],
	)('Get file mime', (description, data, mime) => {
		test(`${description} should return ${mime}`, async () => {
			await expect(TypeChecker.fileMimeFromBuffer(data)).resolves.toBe(mime);
		});
	});
};

const testFileExtensionFromBuffer = () => {
	const buffer = fs.readFileSync(image);

	describe.each(
		[
			['Valid buffer', buffer, 'png'],
			['Empty string', '', undefined],
			['Number', 3, undefined],
			['Null value', null, undefined],
			['Undefined value', undefined, undefined],
		],
	)('Get file extension', (description, data, extension) => {
		test(`${description} should return ${extension}`, async () => {
			await expect(TypeChecker.fileExtensionFromBuffer(data)).resolves.toBe(extension);
		});
	});
};

const testFileExtensionFromPath = () => {
	describe.each(
		[
			['Valid path', image, 'png'],
			['Empty string', '', undefined],
			['Number', 3, undefined],
			['Null value', null, undefined],
			['Undefined value', undefined, undefined],
		],
	)('Get file extension', (description, data, extension) => {
		test(`${description} should return ${extension}`, async () => {
			await expect(TypeChecker.fileExtensionFromPath(data)).resolves.toBe(extension);
		});
	});
};

describe('utils/helpers/typeCheck', () => {
	testIsBuffer();
	testIsString();
	testIsObject();
	testIsUUIDString();
	testIsBooleanString();
	testIsNumberString();
	testFileMimeFromBuffer();
	testFileExtensionFromBuffer();
	testFileExtensionFromPath();
	testIsUUID();
});
