/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const { getTeamspaceList, getCollectionsEndsWith } = require('../utils');

const { find, updateMany } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processModel = async (teamspace, model) => {
	const revs = await find(teamspace, `${model}.history`, { current: { $exists: true } }, { current: 1 });
	const proms = revs.map(({ _id, current = [] }) =>
		(current.length ? updateMany(
			teamspace,
			`${model}.scene`,
			{ _id: { $in: current } },
			{ $set: { rev_id: _id } },
		) : Promise.resolve()));
	return Promise.all(proms);
};

const processTeamspace = async (teamspace) => {
	const histories = await getCollectionsEndsWith(teamspace, '.history');
	for (let i = 0; i < histories.length; ++i) {
		const model = histories[i].name.slice(0, -('.history'.length));
		logger.logInfo(`\t\t\t${model}`);
		// eslint-disable-next-line no-await-in-loop
		await processModel(teamspace, model);
		// eslint-disable-next-line no-await-in-loop
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspaces[i]);
	}
};

module.exports = run;
