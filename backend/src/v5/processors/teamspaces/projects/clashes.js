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
const { UUIDToString } = require('../../../utils/helper/uuids');
const { createConstantsObject } = require('../../../utils/helper/objects');
const { createTestRun } = require('../../../models/clashes.runs');
const { getGroupedMeshesFromParentIds } = require('./models/commons/scenes');
const { getMetadataByRules } = require('../../../models/metadata');
const { queueClashRun } = require('../../../services/clashProcessing');

const Clashes = {};

Clashes.createPlan = createPlan;

Clashes.updatePlan = updatePlan;

Clashes.deletePlan = deletePlan;

const getConfigSetEntry = async (teamspace, project, selection, stream, setName) => {
	const { container, revision, rules = [] } = selection;

	const { matched, unwanted } = await getMetadataByRules(teamspace, project, container,
		revision, rules, { _id: 1, parents: 1 });

	const [matchedMeshGroups, unwantedMeshGroups] = await Promise.all([
		matched.length ? getGroupedMeshesFromParentIds(teamspace, project, container, revision,
			matched.flatMap(({ parents }) => parents)) : Promise.resolve([]),
		unwanted.length ? getGroupedMeshesFromParentIds(teamspace, project, container, revision,
			unwanted.flatMap(({ parents }) => parents)) : Promise.resolve([]),
	]);

	const unwantedIdsObj = createConstantsObject(unwantedMeshGroups.map(({ id }) => id));

	stream.write(`"${setName}":{"teamspace":${JSON.stringify(teamspace)},"container":${JSON.stringify(container)},"revision":${JSON.stringify(UUIDToString(revision))},"objects":[`);

	let first = true;
	for (const matchedMeshGroup of matchedMeshGroups) {
		if (!unwantedIdsObj[matchedMeshGroup.id]) {
			if (!first) {
				stream.write(',');
			}

			stream.write(JSON.stringify(matchedMeshGroup));
			first = false;
		}
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

	await queueClashRun(teamspace, UUIDToString(project), UUIDToString(runId), stream);
	return runId;
};

module.exports = Clashes;
