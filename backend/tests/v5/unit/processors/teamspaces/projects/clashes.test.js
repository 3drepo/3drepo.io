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

const { times } = require('lodash');
const { src } = require('../../../../helper/path');

const { generateRandomString, determineTestGroup, generateRandomNumber, generateRandomObject } = require('../../../../helper/services');

jest.mock('../../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../../src/v5/models/clashes.runs');
const ClashRunsModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../../src/v5/services/clashProcessing');
const ClashProcessing = require(`${src}/services/clashProcessing`);

jest.mock('../../../../../../src/v5/processors/teamspaces/projects/models/commons/scenes');
const Scenes = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

jest.mock('../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

const { SELF_INTERSECTIONS_CHECK_OPTIONS } = require(`${src}/models/clashes.constants`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { CLASH_PLAN_TYPES } = require(`${src}/models/clashes.constants`);

const Clashes = require(`${src}/processors/teamspaces/projects/clashes`);

const testCreatePlan = () => {
	describe('Create Plan', () => {
		test('should call createPlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const data = generateRandomString();
			ClashPlansModel.createPlan.mockResolvedValueOnce(data);

			await expect(Clashes.createPlan(teamspace, data)).resolves.toEqual(data);

			expect(ClashPlansModel.createPlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.createPlan).toHaveBeenCalledWith(teamspace, data);
		});
	});
};

const testUpdatePlan = () => {
	describe('Update Plan', () => {
		test('should call updatePlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const planId = generateRandomString();
			const data = generateRandomString();
			const user = generateRandomString();

			await Clashes.updatePlan(teamspace, planId, data, user);

			expect(ClashPlansModel.updatePlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.updatePlan).toHaveBeenCalledWith(teamspace, planId, data, user);
		});
	});
};

const testDeletePlan = () => {
	describe('Delete Plan', () => {
		test('should call deletePlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const planId = generateRandomString();

			await Clashes.deletePlan(teamspace, planId);

			expect(ClashPlansModel.deletePlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.deletePlan).toHaveBeenCalledWith(teamspace, planId);
		});
	});
};

