/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { UUIDToString, generateUUIDString } = require('../../../utils/helper/uuids');
const { completeTestRun, createTestRun, getTestRunByQuery } = require('../../../models/clashes.runs');
const { createPlan, deletePlan, updatePlan } = require('../../../models/clashes.plans');
const { getExternalIdsFromMetadata, getMeshesWithParentIds } = require('./models/commons/scenes');
const { getFileAsStream, storeFile } = require('../../../services/filesManager');
const { PassThrough } = require('stream');
const { SELF_INTERSECTIONS_CHECK_OPTIONS } = require('../../../models/clashes.constants');
const { createConstantsObject } = require('../../../utils/helper/objects');
const { createReadStream } = require('fs');
const { getAllMetadata } = require('./models/commons/metadata');
const { getMetadataByRules } = require('../../../models/metadata');
const { getNodesByQuery } = require('../../../models/scenes');
const { queueClashRun } = require('../../../services/modelProcessing');

const RUN_HISTORY_COL = 'clashes.runs.history';
const Clashes = {};

Clashes.createPlan = createPlan;

Clashes.updatePlan = updatePlan;

Clashes.deletePlan = deletePlan;

const constructCompositeObject = (container, { meshes = [], unwantedMeshIds = [], metadata = [] }) => {
	const compositesToMeshes = {};

	if (meshes.length) {
		const metadataMapping = metadata.reduce((acc, { parents, ...entry }) => {
			for (const parent of parents) {
				acc[UUIDToString(parent)] = entry;
			}
			return acc;
		}, {});

		const unwantedIdsObj = createConstantsObject(unwantedMeshIds.map((id) => id));

		for (const mesh of meshes) {
			const idStr = UUIDToString(mesh._id);

			if (!unwantedIdsObj[idStr]) {
				const parentId = UUIDToString(mesh.name ? mesh._id : mesh.parents[0]);
				const meshMeta = metadataMapping[parentId];
				const externalIds = meshMeta ? getExternalIdsFromMetadata([meshMeta]) : null;
				const compositePath = `${container}::${externalIds?.key ?? 'internal'}::${externalIds?.values[0] ?? parentId}`;

				if (compositesToMeshes[compositePath]) {
					compositesToMeshes[compositePath].push(idStr);
				} else {
					compositesToMeshes[compositePath] = [idStr];
				}
			}
		}
	}

	return compositesToMeshes;
};

const getMeshDataFromRules = async (teamspace, project, container, revision, rules) => {
	const { matched, unwanted } = await getMetadataByRules(teamspace, project, container,
		revision, rules, { _id: 1, parents: 1, metadata: 1 });
	const matchedTransNodes = matched.flatMap(({ parents }) => parents);
	const meshes = matched.length
		? await getNodesByQuery(teamspace, project, container, { type: 'mesh', rev_id: revision, parents: { $in: matchedTransNodes } }, { _id: 1, name: 1, parents: 1 })
		: [];
	const unwantedMeshIds = unwanted.length
		? await getMeshesWithParentIds(teamspace, project, container, revision,
			unwanted.flatMap(({ parents }) => parents), true)
		: [];

	return { meshes, unwantedMeshIds, metadata: matched };
};

const getAllMeshData = async (teamspace, project, container, revision) => {
	const meshes = await getNodesByQuery(teamspace, project, container, { type: 'mesh', rev_id: revision }, { _id: 1, parents: 1, name: 1 });
	const metadata = await getAllMetadata(teamspace, container, revision);
	return { meshes, metadata };
};

