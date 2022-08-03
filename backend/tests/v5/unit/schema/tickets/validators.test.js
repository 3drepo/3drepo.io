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

const { src, image } = require('../../../helper/path');
const { generateRandomString, generateRandomNumber } = require('../../../helper/services');
const FS = require('fs');

jest.mock('../../../../../src/v5/schemas/tickets/templates');
const TemplateSchema = require(`${src}/schemas/tickets/templates`);
const TicketSchema = require(`${src}/schemas/tickets`);
const { fieldTypes } = require(`${src}/schemas/tickets/templates.constants`);

TemplateSchema.generateFullSchema.mockImplementation((t) => t);

const testPropertiesValidators = (testData, moduleProperty) => {
	describe.each(
		testData,
	)(`${moduleProperty ? '[Modules]' : ''}Should create a validator that correctly validates different types of properties`,
		(desc, schema, goodTest, badTest) => {
			test(desc, async () => {
				const fieldName = generateRandomString();
				const modName = generateRandomString();
				const propArr = [
					{
						name: fieldName,
						...schema,
					},
				];
				const template = {
					properties: moduleProperty ? [] : propArr,
					modules: moduleProperty ? [
						{
							name: modName,
							properties: propArr,
						},
					] : [],
				};

				const validator = await TicketSchema.generateTicketValidator(template);

				const runTest = async (data) => {
					const propObj = {
						[fieldName]: data,
					};
					const fullData = ({
						properties: moduleProperty ? {} : propObj,
						modules: moduleProperty ? {
							[modName]: {
								properties: propObj,
							},
						} : {},
					});

					try {
						await validator.validate(fullData);
					} catch (err) {
						throw undefined;
					}
				};

				await expect(runTest(goodTest)).resolves.toBeUndefined();
				await expect(runTest(badTest)).rejects.toBeUndefined();
			});
		});
};

const testGenerateTicketValidator = () => {
	describe('Generate ticket validator', () => {
		const propertyTypeTestData = [
			['Text', { type: fieldTypes.TEXT }, generateRandomString(), generateRandomString(121)],
			['Long text', { type: fieldTypes.LONG_TEXT }, generateRandomString(), generateRandomString(1201)],
			['Boolean', { type: fieldTypes.BOOLEAN }, true, new Date()],
			['Date', { type: fieldTypes.DATE }, Date.now(), generateRandomString()],
			['Number', { type: fieldTypes.NUMBER }, generateRandomNumber(), generateRandomString()],
			['Coordinates', { type: fieldTypes.COORDS }, [1, 2, 3], [2, 3]],
			['One Of', { type: fieldTypes.ONE_OF, values: ['a', 'b'] }, 'a', generateRandomString()],
			['Many Of', { type: fieldTypes.MANY_OF, values: ['a', 'b', 'c'] }, ['a'], ['b', generateRandomString()]],
			['Image', { type: fieldTypes.IMAGE }, FS.readFileSync(image, { encoding: 'base64' }), generateRandomString()],
			['View', { type: fieldTypes.VIEW }, { camera: { position: [1, 1, 1], forward: [1, 1, 1], up: [1, 1, 1] } }, {}],
			['Measurements', { type: fieldTypes.MEASUREMENTS }, [
				{ positions: [[0, 0, 0], [1, 1, 1]],
					value: generateRandomNumber(),
					color: [1, 1, 1, 1],
					type: 0,
					name: generateRandomString() },
			], [{}]],
		];

		testPropertiesValidators(propertyTypeTestData);
	});
};

describe('schema/tickets/validators', () => {
	testGenerateTicketValidator();
});
