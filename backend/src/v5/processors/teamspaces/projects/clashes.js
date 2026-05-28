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

const { RUN_HISTORY_COL, SELF_INTERSECTIONS_CHECK_OPTIONS } = require('../../../models/clashes.constants');
const { UUIDToString, generateUUIDString, stringToUUID } = require('../../../utils/helper/uuids');
const { completeTestRun, createTestRun, getTestRunByQuery, setTestRunToFailed } = require('../../../models/clashes.runs');
const { createPlan, deletePlan, updatePlan } = require('../../../models/clashes.plans');
const { getExternalIdsFromMetadata, getMeshesWithParentIds } = require('./models/commons/scenes');
const { getFileAsStream, storeFile } = require('../../../services/filesManager');
const { getMetadataByQuery, getMetadataByRules } = require('../../../models/metadata');
const { JSONParser } = require('@streamparser/json-node');
const { PassThrough } = require('stream');
const { createConstantsObject } = require('../../../utils/helper/objects');
const { createReadStream } = require('fs');
const { templates: emailTemplates } = require('../../../services/mailer/mailer.constants');
const { getArrayDifference } = require('../../../utils/helper/arrays');
const { getNodesByQuery } = require('../../../models/scenes');
const { queueClashRun } = require('../../../services/modelProcessing');
const { sendSystemEmail } = require('../../../services/mailer');
const { templates } = require('../../../utils/responseCodes');

const Clashes = {};

Clashes.createPlan = createPlan;

Clashes.updatePlan = updatePlan;

Clashes.deletePlan = deletePlan;

const applyExternalIds = async (teamspace, container, parentIdsToMeshes) => {
	const compositesToMeshes = {};

	const metadata = await getMetadataByQuery(teamspace, container,
		{ parents: { $in: Object.keys(parentIdsToMeshes).map(stringToUUID) } }, { metadata: 1, parents: 1 });

	const metadataMapping = {};
	for (const { parents, metadata: meta } of metadata) {
		const parentIdStr = UUIDToString(parents[0]);
		metadataMapping[parentIdStr] = meta;
	}

	for (const [compId, meshes] of Object.entries(parentIdsToMeshes)) {
		const meshMeta = metadataMapping[compId];
		const externalIds = meshMeta ? getExternalIdsFromMetadata([meshMeta]) : null;
		const compositePath = `${container}::${externalIds?.key ?? 'internal'}::${externalIds?.values[0] ?? compId}`;
		compositesToMeshes[compositePath] = meshes;
	}

	return compositesToMeshes;
};

const getCompositeToMeshesObject = async (teamspace, project, container, revision, rules) => {
	const compIdToMeshes = {};

	let meshIdsToFetch;

	if (rules.length) {
		const { matched, unwanted } = await getMetadataByRules(teamspace, project, container,
			revision, rules, { parents: 1 });

		const wantedMeshes = matched.length
			? await getMeshesWithParentIds(teamspace, project, container, revision,
				matched.flatMap(({ parents }) => parents), true)
			: [];

		const unwantedMeshIds = unwanted.length
			? await getMeshesWithParentIds(teamspace, project, container, revision,
				unwanted.flatMap(({ parents }) => parents), true)
			: [];

		meshIdsToFetch = getArrayDifference(unwantedMeshIds, wantedMeshes).map(stringToUUID);
	}

	const meshes = await getNodesByQuery(teamspace, project, container,
		{ type: 'mesh', rev_id: revision, ...(meshIdsToFetch ? { _id: { $in: meshIdsToFetch } } : {}) },
		{ _id: 1, parents: 1, name: 1, shared_id: 1 });

	for (const mesh of meshes) {
		const parentId = UUIDToString(mesh.name ? mesh.shared_id : mesh.parents[0]);

		if (!compIdToMeshes[parentId]) {
			compIdToMeshes[parentId] = [];
		}

		compIdToMeshes[parentId].push(UUIDToString(mesh._id));
	}

	return compIdToMeshes;
};

