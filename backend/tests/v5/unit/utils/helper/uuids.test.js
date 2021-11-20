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

const { src } = require('../../../helper/path');
const { generateUUIDString, generateUUID } = require('../../../helper/services');

const UUIDHelper = require(`${src}/utils/helper/uuids`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);

const matchHelper = (func, string, match) => {
	const res = func(string);
	expect(JSON.stringify(res)).toEqual(JSON.stringify(match));
};

const testStringToUUID = () => {
	describe.each([
		['ef0857b6-4cc7-4be1-b2d6-c032dce7806a', '7whXtkzHS+Gy1sAy3OeAag=='],
		['', ''],
		[undefined, undefined],
	])('String to UUID', (source, target) => {
		test(`with ${source} should return ${target}`, () => {
			matchHelper(UUIDHelper.stringToUUID, source, target);
		});
	});
};

const testUUIDToString = () => {
	const uuidTargets = [
		'00000000-0000-0000-0000-000000000001',
		'ef0857b6-4cc7-4be1-b2d6-c032dce7806a',
		undefined,
		null,
	];
	const uuidAndStringPairs = uuidTargets.map((target) => [UUIDHelper.stringToUUID(target), target]);
	uuidAndStringPairs.push(['', '']);
	describe.each(uuidAndStringPairs)('UUID to String', (source, target) => {
		test(`with ${source} should result in ${target}`, () => {
			matchHelper(UUIDHelper.UUIDToString, source, target);
		});
	});
};

const testGenerateUUID = () => {
	describe('Generate UUID', () => {
		test('should return UUID string', () => {
			const res = UUIDHelper.generateUUID();
			expect(isUUIDString(res)).toBe(false);
			expect(isUUIDString(UUIDHelper.UUIDToString(res))).toBe(true);
		});
	});
};

const testGenerateUUIDString = () => {
	describe('Generate string UUID', () => {
		test('should return UUID string', () => {
			const res = UUIDHelper.generateUUIDString();
			expect(isUUIDString(res)).toBe(true);
		});
	});
};

const testLookUpTable = () => {
	describe('LookUpTable test', () => {
		test('should construct and function fine without data', () => {
			const lut = new UUIDHelper.UUIDLookUpTable();
			expect(lut.has('a')).toBe(false);
			expect(lut.has()).toBe(false);
			expect(lut.has(generateUUIDString())).toBe(false);
			expect(lut.has(generateUUID())).toBe(false);

			const uuid = generateUUID();
			lut.add(uuid);
			expect(lut.has(uuid)).toBe(true);
			expect(lut.has(UUIDHelper.UUIDToString(uuid))).toBe(true);
		});

		test('should construct and function fine without data', () => {
			const exists1 = generateUUID();
			const exists2 = generateUUID();
			const lut = new UUIDHelper.UUIDLookUpTable([exists1, exists2]);
			expect(lut.has(exists1)).toBe(true);
			expect(lut.has(exists2)).toBe(true);
			expect(lut.has('a')).toBe(false);
			expect(lut.has()).toBe(false);
			expect(lut.has(generateUUIDString())).toBe(false);
			expect(lut.has(generateUUID())).toBe(false);

			const uuid = generateUUID();
			lut.add(uuid);
			expect(lut.has(uuid)).toBe(true);
			expect(lut.has(UUIDHelper.UUIDToString(uuid))).toBe(true);
		});
	});
};

describe('utils/helper/uuid', () => {
	testStringToUUID();
	testUUIDToString();
	testGenerateUUID();
	testGenerateUUIDString();
	testLookUpTable();
});
