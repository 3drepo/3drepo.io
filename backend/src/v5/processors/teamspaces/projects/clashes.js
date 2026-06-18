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

const {
	CLASH_RUNS_COL,
	SELF_INTERSECTIONS_CHECK_OPTIONS,
	clashObjectIdTypes,
	clashRunStatus,
} = require('../../../models/clashes.constants');
const { UUIDToString, stringToUUID } = require('../../../utils/helper/uuids');
const {
	createClashRun,
	deleteRunsByPlan,
	deleteRunsByProject,
	getClashRunById,
	getClashRunByQuery,
	getClashRunsByPlan,
	getLatestRunByPlan,
	updateRunStatus,
} = require('../../../models/clashes.runs');
const {
	createPlan,
	deletePlan: deleteClashPlan,
	deletePlansByProject,
	getAllPlansByProject,
	getPlanById,
	updatePlan,
} = require('../../../models/clashes.plans');
const { getBoundsForGroupsOfMeshNodes, getExternalIdsFromMetadata, getMeshesWithParentIds } = require('./models/commons/scenes');
const { getFileAsStream, removeFiles, storeFile } = require('../../../services/filesManager');
const { getMetadataByQuery, getMetadataByRules } = require('../../../models/metadata');
const { JSONParser } = require('@streamparser/json-node');
const { PassThrough } = require('stream');
const { createReadStream } = require('fs');
const { deleteIfUndefined } = require('../../../utils/helper/objects');
const { templates: emailTemplates } = require('../../../services/mailer/mailer.constants');
const { events } = require('../../../services/eventsManager/eventsManager.constants');
const { getArrayDifference } = require('../../../utils/helper/arrays');
const { getContainerById } = require('../../../models/modelSettings');
const { getLatestRevision } = require('../../../models/revisions');
const { getNodesByQuery } = require('../../../models/scenes');
const { modelTypes } = require('../../../models/modelSettings.constants');
const { publish } = require('../../../services/eventsManager/eventsManager');
const { queueClashRun } = require('../../../services/modelProcessing');
const { sendSystemEmail } = require('../../../services/mailer');
const { templates } = require('../../../utils/responseCodes');

const Clashes = {};

Clashes.createPlan = createPlan;

Clashes.updatePlan = updatePlan;

Clashes.deletePlan = async (teamspace, project, planId) => {
	await deleteClashPlan(teamspace, project, planId);
	const runIds = await deleteRunsByPlan(teamspace, project, planId);
	await removeFiles(teamspace, CLASH_RUNS_COL, runIds);
};

Clashes.deleteClashDataInProject = async (teamspace, project) => {
	await deletePlansByProject(teamspace, project);
	const runIds = await deleteRunsByProject(teamspace, project);
	await removeFiles(teamspace, CLASH_RUNS_COL, runIds);
};

Clashes.getAllPlans = getAllPlansByProject;

Clashes.getPlanById = getPlanById;

Clashes.getClashRunsByPlan = getClashRunsByPlan;

const applyExternalIds = async (teamspace, container, revision, internalCompIdsToMeshes) => {
	const compositesToMeshes = {};

	const metadata = await getMetadataByQuery(teamspace, container,
		{ rev_id: revision, parents: { $in: Object.keys(internalCompIdsToMeshes).map(stringToUUID) } },
		{ metadata: 1, parents: 1 });

	const sharedIdToExternalIdMap = {};
	for (const metaNode of metadata) {
		const { parents } = metaNode;
		const externalIds = getExternalIdsFromMetadata([metaNode]);
		if (externalIds) {
			const idType = externalIds.key;
			parents.forEach((parent) => {
				const parentIdStr = UUIDToString(parent);
				sharedIdToExternalIdMap[parentIdStr] = `${container}::${idType}::${externalIds.values[0]}`;
			});
		}
	}

	for (const [compId, meshes] of Object.entries(internalCompIdsToMeshes)) {
		const compositePath = sharedIdToExternalIdMap[compId] ?? `${container}::${clashObjectIdTypes.INTERNAL}::${compId}`;
		compositesToMeshes[compositePath] = meshes;
	}

	return compositesToMeshes;
};

