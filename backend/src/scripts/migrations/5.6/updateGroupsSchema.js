/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { v5Path } = require('../../../interop');
const { bulkWrite } = require('../../../v5/handler/db');
const { castSchema } = require('../../../v5/schemas/rules');

const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const OPERATOR_SYMBOL = {
	IS: ':',
	IS_NOT: ': !',
	CONTAINS: ': *',
	NOT_CONTAINS: ': ! *',
	REGEX: ':',
	EQUALS: '=',
	NOT_EQUALS: '= !',
	GT: '>',
	GTE: '>=',
	LT: '<',
	LTE: '<=',
	IN_RANGE: '',
	NOT_IN_RANGE: '!',
};

const OPERATIONS_TYPES = {
	IS_NOT_EMPTY: 'field',
	IS_EMPTY: 'field',
	IS: 'text',
	IS_NOT: 'text',
	CONTAINS: 'text',
	NOT_CONTAINS: 'text',
	REGEX: 'regex',
	EQUALS: 'number',
	NOT_EQUALS: 'number',
	GT: 'numberComparison',
	GTE: 'numberComparison',
	LT: 'numberComparison',
	LTE: 'numberComparison',
	IN_RANGE: 'numberRange',
	NOT_IN_RANGE: 'numberRange',
};

const formatValues = (operatorType, values) => {
	if (operatorType === 'regex') return `/ ${values} /`;
	if (operatorType === 'numberRange') return `[ ${values.join(' : ')} ]`;
	return values ? values.join(', ') : '';
};

const generateRuleName = ({ field, operator, values }) => {
	const operatorType = OPERATIONS_TYPES[operator];
	if (operatorType === 'field') return operator === 'IS_EMPTY' ? `! ${field}` : field;

	const formattedValues = formatValues(operatorType, values);
	return `${field} ${OPERATOR_SYMBOL[operator]} ${formattedValues}`;
};

const processCollection = async (teamspace, collection) => {
	const query = {
		rules: {
			$exists: true,
			$elemMatch: {
				field: { $type: 'string' },
			},
		},
	};
	const projection = { rules: 1 };

	const groupUpdates = [];
	const groups = await find(teamspace, collection, query, projection);

	groups.forEach((group) => {
		const formattedRules = group.rules.map((rule) => {
			return { name: rule.name || generateRuleName(rule), ...castSchema(rule) };
		});

		groupUpdates.push({
			updateOne: {
				filter: { _id: group._id },
				update: { $set: { rules: formattedRules } },
			},
		});
	});

	if (groupUpdates.length) {
		try {
			await bulkWrite(teamspace, collection, groupUpdates);
		} catch (err) {
			logger.logError(err);
		}
	}
};

const processTeamspace = async (teamspace) => {
	const collections = await getCollectionsEndsWith(teamspace, '.groups');

	for (let i = 0; i < collections.length; ++i) {
		const { name: colName } = collections[i];
		logger.logInfo(`\t-[${teamspace}]${colName} (${i + 1}/${collections.length})`);
		// eslint-disable-next-line no-await-in-loop
		await processCollection(teamspace, colName);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace);
	}
};

module.exports = run;
