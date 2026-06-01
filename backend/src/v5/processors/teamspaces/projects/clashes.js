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
const { createClashRun, getClashRunByQuery, updateRunStatus } = require('../../../models/clashes.runs');
const { createPlan, deletePlan, updatePlan } = require('../../../models/clashes.plans');
const { getExternalIdsFromMetadata, getMeshesWithParentIds } = require('./models/commons/scenes');
const { getFileAsStream, storeFile } = require('../../../services/filesManager');
const { getMetadataByQuery, getMetadataByRules } = require('../../../models/metadata');
const { JSONParser } = require('@streamparser/json-node');
const { PassThrough } = require('stream');
const { createReadStream } = require('fs');
const { deleteIfUndefined } = require('../../../utils/helper/objects');
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

		stream.write(JSON.stringify({ id: compositeId, meshIds }));
		first = false;
	}

	stream.write(']}]');
};

Clashes.createRun = async (teamspace, project, plan, user) => {
	const runId = await createClashRun(teamspace, project, plan, user);

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

const readArraysFromJSONStream = async (stream, arrayNames, onData) => {
	const parser = new JSONParser({
		paths: arrayNames.map((name) => `$.${name}.*`),
	});

	parser.on('data', onData);

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

Clashes.processClashResults = async (teamspace, project, runId, resPath) => {
	const { plan: { _id: planId } } = await getClashRunByQuery(teamspace, project,
		{ _id: runId }, { 'plan._id': 1, triggeredAt: 1 });

	try {
		// check the results file for any errors before processing anything.
		const errorCounts = {};
		const resStream = createReadStream(resPath, { encoding: 'utf8' });

		await readArraysFromJSONStream(resStream, ['errors'], ({ value }) => {
			errorCounts[value.type] = (errorCounts[value.type] ?? 0) + 1;
		});

		if (Object.keys(errorCounts).length) {
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

	const knownClashes = await getLastRunClashes(teamspace, project, planId, runId);

	const resStream = createReadStream(resPath, { encoding: 'utf8' });
	const categorizedClashes = { new: [], active: [], resolved: [] };
	try {
		await readArraysFromJSONStream(resStream, ['clashes'], ({ value: newClash }) => {
			const key = [newClash.a, newClash.b].sort().join('-');
			const getClashObjParts = (obj) => {
				const [container, idType, id] = obj.split('::');
				return { container, idType, id };
			};
			const clashToAdd = {
				...newClash,
				a: getClashObjParts(newClash.a),
				b: getClashObjParts(newClash.b),
				index: key,
			};

			if (knownClashes.has(key)) {
				categorizedClashes.active.push(clashToAdd);

				knownClashes.delete(key);
			} else {
				categorizedClashes.new.push(clashToAdd);
			}
		});
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
};

module.exports = Clashes;