const determineCompositeObjects = async (teamspace, project, container, revision, rules, compIdToMeshes) => {
	let meshIDQuery;

	if (rules.length) {
		const { matched, unwanted } = await getMetadataByRules(teamspace, project, container,
			revision, rules, { parents: 1 });

		const [wantedMeshesStrIds, unwantedMeshIdsStrIds] = await Promise.all(
			[matched, unwanted].map((arr) => (arr.length
				? getMeshesWithParentIds(teamspace, project, container, revision,
					arr.flatMap(({ parents }) => parents), true)
				: [])));

		meshIDQuery = {
			$in: getArrayDifference(unwantedMeshIdsStrIds, wantedMeshesStrIds).map(stringToUUID),
		};
	}

	const meshes = await getNodesByQuery(teamspace, project, container,
		deleteIfUndefined({ type: 'mesh', rev_id: revision, _id: meshIDQuery }),
		{ _id: 1, parents: 1, name: 1, shared_id: 1 });

	for (const mesh of meshes) {
		const compositeId = UUIDToString(mesh.name ? mesh.shared_id : mesh.parents[0]);

		if (!compIdToMeshes[compositeId]) {
			// eslint-disable-next-line no-param-reassign
			compIdToMeshes[compositeId] = new Set();
		}

		compIdToMeshes[compositeId].add(UUIDToString(mesh._id));
	}
};

const findObjectsForSelections = async (teamspace, project, selections = []) => {
	const mergedSelections = {};

	await Promise.all(selections.map(async ({ container, revision, rules = [] }) => {
		if (!mergedSelections[container]) {
			mergedSelections[container] = { container, revision, objects: {} };
		}

		await determineCompositeObjects(teamspace, project, container, revision, rules,
			mergedSelections[container].objects);
	}));

	const selectionEntries = [];
	await Promise.all(Object.values(mergedSelections)
		.map(async ({ container, revision, objects }) => {
			if (Object.keys(objects).length) {
				selectionEntries.push({
					container,
					revision,
					objects: await applyExternalIds(teamspace, container, revision, objects),
				});
			}
		}));

	return selectionEntries;
};

const writeConfigSetEntry = async (teamspace, project, selectionEntries, stream, setName) => {
	stream.write(`"${setName}":[`);
	let firstSelection = true;
	for (const { container, revision, objects } of selectionEntries) {
		if (!firstSelection) {
			stream.write(',');
		}
		firstSelection = false;

		stream.write(`{"teamspace":${JSON.stringify(teamspace)},"container":${JSON.stringify(container)},"revision":${JSON.stringify(UUIDToString(revision))},"objects":[`);

		let firstObject = true;
		const compositeIds = Object.keys(objects);
		const meshIdGroupsStr = [];
		const meshIdGroupsUUID = [];
		compositeIds.forEach((compositeId) => {
			const meshIds = Array.from(objects[compositeId]);
			meshIdGroupsStr.push(meshIds);
			meshIdGroupsUUID.push(meshIds.map(stringToUUID));
		});
		// eslint-disable-next-line no-await-in-loop
		const bboxes = await getBoundsForGroupsOfMeshNodes(teamspace, project, container, revision,
			meshIdGroupsUUID);

		for (let index = 0; index < compositeIds.length; index++) {
			const compositeId = compositeIds[index];
			if (!firstObject) {
				stream.write(',');
			}

			const meshIds = meshIdGroupsStr[index];
			const bbox = bboxes[index];
			const bboxSignificantFigures = 8;
			const formattedBbox = {
				min: bbox.min.map((value) => Number(value.toPrecision(bboxSignificantFigures))),
				max: bbox.max.map((value) => Number(value.toPrecision(bboxSignificantFigures))),
			};

			stream.write(JSON.stringify({ id: `${compositeId}::${JSON.stringify(formattedBbox)}`, meshIds }));
			firstObject = false;
		}

		stream.write(']}');
	}
	stream.write(']');
};

