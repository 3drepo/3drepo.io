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

const { aggregate } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processModel = (teamspace, scene) =>
	aggregate(
		teamspace, scene, [
		// filter for all metasdata that has not been converted
			{ $match: { type: 'meta', 'metadata.key': { $exists: false } } },
			// convert metadata: { key: value } to metadata: [ {k: <key>, v: <value> }]
			{ $project: { _id: 1, metadata: { $objectToArray: '$metadata' } } },
			// rename k to key and v to value
			{
				$addFields: {
					metadata: {
						$map: {
							input: '$metadata',
							as: 'metadata',
							in: {
								key: '$$metadata.k',
								value: '$$metadata.v',
							},
						},
					},
				},
			},
			// update
			{
				$merge: scene,
			},
		],
	);

const processTeamspace = async (teamspace) => {
	const scenes = await getCollectionsEndsWith(teamspace, '.scene');
	for (const { name } of scenes) {
		logger.logInfo(`\t\t\t${name}`);
		// eslint-disable-next-line no-await-in-loop
		await processModel(teamspace, name);
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
