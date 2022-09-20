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
const { times, cloneDeep } = require('lodash');

const { src, image } = require('../../../helper/path');
const { generateRandomString, generateRandomNumber, generateUUID } = require('../../../helper/services');
const FS = require('fs');

jest.mock('../../../../../src/v5/schemas/tickets/templates');
const TemplateSchema = require(`${src}/schemas/tickets/templates`);

jest.mock('../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/models/teamspaces');
const TeamspaceModel = require(`${src}/models/teamspaces`);

const TicketSchema = require(`${src}/schemas/tickets`);
const {
	basePropertyLabels,
	modulePropertyLabels,
	propTypes,
	riskLevels,
	presetEnumValues,
	presetModules } = require(`${src}/schemas/tickets/templates.constants`);

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
						title: generateRandomString(),
						type: generateUUID(),
						properties: moduleProperty ? {} : propObj,
						modules: moduleProperty ? {
							[presetModules.SEQUENCING]: propObj,
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
				title: generateRandomString(),
				type: generateUUID(),
				properties: moduleProperty ? {} : propObjIn,
				modules: moduleProperty ? {
					[modName]: propObjIn,
				} : {},
			});

			if (succeed) {
				const propObjOut = output === undefined ? {} : {
					[fieldName]: output,
				};
				const outData = ({
					...fullData,
					properties: moduleProperty ? {} : propObjOut,
					modules: moduleProperty ? {
						[modName]: propObjOut,
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

		const generateTemplate = (values) => ({
			properties: [{
				name: prop,
				type: propTypes.ONE_OF,
				values,
				required: true,
			}],
			modules: [{
				name: module,
				properties: [{
					name: prop2,
					type: propTypes.ONE_OF,
					values,
					required: true,
				}],
			}],
		});

		const createData = (a, b) => ({

			title: generateRandomString(),
			type: generateUUID(),
			properties: {
				[prop]: a,
			},
			modules: {
				[module]: {
					[prop2]: b,
				},
			},
		});

		const runTestCases = (template, testCases) => {
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
		};

		describe(presetEnumValues.JOBS_AND_USERS, () => {
			const template = generateTemplate(presetEnumValues.JOBS_AND_USERS);

			const jobs = times(5, () => generateRandomString());
			const users = times(5, () => generateRandomString());
			JobsModel.getJobNames.mockResolvedValue(jobs);
			TeamspaceModel.getAllUsersInTeamspace.mockResolvedValue(users);

			const testCases = [
				['With existing jobs', createData(jobs[2], jobs[4]), true],
				['With existing users', createData(users[0], users[4]), true],
				['With non existing values', createData(() => generateRandomString()(), () => generateRandomString()()), false],
			];

			runTestCases(template, testCases);
		});

		describe(presetEnumValues.RISK_CATEGORIES, () => {
			const template = generateTemplate(presetEnumValues.RISK_CATEGORIES);

			const categories = times(5, () => generateRandomString());
			TeamspaceModel.getRiskCategories.mockResolvedValue(categories);

			const testCases = [
				['With existing risk categories', createData(categories[2], categories[1]), true],
				['With non existing values', createData(() => generateRandomString()(), () => generateRandomString()()), false],
			];

			runTestCases(template, testCases);
		});
	});
};

const testValidateTicket = () => {
	describe('Validate ticket', () => {
		const propertyTypeTestData = [
			['Text', { type: propTypes.TEXT }, generateRandomString(), generateRandomString(121)],
			['Long text', { type: propTypes.LONG_TEXT }, generateRandomString(), generateRandomString(1201)],
			['Boolean', { type: propTypes.BOOLEAN }, true, new Date()],
			['Date', { type: propTypes.DATE }, Date.now(), generateRandomString()],
			['Number', { type: propTypes.NUMBER }, generateRandomNumber(), generateRandomString()],
			['Coordinates', { type: propTypes.COORDS }, [1, 2, 3], [2, 3]],
			['One Of', { type: propTypes.ONE_OF, values: ['a', 'b'] }, 'a', generateRandomString()],
			['Many Of', { type: propTypes.MANY_OF, values: ['a', 'b', 'c'] }, ['a'], ['b', generateRandomString()]],
			['Image', { type: propTypes.IMAGE }, FS.readFileSync(image, { encoding: 'base64' }), generateRandomString()],
			['View (empty)', { type: propTypes.VIEW }, { }, 123],
			['View (Image only)', { type: propTypes.VIEW }, { screenshot: FS.readFileSync(image, { encoding: 'base64' }) }, { screenshot: 'abc' }],
			['View', { type: propTypes.VIEW }, { camera: { position: [1, 1, 1], forward: [1, 1, 1], up: [1, 1, 1] } }, { camera: {} }],
			['View (orthographic)', { type: propTypes.VIEW }, { camera: { type: 'orthographic', size: 5, position: [1, 1, 1], forward: [1, 1, 1], up: [1, 1, 1] } }, { camera: { type: 'orthographic' } }],
			['Measurements', { type: propTypes.MEASUREMENTS }, [
				{ positions: [[0, 0, 0], [1, 1, 1]],
					value: generateRandomNumber(),
					color: [1, 1, 1, 1],
					type: 0,
					name: generateRandomString() },
			], [{}]],
		];

		testPropertyTypes(propertyTypeTestData);
		testPropertyTypes(propertyTypeTestData, true);
		const randomData = generateRandomString();

		const propertyConditionTests = [
			['Should fill in default value if not present', { type: propTypes.TEXT, default: randomData }, true, undefined, randomData],
			['Should pass if optional field is not present', { type: propTypes.TEXT }, true],
			['Should fail if required field is not present', { type: propTypes.TEXT, required: true }, false],
			['Should ignore deprecated fields', { type: propTypes.TEXT, deprecated: true }, true, generateRandomString()],
			['Ignore values on N/A types', { type: propTypes.TEXT, values: [generateRandomString()] }, true, randomData, randomData],
			['Should ignore read only fields', { type: propTypes.TEXT, readOnly: true }, true, generateRandomString()],
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
						type: propTypes.TEXT,
					}],
					deprecated: true,
				}],
			};

			const input = {

				title: generateRandomString(),
				type: generateUUID(),
				properties: {},
				modules: {} };
			await expect(TicketSchema.validateTicket(teamspace, template, input)).resolves.toEqual(input);
		});

		test('Should created default properties/modules object if it is not present', async () => {
			const teamspace = generateRandomString();
			const template = {
				properties: [{
					name: generateRandomString(),
					type: propTypes.TEXT,
				}],
				modules: [],
			};

			const input = {
				title: generateRandomString(),
				type: generateUUID() };
			await expect(TicketSchema.validateTicket(teamspace, template, input))
				.resolves.toEqual({ ...input, properties: {}, modules: {} });
		});

		testPresetValues();
	});
};

