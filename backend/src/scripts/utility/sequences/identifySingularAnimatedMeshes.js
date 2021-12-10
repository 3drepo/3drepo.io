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

/**
 * This script is used to identify meshes within SPM files, which does not share resource ID with any other meshes and have
 * transformation instructions (i.e, they are animated in the sequence.
 */
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getLatestRevision } = require(`${v5Path}/models/revisions`);
const { find } = require(`${v5Path}/handler/db`);
const { stringToUUID, UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const FS = require('fs');

const findLatestRevId = async (teamspace, modelId) => {
	const { _id } = await getLatestRevision(teamspace, modelId, { _id: 1 });
	return _id;
};

const findSingledOutMeshIds = async (teamspace, modelId, revId) => {
	const res = await find(teamspace, `${modelId}.stash.3drepo`,
		{
			rev_id: revId,
			type: 'mesh',
			m_map: { $size: 1 },
			name: 'grouped',
		},
		{ 'm_map.map_id': 1 });
	// eslint-disable-next-line camelcase
	return res.map(({ m_map }) => m_map[0].map_id);
};

const getMeshInfo = async (teamspace, modelId, meshes) => {
	const res = await find(teamspace, `${modelId}.scene`,
		{
			_id: { $in: meshes },
		},
		{ name: 1, shared_id: 1 });
	return res.map(({ _id, name, shared_id: sharedId }) => ({ _id: UUIDToString(_id), name, sharedId }));
};

const getMeshMeta = async (teamspace, modelId, sharedIds) => {
	const res = await find(teamspace, `${modelId}.scene`,
		{
			parents: { $in: sharedIds },
			type: 'meta',
		},
		{ parents: 1, 'metadata.Resource ID': 1 });
	const lut = {};
	sharedIds.forEach((id) => { lut[UUIDToString(id)] = {}; });

	res.forEach((entry) => {
		const resourceId = entry?.metadata['Resource ID'];
		entry.parents.forEach((parent) => {
			const parentStr = UUIDToString(parent);
			if (lut[parentStr]) {
				lut[parentStr] = resourceId;
			}
		});
	});

	return lut;
};

const writeResultsToFile = (meshInfo, sharedIdToResourceId) => new Promise((resolve) => {
	const outFile = 'singleAnimatedMeshes.csv';
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('3drepo ID,Name,Resource ID\n');
	meshInfo.forEach(({ _id, name, sharedId }) => {
		const sharedIdStr = UUIDToString(sharedId);
		const resourceId = sharedIdToResourceId[sharedIdStr];
		writeStream.write(`${_id},${name},${resourceId}\n`);
	});

	writeStream.end(resolve);
});

const run = async () => {
	const teamspace = process.argv[2];
	const modelId = process.argv[3];
	const revId = stringToUUID(process.argv[4]) || await findLatestRevId(teamspace, modelId);

	logger.logInfo(`Finding meshes in ${teamspace}.${modelId} rev: ${UUIDToString(revId)}`);

	const meshes = await findSingledOutMeshIds(teamspace, modelId, revId);
	logger.logInfo(`Number of singled animated meshes: ${meshes.length}`);
	const meshInfo = await getMeshInfo(teamspace, modelId, meshes);
	logger.logInfo(`Mesh info length: ${meshInfo.length}`);
	const sharedIdToResourceId = await getMeshMeta(teamspace, modelId, meshInfo.map(({ sharedId }) => sharedId));

	await writeResultsToFile(meshInfo, sharedIdToResourceId);
};

if (process.argv.length < 4) {
	logger.logError('Not enough arguments. (<teamspace> <model id> [revision id])');
} else {
	// eslint-disable-next-line no-console
	run().catch(console.log).finally(process.exit);
}
