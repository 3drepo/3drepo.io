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

jest.mock('../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/models/teamspaces');
const TeamspaceModel = require(`${src}/models/teamspaces`);

const TicketSchema = require(`${src}/schemas/tickets`);
const { fieldTypes, presetModules } = require(`${src}/schemas/tickets/templates.constants`);

TemplateSchema.generateFullSchema.mockImplementation((t) => t);

const testPropertyTypes = (testData, moduleProperty) => {
	describe.each(
		testData,
	)(`${moduleProperty ? '[Modules] ' : ''}Property types`,
		(desc, schema, goodTest, badTest) => {
			test(desc, async () => {
				const teamspace = generateRandomString();
				const fieldName = generateRandomString();
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
							type: presetModules.SEQUENCING,
							properties: propArr,
						},
					] : [],
				};

				const runTest = async (data) => {
					const propObj = {
						[fieldName]: data,
					};
					const fullData = ({
						properties: moduleProperty ? {} : propObj,
						modules: moduleProperty ? {
							[presetModules.SEQUENCING]: {
								properties: propObj,
							},
						} : {},
					});

					try {
						await TicketSchema.validateTicket(teamspace, template, fullData);
					} catch (err) {
						throw undefined;
					}
				};

				await expect(runTest(goodTest)).resolves.toBeUndefined();
				await expect(runTest(badTest)).rejects.toBeUndefined();
			});
		});
};

const testPropertyConditions = (testData, moduleProperty) => {
	describe.each(
		testData,
	)(`${moduleProperty ? '[Modules] ' : ''}Property Conditions`, (desc, schema, succeed, input, output) => {
		test(desc, async () => {
			const teamspace = generateRandomString();
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

			const propObjIn = input === undefined ? {} : {
				[fieldName]: input,
			};
			const fullData = ({
				properties: moduleProperty ? {} : propObjIn,
				modules: moduleProperty ? {
					[modName]: {
						properties: propObjIn,
					},
				} : {},
			});

			if (succeed) {
				const propObjOut = output === undefined ? {} : {
					[fieldName]: output,
				};
				const outData = ({
					properties: moduleProperty ? {} : propObjOut,
					modules: moduleProperty ? {
						[modName]: {
							properties: propObjOut,
						},
					} : {},
				});

				await expect(TicketSchema.validateTicket(teamspace, template, fullData)).resolves.toEqual(outData);
			} else {
				await expect(TicketSchema.validateTicket(teamspace, template, fullData)
					.catch(() => Promise.reject())).rejects.toBeUndefined();
			}
		});
	});
};

const testPresetValues = () => {
	describe('Preset values', () => {
		const teamspace = generateRandomString();
		const module = generateRandomString();
		const prop = generateRandomString();
		const prop2 = generateRandomString();
		const template = {
			properties: [{
				name: prop,
				type: fieldTypes.ONE_OF,
				values: 'jobsAndUsers',
				required: true,
			}],
			modules: [{
				name: module,
				properties: [{
					name: prop2,
					type: fieldTypes.ONE_OF,
					values: 'jobsAndUsers',
					required: true,
				}],
			}],
		};

		JobsModel.getJobs.mockResolvedValue(['JobA', 'JobB']);
		TeamspaceModel.getAllUsersInTeamspace.mockResolvedValue(['UserA', 'UserB']);

		const createData = (a, b) => ({
			properties: {
				[prop]: a,
			},
			modules: {
				[module]: {
					properties: {
						[prop2]: b,
					},
				},
			},
		});

		const testCases = [
			['With existing jobs', createData('JobA', 'JobB'), true],
			['With existing users', createData('UserA', 'UserB'), true],
			['With non existing values', createData(generateRandomString(), generateRandomString()), false],
		];

		const runTest = async (data) => {
			try {
				await TicketSchema.validateTicket(teamspace, template, data);
			} catch (err) {
				throw undefined;
			}
		};

		for (const [desc, input, success] of testCases) {
			test(`${desc} should ${success ? 'pass' : 'fail'}`, async () => {
				if (success) {
					await expect(runTest(input)).resolves.toBeUndefined();
				} else {
					await expect(runTest(input)).rejects.toBeUndefined();
				}
			});
		}
	});
};

const testValidateTicket = () => {
	describe('Validate ticket', () => {
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
			['View (orthographic)', { type: fieldTypes.VIEW }, { camera: { type: 'orthographic', size: 5, position: [1, 1, 1], forward: [1, 1, 1], up: [1, 1, 1] } }, {}],
			['Measurements', { type: fieldTypes.MEASUREMENTS }, [
				{ positions: [[0, 0, 0], [1, 1, 1]],
					value: generateRandomNumber(),
					color: [1, 1, 1, 1],
					type: 0,
					name: generateRandomString() },
			], [{}]],
		];

		testPropertyTypes(propertyTypeTestData);
		testPropertyTypes(propertyTypeTestData, true);

		const propertyConditionTests = [
			['Should fill in default value if not present', { type: fieldTypes.TEXT, default: 'hi' }, true, undefined, 'hi'],
			['Should pass if optional field is not present', { type: fieldTypes.TEXT }, true],
			['Should fail if required field is not present', { type: fieldTypes.TEXT, required: true }, false],
			['Should ignore deprecated fields', { type: fieldTypes.TEXT, deprecated: true }, true, generateRandomString()],
			['Should ignore read only fields', { type: fieldTypes.TEXT, readOnly: true }, true, generateRandomString()],
			['Should ignore unrecognised types', { type: generateRandomString(), required: true }, true, generateRandomString()],
		];

		testPropertyConditions(propertyConditionTests);
		testPropertyConditions(propertyConditionTests, true);

		test('Should ignore deprecated modules', async () => {
			const teamspace = generateRandomString();
			const template = {
				properties: [],
				modules: [{
					name: generateRandomString(),
					properties: [{
						name: generateRandomString(),
						required: true,
						type: fieldTypes.TEXT,
					}],
					deprecated: true,
				}],
			};

			const input = { properties: {}, modules: {} };
			await expect(TicketSchema.validateTicket(teamspace, template, input)).resolves.toEqual(input);
		});

		testPresetValues();
	});
};

describe('schema/tickets/validators', () => {
	testValidateTicket();
});