const writeConfigSetEntry = async (teamspace, project, selection, stream, setName) => {
	const { container, revision, rules = [] } = selection;

	const compToMeshes = await getCompositeToMeshesObject(teamspace, project, container, revision, rules);
	const externalCompToMeshes = await applyExternalIds(teamspace, container, compToMeshes);

	stream.write(`"${setName}":[{"teamspace":${JSON.stringify(teamspace)},"container":${JSON.stringify(container)},"revision":${JSON.stringify(UUIDToString(revision))},"objects":[`);

	let first = true;
	for (const [parentIdStr, meshIds] of Object.entries(externalCompToMeshes)) {
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

const getClashesFromStream = async (stream, isPastRun) => {
	const arrNames = isPastRun ? ['new', 'active', 'resolved'] : ['clashes'];
	const clashes = [];

	const parser = new JSONParser({
		paths: arrNames.map((name) => `$.${name}.*`),
	});

	parser.on('data', ({ value }) => {
		if (isPastRun) {
			// resolved collection stores just indexes for now
			const clashIndex = value.index ?? value;
			clashes.push(clashIndex);
		} else {
			clashes.push(value);
		}
	});

	await new Promise((resolve, reject) => {
		stream
			.pipe(parser)
			.on('end', resolve)
			.on('error', reject);
	});

	return clashes;
};

const compareRunResults = (lastRunIndexObj, newRunClashes) => {
	const result = { new: [], active: [], resolved: [] };

	const getClashObjParts = (obj) => {
		const [container, idType, id] = obj.split('::');
		return { container, idType, id };
	};

	for (const newClash of newRunClashes) {
		const key = [newClash.a, newClash.b].sort().join('-');
		const clashToAdd = { ...newClash,
			a: getClashObjParts(newClash.a),
			b: getClashObjParts(newClash.b),
			index: key };

		if (lastRunIndexObj[key]) {
			result.active.push(clashToAdd);

			// eslint-disable-next-line no-param-reassign
			delete lastRunIndexObj[key];
		} else {
			result.new.push(clashToAdd);
		}
	}

	result.resolved = Object.keys(lastRunIndexObj);

	return result;
};

const getLastRunClashes = async (teamspace, planId) => {
	try {
		const lastCompletedRun = await getTestRunByQuery(teamspace,
			{ 'plan._id': planId, completedAt: { $exists: true } },
			{ result: 1 }, { completedAt: -1 },
		);

		const { readStream } = await getFileAsStream(teamspace, RUN_HISTORY_COL, lastCompletedRun.result);
		return getClashesFromStream(readStream, true);
	} catch (err) {
		if (err.code === templates.clashRunNotFound.code) {
			return [];
		}

		return null;
	}
};

Clashes.processClashResults = async (teamspace, runId, resPath) => {
	const { plan: { _id: planId } } = await getTestRunByQuery(teamspace, { _id: runId }, { 'plan._id': 1, triggeredAt: 1 });
	const lastRunClashes = await getLastRunClashes(teamspace, planId);

	if (!lastRunClashes) {
		const errorMessage = 'Error retrieving clashes from last run';
		await sendSystemEmail(emailTemplates.CLASH_ERROR.name,
			{ errorMessage, teamspace, planId: UUIDToString(planId), runId: UUIDToString(runId) });
		await setTestRunToFailed(teamspace, runId, errorMessage);
		return;
	}

	const resStream = createReadStream(resPath, { encoding: 'utf8' });
	const newRunClashes = await getClashesFromStream(resStream);
	const lastRunIndexObj = createConstantsObject(lastRunClashes);

	const categorizedClashes = compareRunResults(lastRunIndexObj, newRunClashes);
	const resultId = generateUUIDString();

	await storeFile(teamspace, RUN_HISTORY_COL, resultId, Buffer.from(JSON.stringify(categorizedClashes)));
	await completeTestRun(teamspace, runId, resultId);
};

module.exports = Clashes;
