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

const { createPlan, deletePlan, updatePlan } = require('../../../models/clashes.plans');
const { PassThrough } = require('stream');
const { SELF_INTERSECTIONS_CHECK_OPTIONS } = require('../../../models/clashes.constants');
const { UUIDToString, generateUUID } = require('../../../utils/helper/uuids');
const { createConstantsObject } = require('../../../utils/helper/objects');
const { completeTestRun, createTestRun, getLastRunFromPlan, getTestRunByQuery } = require('../../../models/clashes.runs');
const { getMeshesWithParentIds } = require('./models/commons/scenes');
const { getMetadataByRules } = require('../../../models/metadata');
const { queueClashRun } = require('../../../services/modelProcessing');
const { createReadStream } = require('fs');
const { getFileAsStream, storeFile } = require('../../../services/filesManager');
const { getNodesByQuery } = require('../../../models/scenes');

const RUN_HISTORY_COL = 'clashes.runs.history';
const Clashes = {};

Clashes.createPlan = createPlan;

Clashes.updatePlan = updatePlan;

Clashes.deletePlan = deletePlan;

const writeMeshesFromMeta = async (teamspace, project, container, revision, matchedMeta, unwantedMeta, stream) => {
	const [groupedMatchedMeshes, unwantedMeshes] = await Promise.all([
		matchedMeta.length ? getMeshesWithParentIds(teamspace, project, container, revision,
			matchedMeta.flatMap(({ parents }) => parents), { groupByParent: true }) : Promise.resolve({}),
		unwantedMeta.length ? getMeshesWithParentIds(teamspace, project, container, revision,
			unwantedMeta.flatMap(({ parents }) => parents)) : Promise.resolve([]),
	]);

	const unwantedIdsObj = createConstantsObject(unwantedMeshes.map((id) => id));

	let first = true;
	for (const id of Object.keys(groupedMatchedMeshes)) {
		const meshes = groupedMatchedMeshes[id];
		const meshIds = meshes.filter((meshId) => !unwantedIdsObj[meshId]);

		if (meshIds.length) {
			if (!first) {
				stream.write(',');
			}

			stream.write(JSON.stringify({ id, meshIds }));
			first = false;
		}
	}
};

const writeAllMeshes = async (teamspace, project, container, revision, stream) => {
	const allMeshes = await getNodesByQuery(teamspace, project, container, { type: 'mesh', rev_id: revision }, { _id: 1 });

	let first = true;
	for (const id of allMeshes.map(({ _id }) => _id)) {
		if (!first) {
			stream.write(',');
		}

		const idStr = UUIDToString(id);
		stream.write(JSON.stringify({ id: idStr, meshIds: [idStr] }));
		first = false;
	}
};

const getConfigSetEntry = async (teamspace, project, selection, stream, setName) => {
	const { container, revision, rules = [] } = selection;

	const { matched, unwanted } = await getMetadataByRules(teamspace, project, container,
		revision, rules, { _id: 1, parents: 1 });

	stream.write(`"${setName}":{"teamspace":${JSON.stringify(teamspace)},"container":${JSON.stringify(container)},"revision":${JSON.stringify(UUIDToString(revision))},"objects":[`);

	// if there are no rules defined and no metadata matches that means its not a BIM model
	if (!matched.length && !rules.length) {
		await writeAllMeshes(teamspace, project, container, revision, stream);
	} else {
		await writeMeshesFromMeta(teamspace, project, container, revision, matched, unwanted, stream);
	}

	stream.write(']}');
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

// const clashesResult = {
// 	clashes: [
// 		{
// 			a: 'a88c3705-82a0-41d9-8b9c-11f2eb79da9c',
// 			b: '276a7fb7-2986-4b37-970a-75eb0b7f1db3',
// 			positions: [
// 				[
// 					390.93758440457151,
// 					-23.603977256511698,
// 					-408.39603930559542,
// 				],
// 				[
// 					-0.031746104136434847,
// 					0.54243240722551933,
// 					-0.67853894510869661,
// 				],
// 			],
// 			fingerprint: '1245678',
// 		},
// 		{
// 			a: '3278c31e-f3ef-411b-8a8a-ee12004b96f7',
// 			b: '3ffdf61a-a7b1-4652-b254-aa4ab82b8339',
// 			positions: [
// 				[
// 					361.24534292277446,
// 					313.37967989857873,
// 					-694.55377464469609,
// 				],
// 				[
// 					0.37892636217339154,
// 					0.32061235350038431,
// 					-0.31103874602238446,
// 				],
// 			],
// 			fingerprint: '1245678',
// 		},
// 	],
// };

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
	const makeKey = (item) => [item.a, item.b].sort().join('__');

	const existingMap = new Map(existingRunClashes.map((item) => [makeKey(item), item]));
	const newMap = new Map(newRunClashes.map((item) => [makeKey(item), item]));

	const result = { new: [], active: [], resolved: [] };

	for (const [key, newItem] of newMap) {
		if (existingMap.has(key)) {
			result.active.push({ previous: existingMap.get(key), current: newItem });
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

Clashes.completeTestRun = async (teamspace, corId, resPath) => {
	const readStream = createReadStream(resPath, { encoding: 'utf8' });
	const clashes = await streamToJSON(readStream);

	let lastRunClashes;

	try {
		const currentRun = await getTestRunByQuery(teamspace, { _id: corId }, { plan: 1, triggeredAt: 1 });
		const { result } = await getTestRunByQuery(teamspace,
			{ 'plan._id': currentRun.plan._id, completedAt: { $exists: true } },
			{ result: 1 }, { completedAt: -1 },
		);

		const lastCompleteRunFile = await getFileAsStream(teamspace, RUN_HISTORY_COL, result);
		const { new: newClashes, active, resolved } = await streamToJSON(lastCompleteRunFile.readStream);
		lastRunClashes = [...newClashes, ...active, ...resolved];
	} catch (err) {
		lastRunClashes = [];
	}

	const categorizedClashes = compareRunResults(lastRunClashes, clashes.clashes);

	const resultId = generateUUID();
	await storeFile(teamspace, RUN_HISTORY_COL, resultId,
		Buffer.from(JSON.stringify(categorizedClashes)));

	await completeTestRun(teamspace, corId, resultId);
};

module.exports = Clashes;
