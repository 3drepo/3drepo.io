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

const { getTeamspaceList } = require('../../utils');

const { aggregate, find, insertMany, dataTypes } = require(`${v5Path}/handler/db`);

const { Long } = dataTypes;

const { logger } = require(`${v5Path}/utils/logger`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);

const ticketCol = 'tickets';
const ticketCounterCol = 'tickets.counters';

const pipeline = [
	{ $group: {
		_id: {
			project: '$project',
			model: '$model',
			template: '$type',
		},
		number: { $max: '$number' },
	} },
];

const processTeamspace = async (teamspace) => {
	const [ticketNumbersByModelTickets, existingCounters] = await Promise.all([
		aggregate(teamspace, ticketCol, pipeline),
		find(teamspace, ticketCounterCol, {}, { _id: 1 }),
	]);

	const counters = new Set();
	existingCounters.forEach(({ _id }) => { counters.add(_id); });

	const docs = ticketNumbersByModelTickets.flatMap(({ _id: { project, model, template }, number }) => {
		const _id = [project, model, template].map(UUIDToString).join('_');

		if (counters.has(_id)) {
			return [];
		}

		return { _id, seq: Long.fromNumber(number) };
	});

	if (docs.length) {
		logger.logInfo(`\tInserting ${docs.length} counters...`);
		await insertMany(teamspace, ticketCounterCol, docs);
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