const testCreateRun = () => {
	describe('Create a test run', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const planData = {
			type: CLASH_PLAN_TYPES[0],
			tolerance: generateRandomNumber(),
			selfIntersectionsCheck: false,
			selectionA: { container: generateRandomString(), revision: generateRandomString() },
			selectionB: { container: generateRandomString(),
				revision: generateRandomString(),
				rules: [generateRandomObject()],
			},
		};
		const userId = generateRandomString();
		const runId = generateRandomString();

		const checkStreamContent = (stream, expectedContent) => {
			const chunks = [];
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('end', () => {
				const content = Buffer.concat(chunks).toString();
				expect(content).toEqual(expectedContent);
			});
		};

		test('should create and queue the run when no nodes are matched', async () => {
			ClashRunsModel.createTestRun.mockResolvedValueOnce(runId);
			MetadataModel.getMetadataByRules.mockResolvedValueOnce({ matched: [], unwanted: [] });
			MetadataModel.getMetadataByRules.mockResolvedValueOnce({ matched: [], unwanted: [] });

			await Clashes.createRun(teamspace, project, planData, userId);

			expect(ClashRunsModel.createTestRun).toHaveBeenCalledWith(teamspace, planData, userId);
			expect(MetadataModel.getMetadataByRules).toHaveBeenCalledTimes(2);
			expect(MetadataModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project,
				planData.selectionA.container, planData.selectionA.revision, [], { _id: 1, parents: 1 });
			expect(MetadataModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project,
				planData.selectionB.container, planData.selectionB.revision,
				planData.selectionB.rules, { _id: 1, parents: 1 });
			expect(Scenes.getGroupedMeshesFromParentIds).not.toHaveBeenCalled();

			const stream = ClashProcessing.queueClashRun.mock.calls[0][3];
			expect(ClashProcessing.queueClashRun).toHaveBeenCalledWith(teamspace, UUIDToString(project),
				UUIDToString(runId), stream);

			checkStreamContent(stream, JSON.stringify({
				type: planData.type,
				tolerance: planData.tolerance,
				selfIntersectsA: false,
				selfIntersectsB: false,
				setA: {
					teamspace,
					container: planData.selectionA.container,
					revision: UUIDToString(planData.selectionA.revision),
					objects: [],
				},
				setB: {
					teamspace,
					container: planData.selectionB.container,
					revision: UUIDToString(planData.selectionB.revision),
					objects: [],
				},
			}));
		});

		const nodesA = times(5, () => ({ id: generateRandomString(), parents: [generateRandomString()] }));
		const nodesB = times(5, () => ({ id: generateRandomString(), parents: [generateRandomString()] }));

		describe.each([
			['plan has selfIntersectionsCheck set to selectionA', { ...planData, selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0] }],
			['plan has selfIntersectionsCheck set to selectionB', { ...planData, selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[1] }],
			['plan has selfIntersectionsCheck set to true', { ...planData, selfIntersectionsCheck: true }],
			['there are unwanted nodes for set A', undefined, nodesA.slice(0, 2)],
			['there are unwanted nodes for set B', undefined, undefined, nodesB.slice(0, 2)],
		])('Create a test run with rules', (desc, plan = planData, unwantedA = [], unwantedB = []) => {
			test(`should create and queue the run when ${desc}`, async () => {
				ClashRunsModel.createTestRun.mockResolvedValueOnce(runId);
				MetadataModel.getMetadataByRules.mockResolvedValueOnce({ matched: nodesA, unwanted: unwantedA });
				MetadataModel.getMetadataByRules.mockResolvedValueOnce({ matched: nodesB, unwanted: unwantedB });
				Scenes.getGroupedMeshesFromParentIds.mockResolvedValueOnce(nodesA);
				if (unwantedA.length) { Scenes.getGroupedMeshesFromParentIds.mockResolvedValueOnce(unwantedA); }
				Scenes.getGroupedMeshesFromParentIds.mockResolvedValueOnce(nodesB);
				if (unwantedB.length) { Scenes.getGroupedMeshesFromParentIds.mockResolvedValueOnce(unwantedB); }

				await Clashes.createRun(teamspace, project, plan, userId);

				expect(ClashRunsModel.createTestRun).toHaveBeenCalledWith(teamspace, plan, userId);
				expect(MetadataModel.getMetadataByRules).toHaveBeenCalledTimes(2);
				expect(MetadataModel.getMetadataByRules)
					.toHaveBeenCalledWith(teamspace, project, plan.selectionA.container,
						plan.selectionA.revision, [], { _id: 1, parents: 1 });
				expect(MetadataModel.getMetadataByRules)
					.toHaveBeenCalledWith(teamspace, project, plan.selectionB.container,
						plan.selectionB.revision, plan.selectionB.rules, { _id: 1, parents: 1 });

				const stream = ClashProcessing.queueClashRun.mock.calls[0][3];
				expect(ClashProcessing.queueClashRun).toHaveBeenCalledWith(teamspace, UUIDToString(project),
					UUIDToString(runId), stream);

				checkStreamContent(stream, JSON.stringify({
					type: plan.type,
					tolerance: plan.tolerance,
					selfIntersectsA: plan.selfIntersectionsCheck === true
					|| plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[0],
					selfIntersectsB: plan.selfIntersectionsCheck === true
					|| plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[1],
					setA: {
						teamspace,
						container: plan.selectionA.container,
						revision: UUIDToString(plan.selectionA.revision),
						objects: nodesA.filter((m) => !unwantedA.some((u) => u.id === m.id)),
					},
					setB: {
						teamspace,
						container: plan.selectionB.container,
						revision: UUIDToString(plan.selectionB.revision),
						objects: nodesB.filter((m) => !unwantedB.some((u) => u.id === m.id)),
					},
				}));
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreatePlan();
	testUpdatePlan();
	testDeletePlan();
	testCreateRun();
});
