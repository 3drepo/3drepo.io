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

const TemplateConstants = require(`${src}/schemas/tickets/templates.constants`);

const testGetApplicableDefaultProperties = () => {
	describe('Get applicable default properties', () => {
		const basicProp = [{ name: 'Description', type: TemplateConstants.propTypes.LONG_TEXT },
			{ name: 'Owner', type: TemplateConstants.propTypes.TEXT, readOnly: true },
			{ name: 'Created at', type: TemplateConstants.propTypes.DATE, readOnly: true },
			{ name: 'Updated at', type: TemplateConstants.propTypes.DATE, readOnly: true }];

		const issueProp = [{ name: 'Priority', type: TemplateConstants.propTypes.ONE_OF, values: ['None', 'Low', 'Medium', 'High'], default: 'None' },
			{ name: 'Status', type: TemplateConstants.propTypes.ONE_OF, values: ['Open', 'In Progress', 'For Approval', 'Closed', 'Void'], default: 'Open' },
			{ name: 'Assignees', type: TemplateConstants.propTypes.MANY_OF, values: TemplateConstants.presetEnumValues.JOBS_AND_USERS },
			{ name: 'Due Date', type: TemplateConstants.propTypes.DATE }];
		test('Should only return the basic properties if none of the optional flags are configured', () => {
			expect(TemplateConstants.getApplicableDefaultProperties({})).toEqual(basicProp);
		});

		test('Should return the basic and issue properties if issueProperties is set to true', () => {
			expect(TemplateConstants.getApplicableDefaultProperties({ issueProperties: true }))
				.toEqual([...basicProp, ...issueProp]);
		});

		test('Should return the basic, issue and pin properties if issueProperties  and pin is set to true', () => {
			expect(TemplateConstants.getApplicableDefaultProperties({ issueProperties: true, pin: true }))
				.toEqual([...basicProp, ...issueProp, { name: 'Pin', type: TemplateConstants.propTypes.COORDS }]);
		});
	});
};

describe('schema/tickets/templates', () => {
	testGetApplicableDefaultProperties();
});
