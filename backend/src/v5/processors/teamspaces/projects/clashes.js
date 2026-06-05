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
	RUN_HISTORY_COL,
	SELF_INTERSECTIONS_CHECK_OPTIONS,
	clashObjectIdTypes,
	clashRunStatus,
} = require('../../../models/clashes.constants');
const { UUIDToString, stringToUUID } = require('../../../utils/helper/uuids');
const {
	createClashRun,
	deleteRunsByPlan,
	deleteRunsByProject,
	getClashRunByQuery,
	updateRunStatus,
} = require('../../../models/clashes.runs');
const {
	createPlan,
	deletePlan: deleteClashPlan,
	deletePlansByProject,
	updatePlan,
} = require('../../../models/clashes.plans');
const { getExternalIdsFromMetadata, getMeshNodeBounds, getMeshesWithParentIds } = require('./models/commons/scenes');
const { getFileAsStream, removeFiles, storeFile } = require('../../../services/filesManager');
const { getMetadataByQuery, getMetadataByRules } = require('../../../models/metadata');
const { JSONParser } = require('@streamparser/json-node');
const { PassThrough } = require('stream');
const { createReadStream } = require('fs');
const { deleteIfUndefined } = require('../../../utils/helper/objects');
const { templates: emailTemplates } = require('../../../services/mailer/mailer.constants');
const { events } = require('../../../services/eventsManager/eventsManager.constants');
const { getArrayDifference } = require('../../../utils/helper/arrays');
const { getNodesByQuery } = require('../../../models/scenes');
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
	await removeFiles(teamspace, RUN_HISTORY_COL, runIds);
};

Clashes.deleteClashDataInProject = async (teamspace, project) => {
	await deletePlansByProject(teamspace, project);
	const runIds = await deleteRunsByProject(teamspace, project);
	await removeFiles(teamspace, RUN_HISTORY_COL, runIds);
};

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

const determineCompositeObjects = async (teamspace, project, container, revision, rules) => {
	const compIdToMeshes = {};

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
			compIdToMeshes[compositeId] = [];
		}

		compIdToMeshes[compositeId].push(UUIDToString(mesh._id));
	}

	return applyExternalIds(teamspace, container, revision, compIdToMeshes);
};

const writeConfigSetEntry = async (teamspace, project, selection, stream, setName) => {
	const { container, revision, rules = [] } = selection;

	const compToMeshes = await determineCompositeObjects(teamspace, project, container, revision, rules);
	stream.write(`"${setName}":[{"teamspace":${JSON.stringify(teamspace)},"container":${JSON.stringify(container)},"revision":${JSON.stringify(UUIDToString(revision))},"objects":[`);

	let first = true;
	for (const [compositeId, meshIds] of Object.entries(compToMeshes)) {
		if (!first) {
			stream.write(',');
		}

		// eslint-disable-next-line no-await-in-loop
		const bbox = await getMeshNodeBounds(teamspace, project, container, revision, meshIds);
		const bboxSignificantFigures = 8;
		const formattedBbox = {
			min: bbox.min.map((value) => Number(value.toPrecision(bboxSignificantFigures))),
			max: bbox.max.map((value) => Number(value.toPrecision(bboxSignificantFigures))),
		};
		stream.write(JSON.stringify({ id: `${compositeId}::${JSON.stringify(formattedBbox)}`, meshIds }));
		first = false;
	}

	stream.write(']}]');
};

Clashes.createRun = async (teamspace, project, plan, user) => {
	// Pulling the detail of the test config only here - we don't want to store additional info such as results configurations.
	const { type, tolerance, selfIntersectionsCheck, selectionA, selectionB } = plan;
	const runId = await createClashRun(teamspace, project, plan, user);
	const configStream = new PassThrough();
	configStream.write('{');
	configStream.write(`"type":${JSON.stringify(type)},`);
	configStream.write(`"tolerance":${JSON.stringify(tolerance)},`);
	configStream.write(`"selfIntersectsA":${JSON.stringify(selfIntersectionsCheck === true || selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[0])},`);
	configStream.write(`"selfIntersectsB":${JSON.stringify(selfIntersectionsCheck === true || selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[1])},`);
	await writeConfigSetEntry(teamspace, project, selectionA, configStream, 'setA');
	configStream.write(',');
	await writeConfigSetEntry(teamspace, project, selectionB, configStream, 'setB');
	configStream.end('}');

	await queueClashRun(teamspace, project, UUIDToString(runId), configStream);
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

		const { readStream } = await getFileAsStream(teamspace, RUN_HISTORY_COL, lastCompletedRun._id);
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
	const { plan } = await getClashRunByQuery(teamspace, project,
		{ _id: runId }, { plan: 1, triggeredAt: 1 });

	const planId = plan._id;

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
			const errMessage = `The following errors were found: ${
				Object.entries(errorCounts).map(([type, count]) => `${count} ${type}`).join(', ')
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

	await storeFile(teamspace, RUN_HISTORY_COL, runId, Buffer.from(JSON.stringify(categorizedClashes)));
	await updateRunStatus(teamspace, project, runId, clashRunStatus.COMPLETED,
		{ stats: {
			new: categorizedClashes.new.length,
			active: categorizedClashes.active.length,
			resolved: categorizedClashes.resolved.length,
		} });
	publish(events.CLASH_RUN_PROCESSED, {
		teamspace,
		project,
		runId,
		plan,
		results: categorizedClashes,
	});
};

module.exports = Clashes;
