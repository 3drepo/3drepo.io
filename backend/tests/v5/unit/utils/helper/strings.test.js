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

const StringHelper = require(`${src}/utils/helper/strings`);

const matchHelper = (func, string, match) => {
	const res = func(string);
	expect(res).toEqual(match);
};

const testGetURLDomain = () => {
	describe.each([
		['http://abc.com/xyz/asb', 'http://abc.com'],
		['http://abc.com/xyz/asb?abc=35', 'http://abc.com'],
		['http://abc.com/', 'http://abc.com'],
		['ftp://abc.com/', 'ftp://abc.com'],
		['http://abc.com', 'http://abc.com'],
		['someString', 'someString'],
		['', ''],

	])('Get URL Domain', (source, target) => {
		test(`with ${source} should return ${target}`, () => {
			matchHelper(StringHelper.getURLDomain, source, target);
		});
	});
};

const testToCamelCase = () => {
	describe.each([
		['one two three', 'oneTwoThree'],
		['one_two_three', 'oneTwoThree'],
		['ONE_TWO_THREE1', 'oneTwoThree1'],
		['', ''],
	])('To Camel Case', (source, target) => {
		test(`with ${source} should result in ${target}`, () => {
			matchHelper(StringHelper.toCamelCase, source, target);
		});
	});
};

const testToConstantCase = () => {
	describe.each([
		['one two three', 'ONE_TWO_THREE'],
		['oneTwoThree', 'ONE_TWO_THREE'],
		['oneTwoThree1', 'ONE_TWO_THREE_1'],
		['', ''],
	])('To Snake Case', (source, target) => {
		test(`with ${source} should result in ${target}`, () => {
			matchHelper(StringHelper.toConstantCase, source, target);
		});
	});
};

describe('utils/helper/strings', () => {
	testGetURLDomain();
	testToCamelCase();
	testToConstantCase();
});