const getClashRunContext = async (teamspace, project, plan) => {
	const { type, tolerance, selfIntersectionsCheck } = plan;

	return {
		type,
		tolerance,
		selfIntersectsA: selfIntersectionsCheck === true
			|| selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[0],
		selfIntersectsB: selfIntersectionsCheck === true
			|| selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[1],
		selectionA: await findObjectsForSelections(teamspace, project, plan.selectionA),
		selectionB: await findObjectsForSelections(teamspace, project, plan.selectionB),
	};
};

const sendClashRunToQueue = async (teamspace, project, runId, context) => {
	const { type, tolerance, selfIntersectsA, selfIntersectsB, selectionA, selectionB } = context;
	const configStream = new PassThrough();
	configStream.write('{');
	configStream.write(`"type":${JSON.stringify(type)},`);
	configStream.write(`"tolerance":${JSON.stringify(tolerance)},`);
	configStream.write(`"selfIntersectsA":${JSON.stringify(selfIntersectsA)},`);
	configStream.write(`"selfIntersectsB":${JSON.stringify(selfIntersectsB)},`);
	await writeConfigSetEntry(teamspace, project, selectionA, configStream, 'setA');
	configStream.write(',');
	await writeConfigSetEntry(teamspace, project, selectionB, configStream, 'setB');
	configStream.end('}');

	await queueClashRun(teamspace, project, UUIDToString(runId), configStream);
};

Clashes.createRun = async (teamspace, project, plan, user) => {
	// Pulling the detail of the test config only here - we don't want to store additional info such as results configurations.
	const clashConfig = deleteIfUndefined({
		_id: plan._id,
		type: plan.type,
		tolerance: plan.tolerance,
		selfIntersectionsCheck: plan.selfIntersectionsCheck,
		selectionA: plan.selectionA,
		selectionB: plan.selectionB,
	});
	const [runId, context] = await Promise.all([
		createClashRun(teamspace, project, clashConfig, user),
		getClashRunContext(teamspace, project, plan),
	]);
	const { selectionA, selectionB, selfIntersectsA, selfIntersectsB } = context;
	const hasObjectsInA = !!selectionA.length;
	const hasObjectsInB = !!selectionB.length;

	if ((hasObjectsInA && hasObjectsInB)
		|| (selfIntersectsA && hasObjectsInA)
		|| (selfIntersectsB && hasObjectsInB)) {
		await sendClashRunToQueue(teamspace, project, runId, context);
	} else {
		await updateRunStatus(teamspace, project, runId, clashRunStatus.ABORTED,
			{ reason: 'The defined selections do not yield any candidates to execute a clash run.' });
	}

	return runId;
};

const readArraysFromJSONStream = async (stream, arrayNames, onData) => {
	const parser = new JSONParser({
		paths: arrayNames.map((name) => `$.${name}.*`),
	});

	parser.on('data', (data) => onData({
		...data,
		arrayName: data.stack?.[data.stack.length - 1]?.key,
	}));

	await new Promise((resolve, reject) => {
		stream.on('error', (err) => parser.destroy(err));
		stream
			.pipe(parser)
			.on('end', resolve)
			.on('error', reject);
	});
};

const getLastRunClashes = async (teamspace, project, planId, runId) => {
	const clashMap = new Map();
	try {
		const lastCompletedRun = await getClashRunByQuery(teamspace, project,
			{ 'plan._id': planId, status: clashRunStatus.COMPLETED },
			{ _id: 1 }, { updatedAt: -1 },
		);

		const { readStream } = await getFileAsStream(teamspace, CLASH_RUNS_COL, lastCompletedRun._id);
		await readArraysFromJSONStream(readStream, ['new', 'active'], ({ value }) => {
			clashMap.set(value.index, value);
		});

		return clashMap;
	} catch (err) {
		if (err.code === templates.clashRunNotFound.code) {
			return new Map();
		}

		await Promise.all([
			sendSystemEmail(emailTemplates.CLASH_ERROR.name,
				{
					errorMessage: err.message,
					teamspace,
					project: UUIDToString(project),
					planId: UUIDToString(planId),
					runId: UUIDToString(runId),
				}),
			updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED,
				{ error: { reason: `Error retrieving clashes from last run: ${err.message}` } }),
		]);

		throw err;
	}
};