const writeConfigSetEntry = async (teamspace, project, selection, stream, setName) => {
	const { container, revision, rules = [] } = selection;

	const meshData = rules.length
		? await getMeshDataFromRules(teamspace, project, container, revision, rules)
		: await getAllMeshData(teamspace, project, container, revision);
	const compositesToMeshes = constructCompositeObject(container, meshData);

	stream.write(`"${setName}":[{"teamspace":${JSON.stringify(teamspace)},"container":${JSON.stringify(container)},"revision":${JSON.stringify(UUIDToString(revision))},"objects":[`);

	let first = true;
	for (const [parentIdStr, meshIds] of Object.entries(compositesToMeshes)) {
		if (!first) {
			stream.write(',');
		}

		stream.write(JSON.stringify({ id: parentIdStr, meshIds }));
		first = false;
	}

	stream.write(']}]');
};

Clashes.createRun = async (teamspace, project, plan, user) => {
	const runId = await createTestRun(teamspace, plan, user);

	const configStream = new PassThrough();
	configStream.write('{');
	configStream.write(`"type":${JSON.stringify(plan.type)},`);
	configStream.write(`"tolerance":${JSON.stringify(plan.tolerance)},`);
	configStream.write(`"selfIntersectsA":${JSON.stringify(plan.selfIntersectionsCheck === true || plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[0])},`);
	configStream.write(`"selfIntersectsB":${JSON.stringify(plan.selfIntersectionsCheck === true || plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[1])},`);
	await writeConfigSetEntry(teamspace, project, plan.selectionA, configStream, 'setA');
	configStream.write(',');
	await writeConfigSetEntry(teamspace, project, plan.selectionB, configStream, 'setB');
	configStream.end('}');

	await queueClashRun(teamspace, project, UUIDToString(runId), configStream);
	return runId;
};

const streamToJSON = (stream) => new Promise((resolve, reject) => {
	let data = '';

	stream.on('data', (chunk) => {
		data += chunk;
	});

	stream.on('end', () => {
		try {
			resolve(JSON.parse(data));
		} catch (err) {
			reject(err);
		}
	});

	stream.on('error', reject);
});

const compareRunResults = (existingRunClashes, newRunClashes) => {
	const existingMap = new Map(existingRunClashes.map((item) => [item.index, item]));
	const newMap = new Map(newRunClashes.map((item) => [[item.a, item.b].sort().join('-'), item]));

	const result = { new: [], active: [], resolved: [] };

	for (const [key, newItem] of newMap) {
		const clashToAdd = {
			...newItem,
			a: { container: newItem.a.split('::')[0], idType: newItem.a.split('::')[1], id: newItem.a.split('::')[2] },
			b: { container: newItem.b.split('::')[0], idType: newItem.b.split('::')[1], id: newItem.b.split('::')[2] },
			index: key,
		};

		if (existingMap.has(key)) {
			result.active.push(clashToAdd);
		} else {
			result.new.push(clashToAdd);
		}
	}

	for (const [key, existingItem] of existingMap) {
		if (!newMap.has(key)) {
			result.resolved.push(existingItem);
		}
	}

	return result;
};

Clashes.completeRun = async (teamspace, project, corId, resPath) => {
	const resStream = createReadStream(resPath, { encoding: 'utf8' });
	const content = await streamToJSON(resStream);

	let lastRunClashes;

	try {
		const { plan } = await getTestRunByQuery(teamspace, { _id: corId }, { plan: 1, triggeredAt: 1 });
		const { result } = await getTestRunByQuery(teamspace,
			{ 'plan._id': plan._id, completedAt: { $exists: true } },
			{ result: 1 }, { completedAt: -1 },
		);

		const { readStream } = await getFileAsStream(teamspace, RUN_HISTORY_COL, result);
		const { new: newClashes, active, resolved } = await streamToJSON(readStream);
		lastRunClashes = [...newClashes, ...active, ...resolved];
	} catch (err) {
		lastRunClashes = [];
	}

	const categorizedClashes = compareRunResults(lastRunClashes, content.clashes);

	const resultId = generateUUIDString();
	await storeFile(teamspace, RUN_HISTORY_COL, resultId, Buffer.from(JSON.stringify(categorizedClashes)));
	await completeTestRun(teamspace, corId, resultId);
};

module.exports = Clashes;
