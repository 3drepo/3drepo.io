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

const { find, updateOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processModel = async (teamspace, model) => {
	const stashDB = `${model}.stash.3drepo`;
	const superMeshesProm = find(teamspace, stashDB, { type: 'mesh' }, { m_map: 1 });

	const superMeshes = await superMeshesProm;

	const spanningMeshVerticesCounts = [];
	let meshUpdates = [];

	// eslint-disable-next-line camelcase
	superMeshes.forEach(({ m_map }) => {
		if (m_map.length > 1) {
			// eslint-disable-next-line camelcase
			meshUpdates = meshUpdates.concat(m_map.map(({ map_id, v_from, v_to }) => {
				// eslint-disable-next-line camelcase
				const verticesCount = v_to - v_from;
				return updateOne(
					teamspace,
					`${model}.scene`,
					{ _id: map_id },
					{ $set: { vertices_count: verticesCount } },
				);
			}));
		} else if (m_map.length === 1) {
			const verticesCount = m_map[0].v_to - m_map[0].v_from;
			spanningMeshVerticesCounts[UUIDToString(m_map[0].map_id)] = (
				spanningMeshVerticesCounts[UUIDToString(m_map[0].map_id)] || 0
			) + verticesCount;
		}
	});

	// eslint-disable-next-line camelcase
	meshUpdates = meshUpdates.concat(Object.keys(spanningMeshVerticesCounts).map((map_id) => updateOne(
		teamspace,
		`${model}.scene`,
		{ _id: stringToUUID(map_id) },
		{ $set: { vertices_count: spanningMeshVerticesCounts[map_id] } },
	)));

	return Promise.all(meshUpdates);
};

const processTeamspace = async (teamspace) => {
	const scenes = await getCollectionsEndsWith(teamspace, '.scene');
	for (const { name: scene } of scenes) {
		const model = scene.slice(0, -('.scene'.length));
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