const testProcessReadOnlyValues = () => {
	describe('Process read only values', () => {
		test('Should fill in all the base properties if they are not present', () => {
			const user = generateRandomString();
			const ticket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {},
				modules: {} };
			TicketSchema.processReadOnlyValues(ticket, user);
			const { OWNER, CREATED_AT, UPDATED_AT } = basePropertyLabels;
			expect(ticket.properties[OWNER]).toEqual(user);
			expect(ticket.properties[CREATED_AT]).toBeInstanceOf(Date);
			expect(ticket.properties[UPDATED_AT]).toBeInstanceOf(Date);
		});
		test('Should leave the properties with existing values if they are available', () => {
			const user = generateRandomString();
			const created = new Date(1000000);
			const updated = new Date(2000000);
			const { OWNER, CREATED_AT, UPDATED_AT } = basePropertyLabels;
			const ticket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[OWNER]: user,
					[CREATED_AT]: created,
					[UPDATED_AT]: updated,
				},
				modules: {} };
			const expectedOutput = cloneDeep(ticket);
			TicketSchema.processReadOnlyValues(ticket, generateRandomString());
			expect(ticket).toEqual(expectedOutput);
		});

		describe(presetModules.SAFETIBASE, () => {
			const {
				RISK_LIKELIHOOD,
				RISK_CONSEQUENCE,
				LEVEL_OF_RISK,
				TREATED_RISK_LIKELIHOOD,
				TREATED_RISK_CONSEQUENCE,
				TREATED_LEVEL_OF_RISK,
			} = modulePropertyLabels[presetModules.SAFETIBASE];

			describe.each([
				['likelihood is missing', true, false],
				['consequence is missing', false, true],
				['both are missing', false, false],
			])('Should not calculate treated level of risk if ', (desc, likelihood, consequence) => {
				test(desc, () => {
					const ticket = { properties: {},
						title: generateRandomString(),
						type: generateUUID(),
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: riskLevels.VERY_HIGH,
								[RISK_CONSEQUENCE]: riskLevels.VERY_HIGH,
								[TREATED_RISK_LIKELIHOOD]: likelihood ? riskLevels.VERY_HIGH : undefined,
								[TREATED_RISK_CONSEQUENCE]: consequence ? riskLevels.VERY_HIGH : undefined,
							},
						},
					};

					TicketSchema.processReadOnlyValues(ticket, generateRandomString());
					const expectedOutput = { ...ticket,
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: riskLevels.VERY_HIGH,
								[RISK_CONSEQUENCE]: riskLevels.VERY_HIGH,
								[LEVEL_OF_RISK]: riskLevels.VERY_HIGH,
								[TREATED_RISK_LIKELIHOOD]: likelihood ? riskLevels.VERY_HIGH : undefined,
								[TREATED_RISK_CONSEQUENCE]: consequence ? riskLevels.VERY_HIGH : undefined,
							},
						},
					};
					expect(ticket).toEqual(expectedOutput);
				});
			});

			describe.each([
				[riskLevels.VERY_HIGH, riskLevels.VERY_HIGH, riskLevels.VERY_HIGH],
				[riskLevels.VERY_HIGH, riskLevels.MODERATE, riskLevels.HIGH],
				[riskLevels.MODERATE, riskLevels.LOW, riskLevels.MODERATE],
				[riskLevels.LOW, riskLevels.LOW, riskLevels.LOW],
				[riskLevels.VERY_LOW, riskLevels.VERY_LOW, riskLevels.VERY_LOW],
			])('Level of risk calculation', (likelihood, consequence, expectedRes) => {
				test(`Likelihood: ${likelihood}, Consequence: ${consequence} should result in ${expectedRes}`, () => {
					const ticket = { properties: {},
						title: generateRandomString(),
						type: generateUUID(),
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: likelihood,
								[RISK_CONSEQUENCE]: consequence,
								[TREATED_RISK_LIKELIHOOD]: likelihood,
								[TREATED_RISK_CONSEQUENCE]: consequence,
							},
						},
					};
					TicketSchema.processReadOnlyValues(ticket, generateRandomString());
					const expectedOutput = { ...ticket,
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: likelihood,
								[RISK_CONSEQUENCE]: consequence,
								[LEVEL_OF_RISK]: expectedRes,
								[TREATED_RISK_LIKELIHOOD]: likelihood,
								[TREATED_RISK_CONSEQUENCE]: consequence,
								[TREATED_LEVEL_OF_RISK]: expectedRes,
							},
						},
					};

					expect(ticket).toEqual(expectedOutput);
				});
			});
		});
	});
};

describe('schema/tickets/validators', () => {
	testValidateTicket();
	testProcessReadOnlyValues();
});
