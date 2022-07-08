/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { generateRandomString } = require('../../../helper/services');

const TemplateSchema = require(`${src}/schemas/tickets/templates`);

const testValidate = () => {
	const nameTests = [
		['the name is too long', { name: generateRandomString(121) }, false],
		['the name is an empty string', { name: '' }, false],
	];

	const schemaFieldsTest = [
		['all optional fields provided', {
			name: generateRandomString(),
			comments: false,
			deprecated: true,
			properties: undefined,
			modules: undefined,
		}, true],
		['properties is an empty array', { name: generateRandomString(), properties: [] }, true],
		['properties is of the wrong type', { name: generateRandomString(), properties: 'a' }, false],
		['modules is an empty array', { name: generateRandomString(), modules: [] }, true],
		['modules is of the wrong type', { name: generateRandomString(), modules: 'a' }, false],
	];

	describe.each([
		['the template is undefined', undefined, false],
		['the template is empty', {}, false],
		['the template has all the required fields', { name: generateRandomString() }, true],
		...nameTests,
		...schemaFieldsTest,

	])('Validate ticket template', (desc, data, output) => {
		test(`Validation should ${output ? 'succeed' : 'fail'} if ${desc}`, () => {
			const testCase = expect(() => TemplateSchema.validate(data));
			if (output) testCase.not.toThrow();
			else testCase.toThrow();
		});
	});

	// test strip unknowns
	// test auto fields filled in
};

describe('schema/tickets/templates', () => {
	testValidate();
});
