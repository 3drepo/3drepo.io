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
			expect(isUUIDString(res)).toEqual(false);
			expect(isUUIDString(UUIDHelper.UUIDToString(res))).toEqual(true);
		});
	});
};

const testGenerateStringUUID = () => {
	describe('Generate string UUID', () => {
		test('should return UUID string', () => {
			const res = UUIDHelper.generateStringUUID();
			expect(isUUIDString(res)).toEqual(true);
		});
	});
};

describe('utils/helper/uuid', () => {
	testStringToUUID();
	testUUIDToString();
	testGenerateUUID();
	testGenerateStringUUID();
});
