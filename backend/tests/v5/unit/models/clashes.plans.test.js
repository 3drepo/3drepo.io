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

const { isObject, isUUID } = require('../../../../src/v5/utils/helper/typeCheck');
const { src } = require('../../helper/path');
const { generateRandomString, determineTestGroup, generateRandomObject, generateUUID } = require('../../helper/services');

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
			const project = generateUUID();
			const planId = generateRandomString();

			await expect(ClashPlans.getPlanById(teamspace, project, planId))
				.resolves.toEqual(data);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project }, { project: 0 });
		});

		test('should throw clash plan not found if it is not available', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const projection = { _id: 1 };

			await expect(ClashPlans.getPlanById(teamspace, project, planId, projection))
				.rejects.toEqual(templates.clashPlanNotFound);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project }, projection);
		});
	});
};

const testGetPlanByName = () => {
	describe('Get plan by name', () => {
		test('should return a plan if there is a match', async () => {
			const data = { _id: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(data);
			const teamspace = generateRandomString();
			const project = generateUUID();
			const name = generateRandomString();

			await expect(ClashPlans.getPlanByName(teamspace, project, name))
				.resolves.toEqual(data);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { name, project }, { project: 0 });
		});

		test('should throw clash plan not found if it is not available', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const teamspace = generateRandomString();
			const project = generateUUID();
			const name = generateRandomString();
			const projection = { _id: 1 };

			await expect(ClashPlans.getPlanByName(teamspace, project, name, projection))
				.rejects.toEqual(templates.clashPlanNotFound);

			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { name, project }, projection);
		});
	});
};

const testCreatePlan = () => {
	describe('Create plan', () => {
		test('should create a plan and return its id', async () => {
			const insertFn = jest.spyOn(db, 'insertOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const project = generateUUID();
			const user = generateRandomString();
			const data = generateRandomObject();

			const res = await ClashPlans.createPlan(teamspace, project, data, user);

			const { _id, createdAt } = insertFn.mock.calls[0][2];
			expect(insertFn).toHaveBeenCalledTimes(1);
			expect(insertFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL,
				{ ...data, project, _id, createdAt, createdBy: user });
			expect(res).toEqual(_id);
		});
	});
};

const testUpdatePlan = () => {
	describe('Update plan', () => {
		test('should update a plan and return its id', async () => {
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const user = generateRandomString();
			const data = generateRandomObject();

			await ClashPlans.updatePlan(teamspace, project, planId, data, user);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project },
				{ $set: { ...data, updatedAt, updatedBy: user } });
		});

		test('Should unset fields with null values', async () => {
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const user = generateRandomString();
			const data = { [generateRandomString()]: null, [generateRandomString()]: 'value' };

			await ClashPlans.updatePlan(teamspace, project, planId, data, user);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			const expectedData = { $set: { updatedAt, updatedBy: user }, $unset: {} };

			Object.keys(data).forEach((key) => {
				if (data[key] === null) {
					expectedData.$unset[key] = 1;
				} else {
					expectedData.$set[key] = data[key];
				}
			});
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project },
				expectedData);
		});
		test('Should have a combination of $set and $unset if there are both null and non-null fields', async () => {
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const user = generateRandomString();
			const data = { [generateRandomString()]: null, [generateRandomString()]: null, ...generateRandomObject() };

			await ClashPlans.updatePlan(teamspace, project, planId, data, user);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			const expectedData = { $set: { updatedAt, updatedBy: user }, $unset: {} };

			Object.keys(data).forEach((key) => {
				if (data[key] === null) {
					expectedData.$unset[key] = 1;
				} else {
					expectedData.$set[key] = data[key];
				}
			});

			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project },
				expectedData);
		});

		test('should work with nested objects and unset nested fields with null values', async () => {
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const user = generateRandomString();
			const data = {
				field1: null,
				field2: 'value',
				nested: {
					nestedField1: null,
					nestedField2: 'nestedValue',
				},
			};

			await ClashPlans.updatePlan(teamspace, project, planId, data, user);
			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			const expectedData = { $set: { updatedAt, updatedBy: user }, $unset: {} };

			Object.keys(data).forEach((key) => {
				if (data[key] === null) {
					expectedData.$unset[key] = 1;
				} else if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
					Object.keys(data[key]).forEach((nestedKey) => {
						if (data[key][nestedKey] === null) {
							expectedData.$unset[`${key}.${nestedKey}`] = 1;
						} else {
							expectedData.$set[`${key}.${nestedKey}`] = data[key][nestedKey];
						}
					});
				} else {
					expectedData.$set[key] = data[key];
				}
			});

			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project },
				expectedData);
		});

		test('should not try to recurse on the object if the data is a UUID', async () => {
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValue();
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const user = generateRandomString();
			const data = { field1: generateRandomString(), field2: generateUUID(), nested: { field: generateUUID() } };

			await ClashPlans.updatePlan(teamspace, project, planId, data, user);
			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			const expectedData = { $set: { updatedAt, updatedBy: user } };
			Object.keys(data).forEach((key) => {
				if (data[key] === null) {
					expectedData.$unset[key] = 1;
				} else if (isObject(data[key]) && !isUUID(data[key]) && !Array.isArray(data[key])) {
					Object.keys(data[key]).forEach((nestedKey) => {
						if (data[key][nestedKey] === null) {
							expectedData.$unset[`${key}.${nestedKey}`] = 1;
						} else {
							expectedData.$set[`${key}.${nestedKey}`] = data[key][nestedKey];
						}
					});
				} else {
					expectedData.$set[key] = data[key];
				}
			});

			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project },
				expectedData);
		});
	});
};

const testDeletePlan = () => {
	describe('Delete plan', () => {
		test('should delete a plan', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const deleteFn = jest.spyOn(db, 'deleteOne').mockResolvedValueOnce(undefined);

			await ClashPlans.deletePlan(teamspace, project, planId);

			expect(deleteFn).toHaveBeenCalledTimes(1);
			expect(deleteFn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { _id: planId, project });
		});
	});
};

const testGetAllPlans = () => {
	describe('Get all plans', () => {
		const teamspace = generateRandomString();
		const project = generateUUID();

		test('should call find with project filter and summary projection, and return plans', async () => {
			const plans = [
				{ _id: generateUUID(), name: generateRandomString(), type: generateRandomString() },
				{ _id: generateUUID(), name: generateRandomString(), type: generateRandomString() },
			];
			const projection = {
				selectionA: 0,
				selectionB: 0,
				tolerance: 0,
				selfIntersectionsCheck: 0,
				trigger: 0,
				tickets: 0,
				project: 0,
			};
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(plans);

			await expect(ClashPlans.getAllPlans(teamspace, project)).resolves.toEqual(plans);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { project }, projection);
		});

		test('should reject when find fails', async () => {
			const error = new Error(generateRandomString());
			const projection = {
				selectionA: 0,
				selectionB: 0,
				tolerance: 0,
				selfIntersectionsCheck: 0,
				trigger: 0,
				tickets: 0,
				project: 0,
			};
			const fn = jest.spyOn(db, 'find').mockRejectedValueOnce(error);

			await expect(ClashPlans.getAllPlans(teamspace, project)).rejects.toEqual(error);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, CLASH_PLANS_COL, { project }, projection);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetPlanById();
	testGetPlanByName();
	testCreatePlan();
	testUpdatePlan();
	testDeletePlan();
	testGetAllPlans();
});
