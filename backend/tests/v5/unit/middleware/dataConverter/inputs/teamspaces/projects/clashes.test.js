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

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../src/v5/models/clashes');
const ClashesModel = require(`${src}/models/clashes`);

jest.mock('../../../../../../../../src/v5/schemas/projects/clashes');
const ClashesSchema = require(`${src}/schemas/projects/clashes`);

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
			ClashesModel.getPlanById.mockRejectedValueOnce(templates.clashPlanNotFound);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashesModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashesModel.getPlanById).toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
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
			ClashesModel.getPlanById.mockResolvedValueOnce(plan);
			ClashesSchema.validatePlan.mockResolvedValueOnce(req.body);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalled();
			expect(req.planData).toEqual(plan);
			expect(ClashesModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashesModel.getPlanById).toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
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
			ClashesModel.getPlanById.mockResolvedValueOnce(plan);
			ClashesSchema.validatePlan.mockRejectedValueOnce(templates.invalidArguments);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashesModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashesModel.getPlanById).toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
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
			ClashesModel.getPlanById.mockResolvedValueOnce(plan);
			ClashesSchema.validatePlan.mockResolvedValueOnce(req.body);

			await Clashes.validateUpdatePlanData(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(ClashesModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashesModel.getPlanById).toHaveBeenCalledWith(req.params.teamspace, req.params.planId, { _id: 0 });
			expect(ClashesSchema.validatePlan).toHaveBeenCalledTimes(1);
			expect(ClashesSchema.validatePlan).toHaveBeenCalledWith(req.params.teamspace, req.params.project, req.body);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, { ...templates.invalidArguments, message: 'No valid properties to update' });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateNewPlanData();
	testValidateUpdatePlanData();
});
