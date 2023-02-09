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

const { UUIDToString, stringToUUID } = require(`${v5Path}/utils/helper/uuids`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { bulkWrite, count, find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processModel = async (teamspace, model) => {
	const unmigratedMeshesCount = await count(teamspace, `${model}.scene`, { type: 'mesh', vertices_count: { $exists: false } });

	if (unmigratedMeshesCount === 0) {
		return;
	}

	const stashDB = `${model}.stash.3drepo`;
	const superMeshes = await find(teamspace, stashDB, { type: 'mesh' }, { m_map: 1 });

	const spanningMeshVerticesCounts = [];
	const meshUpdates = [];

	for (let i = 0; i < superMeshes.length; i++) {
		// eslint-disable-next-line camelcase
		const { m_map } = superMeshes[i];
		if (m_map.length > 1) {
			// eslint-disable-next-line camelcase
			for (let j = 0; j < m_map.length; j++) {
				// eslint-disable-next-line camelcase
				const { map_id, v_from, v_to } = m_map[j];
				// eslint-disable-next-line camelcase
				const verticesCount = v_to - v_from;
				meshUpdates.push({
					updateOne: {
						filter: { _id: map_id },
						update: { $set: { vertices_count: verticesCount } },
					},
				});
			}
		} else if (m_map.length === 1) {
			const idString = UUIDToString(m_map[0].map_id);
			const verticesCount = m_map[0].v_to - m_map[0].v_from;
			spanningMeshVerticesCounts[idString] = (
				spanningMeshVerticesCounts[idString] || 0
			) + verticesCount;
		}
	}

	// eslint-disable-next-line camelcase
	const singularMeshUpdates = Object.keys(spanningMeshVerticesCounts).map((map_id) => ({
		updateOne: {
			filter: { _id: stringToUUID(map_id) },
			update: { $set: { vertices_count: spanningMeshVerticesCounts[map_id] } },
		},
	}));

	try {
		await bulkWrite(teamspace, `${model}.scene`, [...meshUpdates, ...singularMeshUpdates]);
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