const formatClashForResults = (clash) => {
	const getClashObjParts = (obj) => {
		const [container, idType, id, bboxJSON] = obj.split('::');
		return {
			bbox: JSON.parse(bboxJSON),
			index: [container, idType, id].join('::'),
			object: { container, idType, id },
		};
	};
	const objectA = getClashObjParts(clash.a);
	const objectB = getClashObjParts(clash.b);
	const index = [objectA.index, objectB.index].sort().join('-');

	const bbox = {
		min: objectA.bbox.min.map((value, i) => Math.min(value, objectB.bbox.min[i])),
		max: objectA.bbox.max.map((value, i) => Math.max(value, objectB.bbox.max[i])),
	};

	const clashData = {
		...clash,
		a: objectA.object,
		b: objectB.object,
		index,
		bbox,
	};

	return {
		index,
		clash: clashData,
	};
};

Clashes.processClashResults = async (teamspace, project, runId, resPath) => {
	const { plan, status } = await getClashRunById(teamspace, project, runId, { plan: 1, status: 1 });

	if (status === clashRunStatus.ABORTED) {
		// this run was cancelled (likely via the utility script)
		return;
	}

	const planId = plan._id;
	const latestRun = await getLatestRunByPlan(teamspace, project, planId, { _id: 1 });
	if (UUIDToString(latestRun._id) !== UUIDToString(runId)) {
		await updateRunStatus(teamspace, project, runId, clashRunStatus.ABORTED,
			{ error: { reason: 'Clash run aborted because it has been superseded by a newer run.' } });
		return;
	}

	const errorCounts = {};
	let hasErrors = false;

	const knownClashes = await getLastRunClashes(teamspace, project, planId, runId);
	const categorizedClashes = { new: [], active: [], resolved: [] };

	try {
		const resStream = createReadStream(resPath, { encoding: 'utf8' });

		await readArraysFromJSONStream(resStream, ['errors', 'clashes'], ({ arrayName, value }) => {
			if (arrayName === 'errors') {
				hasErrors = true;
				categorizedClashes.new = [];
				categorizedClashes.active = [];
				knownClashes.clear();
				errorCounts[value.type] = (errorCounts[value.type] ?? 0) + 1;
				return;
			}

			if (!hasErrors) {
				const { index, clash } = formatClashForResults(value);
				if (knownClashes.has(index)) {
					categorizedClashes.active.push(clash);
					knownClashes.delete(index);
				} else {
					categorizedClashes.new.push(clash);
				}
			}
		});

		if (hasErrors) {
			const errMessage = `The following errors were found: ${Object.entries(errorCounts).map(([type, count]) => `${count} ${type}`).join(', ')
			}`;
			await updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED,
				{ error: { reason: errMessage } });
			return;
		}
	} catch (err) {
		await updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED,
			{ error: { reason: `Could not read results file: ${err.message}` } });
		throw err;
	}

	categorizedClashes.resolved = Array.from(knownClashes.values());

	await storeFile(teamspace, CLASH_RUNS_COL, runId, Buffer.from(JSON.stringify(categorizedClashes)));
	await updateRunStatus(teamspace, project, runId, clashRunStatus.COMPLETED,
		{ stats: {
			new: categorizedClashes.new.length,
			active: categorizedClashes.active.length,
			resolved: categorizedClashes.resolved.length,
		} });
	publish(events.CLASH_RUN_RESULTS_PROCESSED, {
		teamspace,
		project,
		runId,
		plan,
		results: categorizedClashes,
	});
};

Clashes.setLastRevForSelections = async (teamspace, selectionA, selectionB) => {
	await Promise.all([...selectionA, ...selectionB].map(async (selectionObj) => {
		// ensure container exists
		await getContainerById(teamspace, selectionObj.container, { _id: 1 });

		const { _id: rev } = await getLatestRevision(teamspace, selectionObj.container,
			modelTypes.CONTAINER, { _id: 1 });

		// eslint-disable-next-line no-param-reassign
		selectionObj.revision = rev;
	}));
};

module.exports = Clashes;
