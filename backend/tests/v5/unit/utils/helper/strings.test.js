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
	describe('Get URL Domain', () => {
		test('with a typical url, it should return the domain + protocol', () => {
			matchHelper(StringHelper.getURLDomain, 'http://abc.com/xyz/asb', 'http://abc.com');
			matchHelper(StringHelper.getURLDomain, 'http://abc.com/xyz/asb?abc=35', 'http://abc.com');
		});
		test('with a domain only url, it should return the domain + protocol', () => {
			matchHelper(StringHelper.getURLDomain, 'http://abc.com/', 'http://abc.com');
			matchHelper(StringHelper.getURLDomain, 'ftp://abc.com/', 'ftp://abc.com');
			matchHelper(StringHelper.getURLDomain, 'http://abc.com', 'http://abc.com');
		});
		test('with an invalid url, it should return the full string', () => {
			matchHelper(StringHelper.getURLDomain, 'someString', 'someString');
		});
		test('with an empty string, it should return an empty string', () => {
			matchHelper(StringHelper.getURLDomain, '', '');
		});
	});
};

const testToCamelCase = () => {
	describe('To Camel Case', () => {
		test('should expect to return camel case on an given string', () => {
			matchHelper(StringHelper.toCamelCase, 'one two three', 'oneTwoThree');
			matchHelper(StringHelper.toCamelCase, 'one_two_three', 'oneTwoThree');
			matchHelper(StringHelper.toCamelCase, 'ONE_TWO_THREE', 'oneTwoThree');
		});
		test('with an empty string, it should return an empty string', () => {
			matchHelper(StringHelper.toCamelCase, '', '');
		});
	});
};

const testToSnakeCase = () => {
	describe('To Snake Case', () => {
		test('should expect to return snake case on an given string', () => {
			matchHelper(StringHelper.toSnakeCase, 'one two three', 'ONE_TWO_THREE');
			matchHelper(StringHelper.toSnakeCase, 'one_two_three', 'ONE_TWO_THREE');
			matchHelper(StringHelper.toSnakeCase, 'oneTwoThree', 'ONE_TWO_THREE');
		});
		test('with an empty string, it should return an empty string', () => {
			matchHelper(StringHelper.toSnakeCase, '', '');
		});
	});
};

describe('String helpers', () => {
	testGetURLDomain();
	testToCamelCase();
	testToSnakeCase();
});
