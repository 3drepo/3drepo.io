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

const testToBoolean = () => {
	describe.each([
		[undefined, false],
		['one two three', false],
		['TRUE', true],
		['True', true],
		['true', true],
		['FALSE', false],
		['False', false],
		['false', false],
	])('To Boolean', (source, target) => {
		test(`with ${source} should result in ${target}`, () => {
			matchHelper(StringHelper.toBoolean, source, target);
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

const testEscapeRegexChrs = () => {
	describe.each([
		['', ''],
		['oneTwoThree', 'oneTwoThree'],
		['.*', '\\.\\*'],
	])('Escape regex characters', (source, target) => {
		test(`with ${source} should result in ${target}`, () => {
			expect(StringHelper.escapeRegexChrs(source)).toEqual(target);
		});
	});
};

const testToBase64 = () => {
	describe.each([
		['', ''],
		['This is a testing string', 'VGhpcyBpcyBhIHRlc3Rpbmcgc3RyaW5n'],
	])('To base 64', (source, target) => {
		test(`with ${source} should result in ${target}`, () => {
			expect(StringHelper.toBase64(source)).toEqual(target);
		});
	});
};

const testFromBase64 = () => {
	describe.each([
		['', ''],
		['VGhpcyBpcyBhIHRlc3Rpbmcgc3RyaW5n', 'This is a testing string'],
	])('From base 64', (source, target) => {
		test(`with ${source} should result in ${target}`, () => {
			expect(StringHelper.fromBase64(source)).toEqual(target);
		});
	});
};

const testSplitName = () => {
	describe('Split Name', () => {
		test('with first and last name', () => {
			const name = 'Will Smith';
			const [firstName, lastName] = StringHelper.splitName(name);
			expect(firstName).toEqual('Will');
			expect(lastName).toEqual('Smith');
		});

		test('with single name', () => {
			const name = 'Will';
			const [firstName, lastName] = StringHelper.splitName(name);
			expect(firstName).toEqual('Will');
			expect(lastName).toEqual('');
		});

		test('with empty string', () => {
			const name = '';
			const [firstName, lastName] = StringHelper.splitName(name);
			expect(firstName).toEqual('Anonymous');
			expect(lastName).toEqual('User');
		});
	});
};

describe('utils/helper/strings', () => {
	testGetURLDomain();
	testToCamelCase();
	testToConstantCase();
	testToBoolean();
	testGenerateHashString();
	testFormatPronouns();
	testEscapeRegexChrs();
	testToBase64();
	testFromBase64();
	testSplitName();
});
