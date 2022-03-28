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

const testHasEmailFormat = () => {
	describe('Has email format', () => {
		test('with email format should return true', () => {
			matchHelper(StringHelper.hasEmailFormat, 'example@email.com', true);
		});

		test('with non email format should return false', () => {
			matchHelper(StringHelper.hasEmailFormat, 'nonEmail', false);
		});
	});
};

const testGenerateHashString = () => {
	describe('Generate Hash String', () => {
		test('with no length parameter passed', () => {
			const hashString = StringHelper.generateHashString();
			expect(hashString.length).toEqual(32);
		});

		test('with length parameter passed', () => {
			const hashString = StringHelper.generateHashString(50);
			expect(hashString.length).toEqual(50);
		});
	});
};

const testCapitalizeFirstLetter = () => {
	describe('Capitalize first letter', () => {
		test('with a lower case first letter', () => {
			const name = 'will';
			const formattedString = StringHelper.capitalizeFirstLetter(name);
			expect(formattedString).toEqual('Will');
		});

		test('with a capital case first letter', () => {
			const name = 'Will';
			const formattedString = StringHelper.capitalizeFirstLetter(name);
			expect(formattedString).toEqual('Will');
		});

		test('with a capital case string', () => {
			const name = 'WILL';
			const formattedString = StringHelper.capitalizeFirstLetter(name);
			expect(formattedString).toEqual('WILL');
		});
	});
};

const testFormatPronouns = () => {
	describe('Format string pronouns', () => {
		test('with two words all lowercase', () => {
			const name = 'will smith';
			const formattedString = StringHelper.formatPronouns(name);
			expect(formattedString).toEqual('Will Smith');
		});

		test('with two words all capital case', () => {
			const name = 'WILL SMITH';
			const formattedString = StringHelper.formatPronouns(name);
			expect(formattedString).toEqual('Will Smith');
		});

		test('with a single word', () => {
			const name = 'will';
			const formattedString = StringHelper.formatPronouns(name);
			expect(formattedString).toEqual('Will');
		});
	});
};

describe('utils/helper/strings', () => {
	testGetURLDomain();
	testToCamelCase();
	testToConstantCase();
	testHasEmailFormat();
	testGenerateHashString();
	testFormatPronouns();
	testCapitalizeFirstLetter();
});
