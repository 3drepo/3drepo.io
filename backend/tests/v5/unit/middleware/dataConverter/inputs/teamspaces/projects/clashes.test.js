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

const { src } = require('../../../../../../helper/path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../../../../src/v5/schemas/projects/clashes');
const ClashesSchema = require(`${src}/schemas/projects/clashes`);

jest.mock('../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

const Clashes = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/clashes`);

const { templates } = require(`${src}/utils/responseCodes`);
const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../../../../../helper/services');

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateNewPlanData = () => {
	describe('Validate new plan data', () => {
		test('should respond with error if validation is failed', async () => {
			const mockCB = jest.fn(() => {});
			const req = {
				params: { teamspace: generateRandomString(), project: generateRandomString() },
				body: generateRandomObject(),
			};
			ClashesSchema.validatePlan.mockRejectedValueOnce(templates.invalidArguments);

			await Clashes.validateNewPlanData(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashesSchema.validatePlan).toHaveBeenCalledTimes(1);
			expect(ClashesSchema.validatePlan)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.body);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.invalidArguments);
		});

		test('next() should be called if validation is successful', async () => {
			const mockCB = jest.fn(() => {});
			const req = {
				params: { teamspace: generateRandomString(), project: generateRandomString() },
				body: generateRandomObject(),
			};
			ClashesSchema.validatePlan.mockResolvedValueOnce(req.body);

			await Clashes.validateNewPlanData(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalled();
			expect(ClashesSchema.validatePlan).toHaveBeenCalledTimes(1);
			expect(ClashesSchema.validatePlan)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.body);
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

const testValidateUpdatePlanData = () => {
	describe('Check if plan exists', () => {
		test('should respond with error if plan does not exist', async () => {
			const mockCB = jest.fn(() => {});
			const req = {
				params: {
					teamspace: generateRandomString(),
					project: generateRandomString(),
					planId: generateRandomString(),
				},
				body: generateRandomObject(),
			};
			ClashPlansModel.getPlanById.mockRejectedValueOnce(templates.clashPlanNotFound);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
			expect(ClashesSchema.validatePlan).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.clashPlanNotFound);
		});

		test('next() should be called if the plan exists', async () => {
			const mockCB = jest.fn(() => {});
			const plan = generateRandomObject();
			const req = {
				params: {
					teamspace: generateRandomString(),
					project: generateRandomString(),
					planId: generateRandomString(),
				},
				body: generateRandomObject(),
			};
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ClashesSchema.validatePlan.mockResolvedValueOnce(req.body);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalled();
			expect(req.planData).toEqual(plan);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
			expect(ClashesSchema.validatePlan).toHaveBeenCalledTimes(1);
			expect(ClashesSchema.validatePlan).toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.body);
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('should respond with error if validation fails', async () => {
			const mockCB = jest.fn(() => {});
			const plan = generateRandomObject();
			const req = {
				params: {
					teamspace: generateRandomString(),
					project: generateRandomString(),
					planId: generateRandomString(),
				},
				body: generateRandomObject(),
			};
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ClashesSchema.validatePlan.mockRejectedValueOnce(templates.invalidArguments);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
			expect(ClashesSchema.validatePlan).toHaveBeenCalledTimes(1);
			expect(ClashesSchema.validatePlan).toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.body);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.invalidArguments);
		});

		test('should respond with error if there are no changes', async () => {
			const mockCB = jest.fn(() => {});
			const plan = generateRandomObject();
			const req = {
				params: {
					teamspace: generateRandomString(),
					project: generateRandomString(),
					planId: generateRandomString(),
				},
				body: plan,
			};
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ClashesSchema.validatePlan.mockResolvedValueOnce(req.body);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
			expect(ClashesSchema.validatePlan).toHaveBeenCalledTimes(1);
			expect(ClashesSchema.validatePlan).toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.body);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, { ...templates.invalidArguments, message: 'No valid properties to update' });
		});
	});
};

const testPlanExists = () => {
	describe('Check if plan exists', () => {
		test('should respond with error if plan does not exist', async () => {
			const mockCB = jest.fn(() => {});
			const req = {
				params: {
					teamspace: generateRandomString(),
					planId: generateRandomString(),
				},
			};
			ClashPlansModel.getPlanById.mockRejectedValueOnce(templates.clashPlanNotFound);

			await Clashes.planExists(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.clashPlanNotFound);
		});

		test('next() should be called if the plan exists', async () => {
			const mockCB = jest.fn(() => {});
			const plan = generateRandomObject();
			const req = {
				params: {
					teamspace: generateRandomString(),
					planId: generateRandomString(),
				},
			};
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);

			await Clashes.planExists(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalled();
			expect(req.planData).toEqual(plan);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById)
				.toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

const testPlanContainersHaveRevs = () => {
	describe('planContainersHaveRevs', () => {
		test('should assign latest revisions to selectionA and selectionB and call next()', async () => {
			const mockCB = jest.fn(() => {});
			const teamspace = generateRandomString();
			const containerA = generateRandomString();
			const containerB = generateRandomString();
			const revA = generateRandomString();
			const revB = generateRandomString();
			const req = {
				params: { teamspace },
				planData: {
					selectionA: { container: containerA },
					selectionB: { container: containerB },
				},
			};
			RevisionsModel.getLatestRevision
				.mockResolvedValueOnce({ _id: revA })
				.mockResolvedValueOnce({ _id: revB });

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerA, modelTypes.CONTAINER, { _id: 1 });
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerB, modelTypes.CONTAINER, { _id: 1 });
			expect(req.planData.selectionA.revision).toEqual(revA);
			expect(req.planData.selectionB.revision).toEqual(revB);

			expect(mockCB).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('should respond with error if a revision A is not found', async () => {
			const mockCB = jest.fn(() => {});
			const teamspace = generateRandomString();
			const containerA = generateRandomString();
			const containerB = generateRandomString();
			const req = {
				params: { teamspace },
				planData: {
					selectionA: { container: containerA },
					selectionB: { container: containerB },
				},
			};
			RevisionsModel.getLatestRevision.mockRejectedValueOnce(templates.revisionNotFound);

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerA, modelTypes.CONTAINER, { _id: 1 });

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			const { message, ...invalidArgRes } = templates.invalidArguments;
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, expect.objectContaining(invalidArgRes));

			expect(mockCB).not.toHaveBeenCalled();
		});

		test('should respond with error if a revision B is not found', async () => {
			const mockCB = jest.fn(() => {});
			const teamspace = generateRandomString();
			const containerA = generateRandomString();
			const containerB = generateRandomString();
			const revA = generateRandomString();
			const req = {
				params: { teamspace },
				planData: {
					selectionA: { container: containerA },
					selectionB: { container: containerB },
				},
			};

			RevisionsModel.getLatestRevision.mockResolvedValueOnce({ _id: revA });
			RevisionsModel.getLatestRevision.mockRejectedValueOnce(templates.revisionNotFound);

			await Clashes.planContainersHaveRevs(req, {}, mockCB);

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerA, modelTypes.CONTAINER, { _id: 1 });
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, containerB, modelTypes.CONTAINER, { _id: 1 });

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			const { message, ...invalidArgRes } = templates.invalidArguments;
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, expect.objectContaining(invalidArgRes));

			expect(mockCB).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateNewPlanData();
	testValidateUpdatePlanData();
	testPlanExists();
	testPlanContainersHaveRevs();
});
