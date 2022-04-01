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
const { generateRandomString } = require('../../helper/services');
const { DEFAULT_JOBS } = require('../../../../src/v5/models/jobs.constants');

const Jobs = require(`${src}/models/jobs`);
const db = require(`${src}/handler/db`);

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
			expect(fn.mock.calls[0][1]).toEqual('jobs');
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
			expect(fn).toHaveBeenCalledWith(teamspace, 'jobs', DEFAULT_JOBS.map((job) => ({ ...job, users: [] })));
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
			expect(fn).toHaveBeenCalledWith(teamspace, 'jobs', { _id: job }, { $push: { users: username } });
		});
	});
};

describe('models/jobs', () => {
	testGetJobsToUsers();
	testAddDefaultJobs();
	testAssignUserToJob();
});
