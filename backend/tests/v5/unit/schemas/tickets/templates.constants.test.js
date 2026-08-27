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
const { determineTestGroup } = require('../../../helper/utils');
const { cloneDeep } = require('lodash');
const { src } = require('../../../helper/path');
const { generateCustomStatusValues, outOfOrderArrayEqual } = require('../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
const TemplateConstants = require(`${src}/schemas/tickets/templates.constants`);

const baseProps = TemplateConstants.basePropertyLabels;

const testGetApplicableDefaultProperties = () => {
	describe('Get applicable default properties', () => {
		const statusValues = generateCustomStatusValues();
		const customStatus = { values: statusValues, default: statusValues[0].name };

		const basicProp = [{ name: baseProps.DESCRIPTION, type: TemplateConstants.propTypes.LONG_TEXT },
			{ name: baseProps.OWNER, type: TemplateConstants.propTypes.TEXT, readOnly: true },
			{ name: baseProps.CREATED_AT, type: TemplateConstants.propTypes.PAST_DATE, readOnly: true },
			{ name: baseProps.UPDATED_AT, type: TemplateConstants.propTypes.DATE, readOnly: true },
			{ name: baseProps.STATUS, type: TemplateConstants.propTypes.ONE_OF, values: ['Open', 'In Progress', 'For Approval', 'Closed', 'Void'], default: 'Open' }];

		const issueProp = [{ name: baseProps.PRIORITY, type: TemplateConstants.propTypes.ONE_OF, values: ['None', 'Low', 'Medium', 'High'], default: 'None' },
			{
				name: baseProps.ASSIGNEES,
				type: TemplateConstants.propTypes.MANY_OF,
				values: TemplateConstants.presetEnumValues.JOBS_AND_USERS,
			},
			{ name: baseProps.DUE_DATE, type: TemplateConstants.propTypes.DATE }];

		test('Should only return the basic properties if none of the optional flags are configured', () => {
			const results = TemplateConstants.getApplicableDefaultProperties({});
			outOfOrderArrayEqual(results, basicProp);
		});

		test('Should not set Created at to be read only if isImport is set to true', () => {
			const results = TemplateConstants.getApplicableDefaultProperties({}, true);
			outOfOrderArrayEqual(results, basicProp.map((prop) => {
				const res = { ...prop };
				if (res.name === baseProps.CREATED_AT) {
					delete res.readOnly;
				}
				return res;
			}));
		});

		test('Should return the basic properties with custom status if config has a status defined', () => {
			const customStatusProps = cloneDeep(basicProp);
			const statusProp = customStatusProps.find((p) => p.name === baseProps.STATUS);
			statusProp.values = statusValues.map((v) => v.name);
			statusProp.default = customStatus.default;

			outOfOrderArrayEqual(TemplateConstants.getApplicableDefaultProperties({ status: customStatus }),
				customStatusProps);
		});

		test('Should return the basic and issue properties if issueProperties is set to true', () => {
			outOfOrderArrayEqual(TemplateConstants.getApplicableDefaultProperties({ issueProperties: true }),
				[...basicProp, ...issueProp]);
		});

		test('Should return the basic, issue and pin properties if issueProperties  and pin is set to true', () => {
			outOfOrderArrayEqual(TemplateConstants.getApplicableDefaultProperties({ issueProperties: true, pin: true }),
				[...basicProp, ...issueProp, { name: baseProps.PIN, type: TemplateConstants.propTypes.COORDS }]);
		});
	});
};

const testgetDefaultPinIconNames = () => {
	describe('Get default pin icons details', () => {
		const toFsEntry = (name, isFile = true) => ({ name, isFile: jest.fn().mockReturnValue(isFile) });

		const tests = [
			['the correct icon details', [toFsEntry('icon1.normal.svg'), toFsEntry('icon1.selected.svg')], true, ['icon1']],
			['throw if the icon is not a file', [toFsEntry('icon1.normal.svg', false), toFsEntry('icon1.selected.svg')], false, templates.pinIconNotFound],
			['throw if the icon filename extension does not match the expected pattern', [toFsEntry('icon1.normal.jpg'), toFsEntry('icon1.selected.svg')], false, templates.pinIconNotFound],
			['throw if the icon filename name does not match the expected pattern', [toFsEntry('icon1.supernatural.svg'), toFsEntry('icon1.selected.svg')], false, templates.pinIconNotFound],
		];

		const runTest = (testName, mockReturnValue, shouldSucceed, expected) => {
			test(`Should ${shouldSucceed ? 'return' : 'throw'} ${testName}`, () => {
				// drop the cached module so the memoised pin-icon cache starts empty
				jest.resetModules();

				jest.doMock('fs', () => {
					const actualFs = jest.requireActual('fs');
					return {
						...actualFs,
						readdirSync: jest.fn((dirPath, options) => {
							if (String(dirPath).endsWith('/tickets/pinIcons')) {
								return mockReturnValue;
							}
							return actualFs.readdirSync(dirPath, options);
						}),
					};
				});

				if (shouldSucceed) {
					// eslint-disable-next-line global-require
					const Constants = require(`${src}/schemas/tickets/templates.constants`);
					expect(Constants.getDefaultPinIconNames).toEqual(expected);
				} else {
					expect(() => {
						// eslint-disable-next-line global-require
						require(`${src}/schemas/tickets/templates.constants`);
					}).toThrow(expected);
				}
			});
		};

		tests.forEach((
			[testName, mockReturnValue, shouldSucceed, expected],
		) => runTest(testName, mockReturnValue, shouldSucceed, expected));
	});
};

describe(determineTestGroup(__filename), () => {
	testGetApplicableDefaultProperties();
	testgetDefaultPinIconNames();
});
