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

const { cloneDeep } = require('lodash');
const { src } = require('../../../helper/path');
const { generateCustomStatusValues, outOfOrderArrayEqual } = require('../../../helper/services');

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
			{ name: baseProps.ASSIGNEES,
				type: TemplateConstants.propTypes.MANY_OF,
				values: TemplateConstants.presetEnumValues.ROLES_AND_USERS },
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

describe('schema/tickets/templates', () => {
	testGetApplicableDefaultProperties();
});
