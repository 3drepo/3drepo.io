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

const { object } = require('yup');
const { SELF_INTERSECTIONS_CHECK_OPTIONS } = require('../../../models/clashes.constants');
const { createPlan, deletePlan, updatePlan } = require('../../../models/clashes.plans');
const { createTestRun } = require('../../../models/clashes.runs');
const { modelTypes } = require('../../../models/modelSettings.constants');
const { getLatestRevision } = require('../../../models/revisions');
const { getNodesByIds, getNodesByQuery } = require('../../../models/scenes');
const { nodeTypes } = require('../../../models/scenes.constants');
const { queueClashRun } = require('../../../services/clashProcessing');
const { UUIDToString, stringToUUID } = require('../../../utils/helper/uuids');
const { getMetadataByRules } = require('../../../models/metadata');
const { getMeshesWithParentIds } = require('./models/commons/scenes');
const { getArrayDifference } = require('../../../utils/helper/arrays');

const Clashes = {};

Clashes.createPlan = createPlan;

Clashes.updatePlan = updatePlan;

Clashes.deletePlan = deletePlan;

const getAllRevObjects = async (teamspace, project, selection) => {
	const nodes = await getNodesByQuery(teamspace, project, selection.container,
		{ type: nodeTypes.MESH, name: { $exists: false } }, { _id: 1, parents: 1 });

	const grouped = nodes.reduce((acc, item) => {
		const parentId = UUIDToString(item.parents[0]);

		if (!acc[parentId]) {
			acc[parentId] = { _id: parentId, meshIds: [] };
		}

		acc[parentId].meshIds.push(UUIDToString(item._id));
		return acc;
	}, {});

	return Object.values(grouped);
};

const getObjectsByRules = async (teamspace, project, selection) => {
	const { matched, unwanted } = await getMetadataByRules(teamspace, project, selection.container,
		selection.revision, selection.rules, { _id: 1, parents: 1 });

	const [matchedMeshIds, unwantedMeshIds] = await Promise.all([
		matched.length ? getMeshesWithParentIds(teamspace, project, selection.container, selection.revision,
			matched.flatMap(({ parents }) => parents), true) : Promise.resolve([]),
		unwanted.length ? getMeshesWithParentIds(teamspace, project, selection.container, selection.revision,
			unwanted.flatMap(({ parents }) => parents), true) : Promise.resolve([]),
	]);

	const res = { container: selection.container,
		_ids: getArrayDifference(unwantedMeshIds, matchedMeshIds).map(stringToUUID) };
	return res;
};

const getConfigSetEntry = async (teamspace, project, selection) => {
	let objects;

	if (selection.rules) {
		objects = await getObjectsByRules(teamspace, project, selection);
	} else {
		objects = await getAllRevObjects(teamspace, project, selection);
	}

	return [{ teamspace, container: selection.container, revision: selection.revision, objects }];
};

Clashes.createRun = async (teamspace, project, plan, userId) => {
	const config = {
		type: plan.type,
		tolerance: plan.tolerance,
		selfIntersectsA: plan.selfIntersectionsCheck === true
		|| plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[0],
		selfIntersectsB: plan.selfIntersectionsCheck === true
		|| plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[1],
	};

	const runId = await createTestRun(teamspace, plan, userId);
	config.setA = await getConfigSetEntry(teamspace, project, plan.selectionA);
	config.setB = await getConfigSetEntry(teamspace, project, plan.selectionB);

	await queueClashRun(teamspace, project, UUIDToString(runId), userId, config);
	return runId;
};

module.exports = Clashes;
