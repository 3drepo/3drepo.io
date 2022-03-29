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

const { find, findOne, updateMany } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processRevision = async (teamspace, model, revId) => {
	const { current } = await findOne(teamspace, `${model}.history`, { _id: revId }, { current: 1 });
	// eslint-disable-next-line no-await-in-loop
	await updateMany(
		teamspace,
		`${model}.scene`,
		{ _id: { $in: current }, rev_id: { $exists: false } },
		{ $set: { rev_id: revId } },
	);
};

const processModel = async (teamspace, model) => {
	const revs = await find(teamspace, `${model}.history`, { current: { $exists: true } }, { _id: 1 });
	for (let i = 0; i < revs.length; ++i) {
		const { _id } = revs[i];
		// eslint-disable-next-line no-await-in-loop
		await processRevision(teamspace, model, _id);
	}

	await updateMany(teamspace, `${model}.history`, {}, { $unset: { current: 1 } });
};

const processTeamspace = async (teamspace) => {
	const histories = await getCollectionsEndsWith(teamspace, '.history');
	for (let i = 0; i < histories.length; ++i) {
		const model = histories[i].name.slice(0, -('.history'.length));
		logger.logInfo(`\t\t\t${model}`);
		// eslint-disable-next-line no-await-in-loop
		await processModel(teamspace, model);
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
