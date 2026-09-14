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

const { determineTestGroup } = require('../../../helper/utils');
const {
	generateRandomString,
	generateUUID,
	generateRandomBuffer,
} = require('../../../helper/dataGen');
const { src, image } = require('../../../helper/path');
const { UUIDToString } = require('../../../../../src/v5/utils/helper/uuids');
const Yup = require('yup');
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

const testColorStr = () => {
	describe.each([
		[generateRandomString(), false],
		['AABBCC', false],
		['#GGHHII', false],
		['#AABBCCDD', false],
		['#ABC', false],
		['#AABBCC', true],
		['#aabbcc', true],
	])('Colour string validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.colorStr.isValid(data)).resolves.toBe(res);
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
			const schema = YupHelper.types.embeddedImage(isNullable);

			await expect(schema.isValid(data)).resolves.toBe(res);
			if (!res) {
				await expect(schema.validate(data)).rejects.toThrow('Image cannot be null');
			}
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

const testTransformUniqueArray = () => {
	describe.each([
		['Should remove duplicates from array', [1, 2, 3, 2, 4, 1], [1, 2, 3, 4]],
		['Should not modify array if there are no duplicates', [1, 2, 3, 4], [1, 2, 3, 4]],
		['Should return empty array if input is empty', [], []],
		['Should return original value if undefined', undefined, undefined],
		['Should return original value if null', null, null],
	])('Unique array transformer', (desc, input, expected) => {
		test(desc, () => {
			const schema = YupHelper.transformer.uniqueArray(Yup.array().of(Yup.number()).nullable());
			expect(schema.cast(input)).toEqual(expected);
		});
	});
};

const testOneOfSchemas = () => {
	describe('oneOfSchemas validator', () => {
		const stringSchema = Yup.string().trim();
		const numberSchema = Yup.number().integer();

		test('Should cast and return value from the first matching schema', async () => {
			const schema = YupHelper.utils.oneOfSchemas([stringSchema, numberSchema]);
			await expect(schema.validate('  hello  ')).resolves.toBe('hello');
		});

		test('Should cast and return value from a later matching schema', async () => {
			const schema = YupHelper.utils.oneOfSchemas([numberSchema, stringSchema]);
			await expect(schema.validate('  hello  ')).resolves.toBe('hello');
		});

		test('Should cast string to number when number schema matches', async () => {
			const schema = YupHelper.utils.oneOfSchemas([numberSchema, stringSchema]);
			await expect(schema.validate('123')).resolves.toBe(123);
		});

		test('Should throw combined error when no schema matches', async () => {
			const schema = YupHelper.utils.oneOfSchemas([numberSchema, Yup.string().min(5)]);
			await expect(schema.validate('hi')).rejects.toThrow('Value did not match any schema');
		});

		test('Should apply defaults from matching object schema', async () => {
			const schema = YupHelper.utils.oneOfSchemas([
				Yup.object({ type: Yup.string().default('perspective'), showHidden: Yup.boolean().default(false) }),
				Yup.object({ name: Yup.string().required() }),
			]);
			await expect(schema.validate({})).resolves.toEqual({ type: 'perspective', showHidden: false });
		});

		test('Should allow null when schema is nullable', async () => {
			const schema = YupHelper.utils.oneOfSchemas([stringSchema, numberSchema]).nullable();
			await expect(schema.validate(null)).resolves.toBeNull();
		});

		test('Should preserve custom error message', async () => {
			const schema = YupHelper.utils.oneOfSchemas([numberSchema], 'Custom message');
			await expect(schema.validate('not a number')).rejects.toThrow('Custom message');
		});

		test('Should handle a synchronously thrown validation error without an errors property', async () => {
			const syncThrowingSchema = {
				validateSync: () => { throw new Error('sync validation failed'); },
				validate: () => { throw new Error('async validation failed'); },
			};
			const schema = YupHelper.utils.oneOfSchemas([syncThrowingSchema]);
			await expect(schema.validate('value')).rejects.toThrow('Value did not match any schema: ');
		});

		test('Should stringify failures that do not have a message property', async () => {
			const customFailure = { custom: 'error' };
			const objectFailureSchema = {
				validateSync: () => { throw new Error('sync validation failed'); },
				validate: () => Promise.reject(customFailure),
			};
			const schema = YupHelper.utils.oneOfSchemas([objectFailureSchema]);
			await expect(schema.validate('value')).rejects.toThrow('Value did not match any schema: [object Object]');
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testId();
	testColorArr();
	testColorStr();
	testUsername();
	testTitle();
	testShortDesc();
	testLongDesc();
	testTimestamp();
	testEmbeddedImage();
	testEmbeddedImageOrRef();
	testDateInThePast();
	testTransformUniqueArray();
	testOneOfSchemas();
});
