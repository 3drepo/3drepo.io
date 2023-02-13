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

const { v5Path } = require('../../../interop');

const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { bulkWrite, find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processModel = async (teamspace, model) => {
	const stashDB = `${model}.stash.3drepo`;
	const superMeshes = await find(teamspace, stashDB, { type: 'mesh', vertices_count: { $exists: false } }, { m_map: 1 });

	if (superMeshes.length === 0) {
		return;
	}

	const meshUpdates = [];

	for (let i = 0; i < superMeshes.length; i++) {
		// eslint-disable-next-line camelcase
		const { _id, m_map } = superMeshes[i];
		const nVertices = m_map[m_map.length - 1].v_to;
		meshUpdates.push({
			updateOne: {
				filter: { _id },
				update: { $set: { vertices_count: nVertices } },
			},
		});
	}
	try {
		await bulkWrite(teamspace, stashDB, meshUpdates);
	} catch (err) {
		logger.logError(err);
	}
};

const processTeamspace = async (teamspace) => {
	const scenes = await getCollectionsEndsWith(teamspace, '.scene');
	for (const { name: scene } of scenes) {
		const model = scene.slice(0, -('.scene'.length));
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
