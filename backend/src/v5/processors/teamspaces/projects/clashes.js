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

const writeObjects = (container, stream, { meshes = [], unwantedMeshIds = [], metadata = [] }) => {
	const metadataMapping = metadata.reduce((acc, { parents, ...entry }) => {
		for (const parent of parents) {
			acc[UUIDToString(parent)] = entry;
		}
		return acc;
	}, {});

	const unwantedIdsObj = createConstantsObject(unwantedMeshIds.map((id) => id));
	const compositesToMeshes = {};

	for (const mesh of meshes) {
		const idStr = UUIDToString(mesh._id);

		if (!unwantedIdsObj[idStr]) {
			const parentId = UUIDToString(mesh.name ? mesh._id : mesh.parents[0]);
			const meshMeta = metadataMapping[parentId];
			const externalIds = getExternalIdsFromMetadata([meshMeta], undefined, true);
			const externalKeyValuePair = externalIds ? externalIds.values[0] : undefined;
			const externalIdKey = `${container}__${externalKeyValuePair?.key ?? 'internal'}__${externalKeyValuePair?.value ?? parentId}`;

			if (compositesToMeshes[externalIdKey]) {
				compositesToMeshes[externalIdKey].push(idStr);
			} else {
				compositesToMeshes[externalIdKey] = [idStr];
			}
		}
	}

	let first = true;
	for (const [parentIdStr, meshIds] of Object.entries(compositesToMeshes)) {
		if (!first) {
			stream.write(',');
		}

		stream.write(JSON.stringify({ id: parentIdStr, meshIds }));
		first = false;
	}
};

const getObjectsFromRules = async (teamspace, project, container, revision, rules) => {
	const { matched, unwanted } = await getMetadataByRules(teamspace, project, container,
		revision, rules, { _id: 1, parents: 1, metadata: 1 });
	const matchedTransNodes = matched.flatMap(({ parents }) => parents);
	const meshes = matched.length
		? await getNodesByQuery(teamspace, project, container, { type: 'mesh', rev_id: revision, parents: { $in: matchedTransNodes } }, { _id: 1, parents: 1 })
		: {};
	const unwantedMeshIds = unwanted.length
		? await getMeshesWithParentIds(teamspace, project, container, revision,
			unwanted.flatMap(({ parents }) => parents), true)
		: [];

	return { meshes, unwantedMeshIds, metadata: matched };
};

const getAllObjects = async (teamspace, project, container, revision) => {
	const meshes = await getNodesByQuery(teamspace, project, container, { type: 'mesh', rev_id: revision }, { _id: 1, parents: 1, name: 1, shared_id: 1 });
	const metadata = await getAllMetadata(teamspace, container, revision);

	return { meshes, metadata };
};

const getConfigSetEntry = async (teamspace, project, selection, stream, setName) => {
	const { container, revision, rules = [] } = selection;

	stream.write(`"${setName}":[{"teamspace":${JSON.stringify(teamspace)},"container":${JSON.stringify(container)},"revision":${JSON.stringify(UUIDToString(revision))},"objects":[`);

	let data = {};

	if (rules.length) {
		data = await getObjectsFromRules(teamspace, project, container, revision, rules);
	} else {
		data = await getAllObjects(teamspace, project, container, revision);
	}

	writeObjects(container, stream, data);

	stream.write(']}]');
};

Clashes.createRun = async (teamspace, project, plan, user) => {
	const runId = await createTestRun(teamspace, plan, user);

	const stream = new PassThrough();
	stream.write('{');
	stream.write(`"type":${JSON.stringify(plan.type)},`);
	stream.write(`"tolerance":${JSON.stringify(plan.tolerance)},`);
	stream.write(`"selfIntersectsA":${JSON.stringify(plan.selfIntersectionsCheck === true || plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[0])},`);
	stream.write(`"selfIntersectsB":${JSON.stringify(plan.selfIntersectionsCheck === true || plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[1])},`);
	await getConfigSetEntry(teamspace, project, plan.selectionA, stream, 'setA');
	stream.write(',');
	await getConfigSetEntry(teamspace, project, plan.selectionB, stream, 'setB');
	stream.end('}');

	await queueClashRun(teamspace, project, UUIDToString(runId), stream);
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
	// this treats clashes the same if their a and b are the same, regardless of order
	const makeKey = (item) => [item.a, item.b].sort().join('-');

	const existingMap = new Map(existingRunClashes.map((item) => [makeKey(item), item]));
	const newMap = new Map(newRunClashes.map((item) => [makeKey(item), item]));

	const result = { new: [], active: [], resolved: [] };

	for (const [key, newItem] of newMap) {
		if (existingMap.has(key)) {
			result.active.push(newItem);
		} else {
			result.new.push(newItem);
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
	const readStream = createReadStream(resPath, { encoding: 'utf8' });
	const content = await streamToJSON(readStream);

	let lastRunClashes;
	let plan;

	try {
		const currentRun = await getTestRunByQuery(teamspace, { _id: corId }, { plan: 1, triggeredAt: 1 });
		plan = currentRun.plan;

		const lastRun = await getTestRunByQuery(teamspace,
			{ 'plan._id': plan._id, completedAt: { $exists: true } },
			{ result: 1 }, { completedAt: -1 },
		);

		const lastCompleteRunFile = await getFileAsStream(teamspace, RUN_HISTORY_COL, lastRun.result);
		const { new: newClashes, active, resolved } = await streamToJSON(lastCompleteRunFile.readStream);
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
