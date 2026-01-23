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

const { src } = require('../../helper/path');
const { generateRandomString, determineTestGroup, generateRandomObject } = require('../../helper/services');

const { CLASH_PLANS_COL } = require(`${src}/models/clashes.constants`);
const ClashPlans = require(`${src}/models/clashes.plans`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetPlanById = () => {
	describe('Get plan by Id', () => {
		test('should return a plan if there is a match', async () => {
			const data = { _id: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(data);
			const teamspace = generateRandomString();
			const planId = generateRandomString();
			const projection = { _id: 1 };

			await expect(ClashPlans.getPlanById(teamspace, planId, projection))
				.resolves.toEqual(data);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId }, projection);
		});

		test('should throw clash plan not found if it is not available', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const teamspace = generateRandomString();
			const planId = generateRandomString();
			const projection = { _id: 1 };

			await expect(ClashPlans.getPlanById(teamspace, planId, projection))
				.rejects.toEqual(templates.clashPlanNotFound);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId }, projection);
		});
	});
};

const testGetPlanByName = () => {
	describe('Get plan by name', () => {
		test('should return a plan if there is a match', async () => {
			const data = { _id: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(data);
			const teamspace = generateRandomString();
			const name = generateRandomString();
			const projection = { _id: 1 };

			await expect(ClashPlans.getPlanByName(teamspace, name, projection))
				.resolves.toEqual(data);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { name }, projection);
		});

		test('should throw clash plan not found if it is not available', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const teamspace = generateRandomString();
			const name = generateRandomString();
			const projection = { _id: 1 };

			await expect(ClashPlans.getPlanByName(teamspace, name, projection))
				.rejects.toEqual(templates.clashPlanNotFound);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { name }, projection);
		});
	});
};

const testCreatePlan = () => {
	describe('Create plan', () => {
		test('should create a plan and return its id', async () => {
			const insertFn = jest.spyOn(db, 'insertOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const user = generateRandomString();
			const data = generateRandomObject();

			const res = await ClashPlans.createPlan(teamspace, data, user);

			const { _id, createdAt } = insertFn.mock.calls[0][2];
			expect(insertFn).toHaveBeenCalledTimes(1);
			expect(insertFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL,
				{ ...data, _id, createdAt, createdBy: user });
			expect(res).toEqual(_id);
		});
	});
};

const testUpdatePlan = () => {
	describe('Update plan', () => {
		test('should update a plan and return its id', async () => {
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const planId = generateRandomString();
			const user = generateRandomString();
			const data = generateRandomObject();

			await ClashPlans.updatePlan(teamspace, planId, data, user);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId },
				{ $set: { ...data, updatedAt, updatedBy: user } });
		});
	});
};

const testDeletePlan = () => {
	describe('Delete plan', () => {
		test('should delete a plan', async () => {
			const teamspace = generateRandomString();
			const planId = generateRandomString();
			const deleteFn = jest.spyOn(db, 'deleteOne').mockResolvedValueOnce(undefined);

			await ClashPlans.deletePlan(teamspace, planId);

			expect(deleteFn).toHaveBeenCalledTimes(1);
			expect(deleteFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetPlanById();
	testGetPlanByName();
	testCreatePlan();
	testUpdatePlan();
	testDeletePlan();
});
