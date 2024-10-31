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
const {
	determineTestGroup,
	generateGroup,
	generateRandomString,
	generateRandomNumber,
	generateUUID,
	generateUUIDString,
	generateRandomDate,
	generateTemplate,
	generateTicket,
} = require('../../../helper/services');

const FS = require('fs');

jest.mock('../../../../../src/v5/schemas/tickets/templates');
const TemplateSchema = require(`${src}/schemas/tickets/templates`);

jest.mock('../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/models/commons/settings');
const ModelSettingsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/settings`);

jest.mock('../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

const { isEqual, deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const { isString } = require(`${src}/utils/helper/typeCheck`);

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const TeamspaceModel = require(`${src}/models/teamspaceSettings`);

const TicketSchema = require(`${src}/schemas/tickets`);
const {
	basePropertyLabels,
	modulePropertyLabels,
	propTypes,
	riskLevels,
	presetEnumValues,
	presetModules,
	viewGroups } = require(`${src}/schemas/tickets/templates.constants`);

TemplateSchema.generateFullSchema.mockImplementation((t) => t);

const testPropertyTypes = (testData, moduleProperty, isNewTicket = true) => {
	describe.each(testData)(`${moduleProperty ? '[Modules] ' : ' '}Property types`,
		(desc, schema, goodTest, badTest, oldValue) => {
			test(desc, async () => {
				const teamspace = generateRandomString();
				const project = generateRandomString();
				const model = generateRandomString();

				const fieldName = generateRandomString();
				const propArr = [
					{
						name: fieldName,
						...schema,
					},
				];
				const template = {
					_id: generateUUID(),
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

					const oldTicket = isNewTicket ? undefined : {
						title: generateRandomString(),
						type: template._id,
						properties: {
							...(oldValue && !moduleProperty ? { [fieldName]: oldValue } : {}),
						},
						modules: {
							...(oldValue && moduleProperty ? {
								[presetModules.SEQUENCING]: {
									[fieldName]: oldValue,
								},
							} : {}),
						},
					};

					const fullData = ({
						title: generateRandomString(),
						type: template._id,
						properties: moduleProperty ? {} : propObj,
						modules: moduleProperty ? {
							[presetModules.SEQUENCING]: propObj,
						} : {},
					});

					await TicketSchema.validateTicket(teamspace, project, model, template, fullData, oldTicket);
				};

				if (goodTest !== undefined) await expect(runTest(goodTest)).resolves.toBeUndefined();

				if (badTest !== undefined) await expect(runTest(badTest)).rejects.not.toBeUndefined();
			});
		});
};

const testPropertyConditions = () => {
	const testFn = (testData, moduleProperty, isNewTicket) => {
		describe.each(
			testData,
		)(`${moduleProperty ? '[Modules] ' : ''}Property Conditions`, (desc, schema, succeed, input, output) => {
			test(desc, async () => {
				const fieldName = generateRandomString();
				const teamspace = generateRandomString();
				const project = generateRandomString();
				const model = generateRandomString();
				const modName = generateRandomString();
				const propArr = [
					{
						name: fieldName,
						...schema,
					},
				];
				const template = {
					_id: generateUUID(),
					properties: moduleProperty ? [] : propArr,
					modules: moduleProperty ? [
						{
							name: modName,
							properties: propArr,
						},
					] : [],
				};

				const propObjIn = input === undefined ? {} : { [fieldName]: input };

				const oldTicket = isNewTicket ? undefined : {
					title: generateRandomString(),
					type: template._id,
					properties: {
						[fieldName]: generateRandomString(),
					},
					modules: moduleProperty ? {
						[modName]: {
							[fieldName]: generateRandomString(),
						},
					} : {},
				};

				const fullData = ({
					title: isNewTicket ? generateRandomString() : undefined,
					type: isNewTicket ? template._id : undefined,
					properties: moduleProperty ? {} : propObjIn,
					modules: moduleProperty ? { [modName]: propObjIn } : {},
				});

				if (succeed) {
					const propObjOut = output === undefined ? {} : { [fieldName]: output };
					const outData = ({
						...fullData,
						properties: moduleProperty ? {} : propObjOut,
						modules: moduleProperty && output
							? deleteIfUndefined({ [modName]: isEqual(propObjOut, {}) ? undefined : propObjOut }) : {},
					});

					await expect(TicketSchema.validateTicket(teamspace, project, model, template, fullData, oldTicket))
						.resolves.toEqual(outData);
				} else {
					await expect(TicketSchema.validateTicket(teamspace, project, model, template, fullData, oldTicket)
						.catch(() => Promise.reject())).rejects.toBeUndefined();
				}
			});
		});
	};
	const randomData = generateRandomString();

	const commonPropertyConditionTests = [
		['Should pass if optional field is not present', { type: propTypes.TEXT }, true],
		['Should ignore deprecated fields', { type: propTypes.TEXT, deprecated: true }, true, generateRandomString()],
		['Ignore values on N/A types', { type: propTypes.TEXT, values: [generateRandomString()] }, true, randomData, randomData],
		['Should ignore read only fields', { type: propTypes.TEXT, readOnly: true }, true, generateRandomString()],
		['Should ignore unrecognised types', { type: generateRandomString(), required: true }, true, generateRandomString()],
	];

	const addTicketPropertyConditionTests = commonPropertyConditionTests.concat([
		['Should fill in default value if not present', { type: propTypes.TEXT, default: randomData }, true, undefined, randomData],
		['Should fail if required field is not present', { type: propTypes.TEXT, required: true }, false],
		['Should pass if property is immutable', { type: propTypes.TEXT, immutable: true }, true, randomData, randomData],
	]);

	const updateTicketPropertyConditionTests = commonPropertyConditionTests.concat([
		['Should pass if required field is not present (ticket update)', { type: propTypes.TEXT, required: true }, true],
		['Should fail if required field is set to null (ticket update)', { type: propTypes.TEXT, required: true }, false, null],
		['Should fail if property is immutable (ticket update)', { type: propTypes.TEXT, immutable: true }, false, randomData],
	]);

	testFn(addTicketPropertyConditionTests, false, true);
	testFn(addTicketPropertyConditionTests, true, true);
	testFn(updateTicketPropertyConditionTests, true);
	testFn(updateTicketPropertyConditionTests);
};

const testPresetValues = () => {
	describe('Preset values', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const module = generateRandomString();
		const prop = generateRandomString();
		const prop2 = generateRandomString();

		const generateTemplateWithValues = (values) => ({
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
					await TicketSchema.validateTicket(teamspace, project, model, template, data);
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
			const template = generateTemplateWithValues(presetEnumValues.JOBS_AND_USERS);

			const jobs = times(5, () => generateRandomString());
			const users = times(5, () => generateRandomString());
			JobsModel.getJobsByUsers.mockResolvedValue(jobs);
			ModelSettingsProcessor.getUsersWithPermissions.mockResolvedValue(users);

			const testCases = [
				['With existing jobs', createData(jobs[2], jobs[4]), true],
				['With existing users', createData(users[0], users[4]), true],
				['With non existing values', createData(() => generateRandomString()(), () => generateRandomString()()), false],
			];

			runTestCases(template, testCases);
		});

		describe(presetEnumValues.RISK_CATEGORIES, () => {
			const template = generateTemplateWithValues(presetEnumValues.RISK_CATEGORIES);

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

const testGroups = () => {
	describe('Groups (Inside views)', () => {
		const convertToTestParams = (desc, shouldPass, data) => [desc, { type: propTypes.VIEW },
			shouldPass ? data : undefined, shouldPass ? undefined : data];

		const testCases = [
			convertToTestParams('Undefined state object', true, { state: undefined }),
			convertToTestParams('Empty state object', true, { state: {} }),
			convertToTestParams('Have all groups', true, {
				state: {
					[viewGroups.HIDDEN]: [{ group: generateGroup(false, { hasId: false }) }],
					[viewGroups.COLORED]: [{
						group: generateGroup(false, { hasId: false }),
						color: times(3, () => 0),
						opacity: 1,
					}],
					[viewGroups.TRANSFORMED]: [{
						group: generateGroup(false, { hasId: false }),
						transformation: times(16, () => 0),
					}],
				},
			}),

			convertToTestParams('Smart groups', true, {
				state: {
					[viewGroups.HIDDEN]: [{ group: generateGroup(true, { hasId: false }) }],
					[viewGroups.COLORED]: [{
						group: generateGroup(true, { hasId: false }),
						color: times(3, () => 0),
						opacity: 1,
					}],
					[viewGroups.TRANSFORMED]: [{
						group: generateGroup(true, { hasId: false }),
						transformation: times(16, () => 0),
					}],
				},
			}),
			convertToTestParams('Empty group', false, {
				state: {
					[viewGroups.HIDDEN]: [{ group: {} }],
				},
			}),
			convertToTestParams('Have prefix', true, {
				state: {
					[viewGroups.HIDDEN]: [{
						group: generateGroup(false, { hasId: false }),
						prefix: times(2, () => generateRandomString),
					}],
					[viewGroups.COLORED]: [{
						group: generateGroup(false, { hasId: false }),
						color: times(3, () => 0),
						opacity: 1,
						prefix: times(2, () => generateRandomString),
					}],
					[viewGroups.TRANSFORMED]: [{
						group: generateGroup(false, { hasId: false }),
						transformation: times(16, () => 0),
						prefix: times(2, () => generateRandomString),
					}],
				},
			}),
			convertToTestParams('Invalid prefix type', false, {
				state: {
					[viewGroups.HIDDEN]: [{
						group: generateGroup(false, { hasId: false }),
						prefix: generateRandomString(),
					}],
				},
			}),
			convertToTestParams('Colored groups', true, {
				state: {
					[viewGroups.COLORED]: [{
						group: generateGroup(false, { hasId: false }),
						color: times(3, () => 0),
						opacity: 1,
					}],
				},
			}),
			convertToTestParams('Colored groups no color or opacity', false, {
				state: {
					[viewGroups.COLORED]: [{ group: generateGroup(false, { hasId: false }) }],
				},
			}),
			convertToTestParams('Colored groups - just colours', true, {
				state: {
					[viewGroups.COLORED]: [{
						group: generateGroup(false, { hasId: false }),
						color: times(3, () => 0),
					}],
				},
			}),
			convertToTestParams('Colored groups - not enough elements in the color array', false, {
				state: {
					[viewGroups.COLORED]: [{
						group: generateGroup(false, { hasId: false }),
						color: times(2, () => 0),
					}],
				},
			}),
			convertToTestParams('Colored groups - value too big', false, {
				state: {
					[viewGroups.COLORED]: [{
						group: generateGroup(false, { hasId: false }),
						color: times(3, () => 1000),
					}],
				},
			}),
			convertToTestParams('Colored groups - just opacity', true, {
				state: {
					[viewGroups.COLORED]: [{ group: generateGroup(false, { hasId: false }), opacity: 0.5 }],
				},
			}),
			convertToTestParams('Colored groups - opacity is 0', false, {
				state: {

					[viewGroups.COLORED]: [{ group: generateGroup(false, { hasId: false }), opacity: 0 }],
				},
			}),
			convertToTestParams('Transformed groups', true, {
				state: {
					[viewGroups.TRANSFORMED]: [{
						group: generateGroup(false, { hasId: false }),
						transformation: times(16, () => 1),
					}],
				},
			}),
			convertToTestParams('Transformed groups - no matrix', false, {
				state: {

					[viewGroups.TRANSFORMED]: [{ group: generateGroup(false, { hasId: false }) }],
				},
			}),
			convertToTestParams('Transformed groups - wrong type', false, {
				state: {
					[viewGroups.TRANSFORMED]: [{
						group: generateGroup(false, { hasId: false }),
						transformation: false,
					}],
				},
			}),
			convertToTestParams('Transformed groups - wrong array size', false, {
				state: {
					[viewGroups.TRANSFORMED]: [{
						group: generateGroup(false, { hasId: false }),
						transformation: times(15, () => 1),
					}],
				},
			}),

		];

		const updateOnlyTestCase = (isUpdate) => [
			convertToTestParams('Use group id instead of data', isUpdate, {
				state: {
					[viewGroups.TRANSFORMED]: [{
						group: generateUUIDString(),
						transformation: times(16, () => 1),
					}],
				},
			}),
		];

		testPropertyTypes([...testCases, ...updateOnlyTestCase(false)], false, true);
		testPropertyTypes([...testCases, ...updateOnlyTestCase(false)], true, true);
		testPropertyTypes([...testCases, ...updateOnlyTestCase(true)], false, false);
		testPropertyTypes([...testCases, ...updateOnlyTestCase(true)], true, false);
	});
};

const testUniqueProperties = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const moduleName = generateRandomString();
	const uniquePropName = generateRandomString();

	const template = {
		_id: generateUUID(),
		properties: [{
			name: uniquePropName,
			type: propTypes.TEXT,
			unique: true,
		}],
		modules: [{
			name: moduleName,
			properties: [{
				name: uniquePropName,
				type: propTypes.TEXT,
				unique: true,
			}],
		}],
	};

	describe.each([
		['the value is unique', true, false],
		['the value is unique (Module prop)', true, true],
		['the value is null', true, false, null, {}],
		['the value is null (Module prop)', true, true, null, {}],
		['the value is duplicate', false, false],
		['the value is duplicate (Module prop)', false, true],
	])('Unique Properties', (desc, shouldPass, moduleProperty, propValue = generateRandomString(), oldTicket) => {
		test(`Should ${shouldPass ? 'pass' : 'fail'} if ${desc}`, async () => {
			if (propValue) {
				times(shouldPass ? 2 : 1, () => TicketsModel.getTicketsByQuery.mockResolvedValueOnce(
					shouldPass ? [] : [{ _id: generateUUID() }]));
			}

			const data = { [uniquePropName]: propValue };

			const ticket = ({
				title: generateRandomString(),
				type: generateUUID(),
				properties: moduleProperty ? {} : data,
				modules: moduleProperty ? {
					[moduleName]: data,
				} : {},
			});

			if (shouldPass) {
				await expect(TicketSchema.validateTicket(teamspace, project, model, template, ticket, oldTicket))
					.resolves.not.toBeUndefined();
			} else {
				await expect(TicketSchema.validateTicket(teamspace, project, model, template, ticket, oldTicket))
					.rejects.not.toBeUndefined();
			}

			if (propValue) {
				const query = { type: template._id, [`${moduleProperty ? `modules.${moduleName}` : 'properties'}.${uniquePropName}`]: data[uniquePropName] };
				expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledWith(teamspace, project,
					model, query, { _id: 1 });
			}
		});
	});
};

const testAllProperties = () => {
	describe('Set & unset of all property types', () => {
		const imageRef = generateUUIDString();

		const propertyTypeSetData = [
			['Text', { type: propTypes.TEXT }, generateRandomString(), generateRandomString(121)],
			['Long text', { type: propTypes.LONG_TEXT }, generateRandomString(), generateRandomString(1201)],
			['Boolean', { type: propTypes.BOOLEAN }, true, new Date()],
			['Date', { type: propTypes.DATE }, Date.now(), generateRandomString()],
			['Past Date', { type: propTypes.PAST_DATE }, Date.now(), Date.now() + 1000],
			['Number', { type: propTypes.NUMBER }, generateRandomNumber(), generateRandomString()],
			['Coordinates', { type: propTypes.COORDS }, [1, 2, 3], [2, 3]],
			['One Of', { type: propTypes.ONE_OF, values: ['a', 'b'] }, 'a', generateRandomString()],
			['Many Of', { type: propTypes.MANY_OF, values: ['a', 'b', 'c'] }, ['a'], ['b', generateRandomString()]],
			['Image', { type: propTypes.IMAGE }, FS.readFileSync(image, { encoding: 'base64' }), generateRandomString()],
			['Image List', { type: propTypes.IMAGE_LIST }, times(5, FS.readFileSync(image, { encoding: 'base64' })), generateRandomString()],
			['View (empty)', { type: propTypes.VIEW }, {}, 123],
			['View (Image only)', { type: propTypes.VIEW }, { screenshot: FS.readFileSync(image, { encoding: 'base64' }) }, { screenshot: 'abc' }],
			['View', { type: propTypes.VIEW }, {
				camera: { position: [1, 1, 1], forward: [1, 1, 1], up: [1, 1, 1] },
				clippingPlanes: [{ normal: [1, 1, 1], clipDirection: -1, distance: 100 }],
				state: {
					[viewGroups.HIDDEN]: [
						{
							group: generateGroup(false, { hasId: false }),
							prefix: [generateRandomString()],
						},
					],
				},
			}, { camera: {} }],
			['View (orthographic)', { type: propTypes.VIEW }, { camera: { type: 'orthographic', size: 5, position: [1, 1, 1], forward: [1, 1, 1], up: [1, 1, 1] } }, { camera: { type: 'orthographic' } }],
			['Measurements', { type: propTypes.MEASUREMENTS }, [
				{
					positions: [[0, 0, 0], [1, 1, 1]],
					value: generateRandomNumber(),
					color: [1, 1, 1, 1],
					type: 0,
					name: generateRandomString(),
				},
			], [{}]],
		];

		const propertyTypeUnsetData = [
			['Text (unset)', { type: propTypes.TEXT }, null],
			['Long text (unset)', { type: propTypes.LONG_TEXT }, null],
			['Boolean (unset)', { type: propTypes.BOOLEAN }, null],
			['Date (unset)', { type: propTypes.DATE }, null],
			['Past Date (unset)', { type: propTypes.PAST_DATE }, null],
			['Number (unset)', { type: propTypes.NUMBER }, null],
			['Coordinates (unset)', { type: propTypes.COORDS }, null],
			['One Of (unset)', { type: propTypes.ONE_OF, values: ['a', 'b'] }, null],
			['Many Of (unset)', { type: propTypes.MANY_OF, values: ['a', 'b', 'c'] }, null],
			['Image (unset)', { type: propTypes.IMAGE }, null],
			['Image List (unset)', { type: propTypes.IMAGE_LIST }, null],
		];

		const updateOnlyCases = [
			['Image List with refs', { type: propTypes.IMAGE_LIST }, [imageRef, FS.readFileSync(image, { encoding: 'base64' })], [generateUUIDString()], [stringToUUID(imageRef)]],
			['Image List with refs when old value is null', { type: propTypes.IMAGE_LIST }, undefined, [imageRef]],
		];

		testPropertyTypes(propertyTypeSetData, false, true);
		testPropertyTypes(propertyTypeSetData, true, true);
		testPropertyTypes(propertyTypeUnsetData, false, false);
		testPropertyTypes(propertyTypeUnsetData, true, false);
		testPropertyTypes(updateOnlyCases, false, false);
		testPropertyTypes(updateOnlyCases, true, false);

		testGroups();
	});
};

const testCompositeTypes = () => {
	describe('Composite Types', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		test('Should remove the composite property if it is empty', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
				}],
				modules: [],
			};

			const input = {
				properties: {
					[propName]: {},
				},
			};

			const oldTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[propName]: {
						camera: {
							type: 'perspective',
							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
						},
					},
				},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input, oldTicket))
				.resolves.toEqual({ ...input, properties: {}, modules: {} });
		});

		test('Should remove composite property we are trying to set it to null when it\'s already empty', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
				}],
				modules: [],
			};

			const input = {
				properties: {
					[propName]: { camera: null },
				},
			};

			const oldTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {

				},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input, oldTicket))
				.resolves.toEqual({ ...input, properties: {}, modules: {} });
		});

		test('Should remove the property if it will be the same after default values', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
				}],
				modules: [],
			};

			const input = {
				properties: {
					[propName]: {
						camera: {

							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
						},
					},
				},
			};

			const oldTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[propName]: {
						camera: {
							type: 'perspective',
							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
						},
					},
				},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input, oldTicket))
				.resolves.toEqual({ ...input, properties: {}, modules: {} });
		});

		test('Should remove the composite property if it is the same as before', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
				}],
				modules: [],
			};

			const input = {
				properties: {
					[propName]: {
						camera: {
							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
						},
					},
				},
			};

			const oldTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[propName]: {
						camera: {
							type: 'perspective',
							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
						},
					},
				},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input, oldTicket))
				.resolves.toEqual({ ...input, properties: {}, modules: {} });
		});

		test('Should succeed if a required view only have a camera', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
					required: true,
				}],
				modules: [],
			};

			const input = {
				title: generateRandomString(),
				type: template._id,
				properties: {
					[propName]: {
						camera: {
							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
							type: 'perspective',
						},
					},
				},
			};

			await TicketSchema.validateTicket(teamspace, project, model, template, input);
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input))
				.resolves.toEqual({ ...input, modules: {} });
		});

		test('Should fail if a required view property has no camera on creation', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
					required: true,
				}],
				modules: [],
			};

			const input = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[propName]: {
						clippingPlanes: [{ normal: [1, 1, 1], clipDirection: -1, distance: 100 }],
					},
				},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input))
				.rejects.not.toBeUndefined();
		});

		test('Should fail if we are trying to remove the camera from a required view', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
					required: true,
				}],
				modules: [],
			};

			const input = {
				properties: {
					[propName]: {
						camera: null,
					},
				},
			};

			const oldTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[propName]: {
						camera: {
							type: 'perspective',
							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
						},
						clippingPlanes: [{ normal: [1, 1, 1], clipDirection: -1, distance: 100 }],
					},
				},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input, oldTicket))
				.rejects.not.toBeUndefined();
		});

		test('Should succeed if we are trying to remove the state/clip from a required view', async () => {
			const propName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					name: propName,
					type: propTypes.VIEW,
					required: true,
				}],
				modules: [],
			};

			const input = {
				properties: {
					[propName]: {
						clippingPlanes: null,
						state: null,
					},
				},
			};

			const oldTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[propName]: {
						camera: {
							type: 'perspective',
							position: [1, 2, 3],
							forward: [1, 2, 3],
							up: [1, 2, 3],
						},
						clippingPlanes: [{ normal: [1, 1, 1], clipDirection: -1, distance: 100 }],
						state: { showHidden: true },
					},
				},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input, oldTicket))
				.resolves.toEqual({ ...input, modules: {} });
		});
	});
};

const testImportedTickets = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	describe('Imported tickets', () => {
		const importTestTem = {
			_id: generateUUID(),
			...generateTemplate(false, false, { comments: true }),
		};

		const importTestTemNoComments = {
			_id: generateUUID(),
			...generateTemplate(),
		};

		const importTestInput = generateTicket(importTestTem);

		test('Should invoke generateFullSchema with isImport set to true if it is a new ticket and is in import mode', async () => {
			await TicketSchema.validateTicket(teamspace, project, model, importTestTem,
				importTestInput, undefined, true);
			expect(TemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplateSchema.generateFullSchema).toHaveBeenCalledWith(importTestTem, true);
		});

		test('Should invoke generateFullSchema with isImport set to false if it is not a new ticket and is in import mode', async () => {
			await TicketSchema.validateTicket(teamspace, project, model, importTestTem,
				importTestInput, importTestInput, true);
			expect(TemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplateSchema.generateFullSchema).toHaveBeenCalledWith(importTestTem, false);
		});

		test('Should NOT allow users to specify creation date if it is an existing ticket', async () => {
			const date = Date.now();
			const { properties, ...others } = importTestInput;
			const res = await TicketSchema.validateTicket(teamspace, project, model, importTestTem,
				{ ...others,
					properties: {
						...properties,
						[basePropertyLabels.CREATED_AT]: date,
					},

				}, importTestInput, true);
			expect(TemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplateSchema.generateFullSchema).toHaveBeenCalledWith(importTestTem, false);

			expect(res.properties[basePropertyLabels.CREATED_AT]).not.toEqual(new Date(date));
		});

		const comments = times(5, () => ({
			message: generateRandomString(),
			originalAuthor: generateRandomString(),
			createdAt: Date.now(),
		}));
		describe.each([
			['and should not contain comments in the output if it was not provided to begin with', true, importTestInput],
			['and should contain comments in the output', true, { ...importTestInput, comments }],
			['if the template does not support comments', false, { ...generateTicket(importTestTemNoComments), comments }, importTestTemNoComments],
			['if the template does not support comments and there are no comments', true, { ...generateTicket(importTestTemNoComments) }, importTestTemNoComments],
			['if comments is not of the right type', false, { ...importTestInput, comments: true }],
			['if comments array is empty', false, { ...importTestInput, comments: [] }],
			['if comments contains items of the incorrect type', false, { ...importTestInput, comments: [...comments, undefined, 1, true] }],
			['if a comment does not have an original author', false, { ...importTestInput,
				comments: [...comments, {
					message: generateRandomString(),
					createdAt: Date.now() }] }],
			['if a comment does not have a created at date', false, { ...importTestInput,
				comments: [...comments, {
					message: generateRandomString(),
					originalAuthor: generateRandomString(),
				}] }],
			['if a comment have a created at date in the future', false, { ...importTestInput,
				comments: [...comments, {
					message: generateRandomString(),
					originalAuthor: generateRandomString(),
					createdAt: Date.now() + 100000,
				}] }],

		])('Imported with comments', (desc, success, ticket, template = importTestTem) => {
			times(2, (iLoop) => {
				const isNewTicket = iLoop === 0;
				test(`[${isNewTicket ? 'New Ticket' : 'Update Ticket'}] Should${success ? '' : ' not'} validate ${desc}`, async () => {
					const test = TicketSchema.validateTicket(teamspace, project, model, template,
						ticket, isNewTicket ? undefined : importTestInput, true);
					if (success) {
						const output = await test;
						if (ticket.comments) {
							expect(ticket.comments.length).toEqual(output.comments.length);
							ticket.comments.forEach(({ others, createdAt }, i) => {
								expect(output.comments[i]).toEqual(expect.objectContaining({ ...others,
									createdAt: new Date(createdAt),
								}));
							});
						} else {
							expect(output.comments).toBeUndefined();
						}
					} else {
						expect(test).rejects.not.toBeUndefined();
					}

					expect(TemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
					expect(TemplateSchema.generateFullSchema).toHaveBeenCalledWith(template, isNewTicket);
				});
			});
		});
	});
};

const testValidateTicket = () => {
	describe('Validate ticket', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		testAllProperties();
		testPropertyConditions();
		testPresetValues();
		testUniqueProperties();
		testCompositeTypes();
		testImportedTickets();

		test('Should ignore deprecated modules', async () => {
			const template = {
				_id: generateUUID(),
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
				modules: {},
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input))
				.resolves.toEqual({ ...input, type: template._id });
		});

		test('Should created default properties/modules object if it is not present', async () => {
			const template = {
				_id: generateUUID(),
				properties: [{
					name: generateRandomString(),
					type: propTypes.TEXT,
				}],
				modules: [],
			};

			const input = {
				title: generateRandomString(),
				type: template._id,
			};
			await expect(TicketSchema.validateTicket(teamspace, project, model, template, input))
				.resolves.toEqual({ ...input, properties: {}, modules: {} });
		});
	});
};

const testProcessReadOnlyValues = () => {
	describe('Process read only values', () => {
		test('Should fill in all the base properties if they are not present', () => {
			const user = generateRandomString();
			const newTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {},
				modules: {},
			};
			TicketSchema.processReadOnlyValues(undefined, newTicket, user);
			const { OWNER, CREATED_AT, UPDATED_AT } = basePropertyLabels;
			expect(newTicket.properties[OWNER]).toEqual(user);
			expect(newTicket.properties[CREATED_AT]).toBeInstanceOf(Date);
			expect(newTicket.properties[UPDATED_AT]).toBeInstanceOf(Date);
		});

		test('Should update updated at if there an old ticket is provided', () => {
			const user = generateRandomString();
			const { OWNER, CREATED_AT, UPDATED_AT } = basePropertyLabels;
			const oldTicket = {
				title: generateRandomString(),
				type: generateUUID(),
				properties: {
					[OWNER]: user,
					[CREATED_AT]: generateRandomDate(),
					[UPDATED_AT]: generateRandomDate(),
				},
				modules: {},
			};
			const newTicket = {
				title: generateRandomString(),
				properties: {
					[generateRandomString()]: generateRandomString(),
				},
			};
			const expectedOutput = cloneDeep(newTicket);
			TicketSchema.processReadOnlyValues(oldTicket, newTicket, generateRandomString());
			expect(newTicket.properties[UPDATED_AT]).not.toEqual(oldTicket.properties[UPDATED_AT]);
			expectedOutput.properties[UPDATED_AT] = newTicket.properties[UPDATED_AT];
			expect(newTicket).toEqual(expectedOutput);
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
			])('(new ticket) Should not calculate treated level of risk if ', (desc, likelihood, consequence) => {
				test(desc, () => {
					const { OWNER, CREATED_AT, UPDATED_AT } = basePropertyLabels;
					const newTicket = {
						properties: {
							[OWNER]: generateRandomString(),
							[CREATED_AT]: generateRandomDate(),
						},
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: riskLevels.VERY_HIGH,
								[RISK_CONSEQUENCE]: riskLevels.VERY_HIGH,
								[TREATED_RISK_LIKELIHOOD]: likelihood ? riskLevels.VERY_HIGH : undefined,
								[TREATED_RISK_CONSEQUENCE]: consequence ? riskLevels.VERY_HIGH : undefined,
							},
						},
					};

					TicketSchema.processReadOnlyValues(undefined, newTicket, generateRandomString());
					const expectedOutput = {
						...newTicket,
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
					expectedOutput.properties[UPDATED_AT] = newTicket.properties[UPDATED_AT];
					expect(newTicket).toEqual(expectedOutput);
				});
			});

			describe.each([
				['likelihood is missing', false, true, true],
				['consequence is missing', true, false, true],
				['both are missing', false, false, false],
			])('(update ticket) ', (desc, likelihood, consequence, calculate) => {
				test(desc, () => {
					const { OWNER, CREATED_AT, UPDATED_AT } = basePropertyLabels;
					const oldTicket = {
						properties: {
							[OWNER]: generateRandomString(),
							[CREATED_AT]: generateRandomDate(),
						},
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: riskLevels.VERY_HIGH,
								[RISK_CONSEQUENCE]: riskLevels.VERY_HIGH,
								[TREATED_RISK_LIKELIHOOD]: riskLevels.VERY_HIGH,
								[TREATED_RISK_CONSEQUENCE]: riskLevels.VERY_HIGH,
							},
						},
					};

					const newTicket = {
						properties: {},
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: likelihood ? riskLevels.VERY_HIGH : undefined,
								[RISK_CONSEQUENCE]: consequence ? riskLevels.VERY_HIGH : undefined,
								[TREATED_RISK_LIKELIHOOD]: likelihood ? riskLevels.VERY_HIGH : undefined,
								[TREATED_RISK_CONSEQUENCE]: consequence ? riskLevels.VERY_HIGH : undefined,
							},
						},
					};

					TicketSchema.processReadOnlyValues(oldTicket, newTicket, generateRandomString());
					const expectedOutput = {
						properties: {},
						modules: {
							[presetModules.SAFETIBASE]: {
								...newTicket.modules[presetModules.SAFETIBASE],
								[LEVEL_OF_RISK]: calculate ? riskLevels.VERY_HIGH : undefined,
								[TREATED_LEVEL_OF_RISK]: calculate ? riskLevels.VERY_HIGH : undefined,
							},
						},
					};
					expectedOutput.properties[UPDATED_AT] = newTicket.properties[UPDATED_AT];
					expect(newTicket).toEqual(expectedOutput);
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
					const { OWNER, CREATED_AT, UPDATED_AT } = basePropertyLabels;
					const newTicket = {
						properties: {
							[OWNER]: generateRandomString(),
							[CREATED_AT]: generateRandomDate(),
						},
						modules: {
							[presetModules.SAFETIBASE]: {
								[RISK_LIKELIHOOD]: likelihood,
								[RISK_CONSEQUENCE]: consequence,
								[TREATED_RISK_LIKELIHOOD]: likelihood,
								[TREATED_RISK_CONSEQUENCE]: consequence,
							},
						},
					};
					TicketSchema.processReadOnlyValues(undefined, newTicket, generateRandomString());
					const expectedOutput = {
						...newTicket,
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
					expectedOutput.properties[UPDATED_AT] = newTicket.properties[UPDATED_AT];
					expect(newTicket).toEqual(expectedOutput);
				});
			});
		});
	});
};

const testDeserialiseUUIDsInTicket = () => {
	describe('Deserialise UUIDs in a ticket', () => {
		test('Should deserialise as expected', () => {
			const viewProp = generateRandomString();
			const numberProp = generateRandomString();
			const viewModProp = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					type: propTypes.VIEW,
					name: viewProp,
				},
				{
					type: propTypes.NUMBER,
					name: numberProp,
				},
				],
				modules: [
					{
						type: presetModules.SEQUENCING,
						properties: [{
							type: propTypes.VIEW,
							name: viewModProp,
						}],
					},
				],
			};

			const groupNames = Object.values(viewGroups);

			const generateStateObject = () => {
				const res = {};
				groupNames.forEach((groupName) => {
					res[groupName] = times(3, (i) => {
						let group = generateUUIDString();

						if (i === 0) {
							group = {
								objects: [{ _ids: times(3, generateUUIDString) }],
							};
						}
						return { group };
					});
				});

				return res;
			};

			const newTicket = {
				title: generateRandomString(),
				properties: {
					[viewProp]:
					{
						state: generateStateObject(),
					},
					[numberProp]: 1,
				},
				modules: {
					[presetModules.SEQUENCING]: {
						[viewModProp]: {
							state: generateStateObject(),
						},
					},
				},
			};

			const deserialisedTicket = TicketSchema.deserialiseUUIDsInTicket(newTicket, template);

			const expectedData = cloneDeep(newTicket);
			groupNames.forEach((groupName) => {
				/* eslint-disable no-param-reassign, no-underscore-dangle */
				[
					...expectedData.properties[viewProp].state[groupName],
					...expectedData.modules[presetModules.SEQUENCING][viewModProp].state[groupName],
				].forEach((groupEntry) => {
					if (isString(groupEntry.group)) {
						groupEntry.group = stringToUUID(groupEntry.group);
					} else {
						groupEntry.group.objects[0]._ids = groupEntry.group.objects[0]._ids.map(stringToUUID);
					}
				});

				/* eslint-enable no-param-reassign, no-underscore-dangle */
			});

			expect(deserialisedTicket).toEqual(expectedData);
		});
	});
};

const testSerialiseTicket = () => {
	describe('Serialise a ticket', () => {
		test('Should serialise dates as null correctly', () => {
			const dateName = generateRandomString();
			const template = {
				_id: generateUUID(),
				properties: [{
					type: propTypes.DATE,
					name: dateName,
				}],
				modules: [],
			};
			const ticket = {
				properties: {
					[dateName]: null,
				},
				modules: {},
			};

			expect(TicketSchema.serialiseTicket(ticket, template)).toEqual(ticket);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateTicket();
	testProcessReadOnlyValues();
	testDeserialiseUUIDsInTicket();
	testSerialiseTicket();
});
