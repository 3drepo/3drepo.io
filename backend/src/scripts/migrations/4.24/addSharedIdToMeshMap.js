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

const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../utils');

const { find, updateOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processModel = async (teamspace, model) => {
	const meshes = await find(teamspace, `${model}.scene`, { type: 'mesh' }, { shared_id: 1 });
	const stashDB = `${model}.stash.3drepo`;
	const superMeshesProm = find(teamspace, stashDB, { type: 'mesh' }, { m_map: 1 });

	const meshToSharedId = {};
	// eslint-disable-next-line camelcase
	meshes.forEach(({ _id, shared_id }) => {
		// eslint-disable-next-line camelcase
		meshToSharedId[UUIDToString(_id)] = shared_id;
	});

	const superMeshes = await superMeshesProm;

	// eslint-disable-next-line camelcase
	const proms = superMeshes.map(({ _id, m_map }) => {
		if (m_map.length && !m_map[0].shared_id) {
			const updatedMmap = m_map.map((entry) =>
				({
					...entry,
					shared_id: meshToSharedId[UUIDToString(entry.map_id)],
				}));

			return updateOne(teamspace, stashDB, { _id }, { $set: { m_map: updatedMmap } });
		}
		return Promise.resolve();
	});
	return Promise.all(proms);
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
