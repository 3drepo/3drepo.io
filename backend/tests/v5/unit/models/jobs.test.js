/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const { generateRandomString, generateRandomObject } = require('../../helper/services');
const { DEFAULT_JOBS } = require('../../../../src/v5/models/jobs.constants');
const { times } = require('lodash');

const Jobs = require(`${src}/models/jobs`);
const db = require(`${src}/handler/db`);

const JOB_COL = 'jobs';

const testGetJobsToUsers = () => {
	describe('Get Jobs to users', () => {
		test('should get list of jobs within the teamspace with the users', async () => {
			const expectedResult = [
				{ _id: 'jobA', users: ['a', 'b', 'c'] },
			];
			const fn = jest.spyOn(db, 'find').mockImplementation(() => expectedResult);
			const teamspace = 'ts';
			const res = await Jobs.getJobsToUsers(teamspace);
			expect(res).toEqual(expectedResult);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][1]).toEqual(JOB_COL);
			expect(fn.mock.calls[0][2]).toEqual({});
		});
	});
};

const testAddDefaultJobs = () => {
	describe('Add default jobs', () => {
		test('should add the default jobs', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'insertMany').mockImplementation(() => {});
			await Jobs.addDefaultJobs(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, JOB_COL, DEFAULT_JOBS.map((job) => ({ ...job, users: [] })));
		});
	});
};

const testAssignUserToJob = () => {
	describe('Assign user to job', () => {
		test('should assign a user to a job', async () => {
			const teamspace = generateRandomString();
			const job = generateRandomString();
			const username = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			await Jobs.assignUserToJob(teamspace, job, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, JOB_COL, { _id: job }, { $push: { users: username } });
		});
	});
};

const testRemoveUserFromJobs = () => {
	describe('Remove user from job', () => {
		test('should remove user from jobs', async () => {
			const teamspace = generateRandomString();
			const userToRemove = generateRandomString();
			const fn = jest.spyOn(db, 'updateMany').mockImplementation(() => {});
			await Jobs.removeUserFromJobs(teamspace, userToRemove);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, JOB_COL,
				{ users: userToRemove }, { $pull: { users: userToRemove } });
		});
	});
};

const testGetJobsByUsers = () => {
	describe('Get jobs by users', () => {
		test('return names of all jobs thats users have access', async () => {
			const teamspace = generateRandomString();
			const users = times(5, () => generateRandomString());
			const jobs = times(5, () => ({ _id: generateRandomString, ...generateRandomObject() }));

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(jobs);
			await expect(Jobs.getJobsByUsers(teamspace, users)).resolves.toEqual(jobs.map((j) => j._id));
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, JOB_COL, { users: { $in: users } }, { _id: 1 }, undefined);
		});

		test('return an empty array if there are no jobs', async () => {
			const teamspace = generateRandomString();
			const users = times(5, () => generateRandomString());

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			await expect(Jobs.getJobsByUsers(teamspace, users)).resolves.toEqual([]);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, JOB_COL, { users: { $in: users } }, { _id: 1 }, undefined);
		});
	});
};

const testGetJobs = () => {
	describe('Get jobs', () => {
		test('return all available jobs', async () => {
			const teamspace = generateRandomString();
			const jobs = [generateRandomString(), generateRandomString(), generateRandomString()];
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(jobs);
			await expect(Jobs.getJobs(teamspace)).resolves.toEqual(jobs);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, JOB_COL, {}, { _id: 1, color: 1 }, undefined);
		});

		test('return an empty array if there are no jobs', async () => {
			const teamspace = generateRandomString();
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			await expect(Jobs.getJobs(teamspace)).resolves.toEqual([]);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, JOB_COL, {}, { _id: 1, color: 1 }, undefined);
		});
	});
};

describe('models/jobs', () => {
	testGetJobsToUsers();
	testAddDefaultJobs();
	testAssignUserToJob();
	testRemoveUserFromJobs();
	testGetJobsByUsers();
	testGetJobs();
});
