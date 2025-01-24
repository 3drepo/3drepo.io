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

const { src } = require('../../../helper/path');

const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

const Jobs = require(`${src}/processors/teamspaces/jobs`);

const testGetJobs = () => {
	describe('Get jobs', () => {
		test('should call getJobs with the teamspace provided', async () => {
			const teamspace = generateRandomString();
			const data = generateRandomString();
			JobsModel.getJobs.mockResolvedValueOnce(data);
			await expect(Jobs.getJobs(teamspace)).resolves.toEqual(data);

			expect(JobsModel.getJobs).toHaveBeenCalledTimes(1);
			expect(JobsModel.getJobs).toHaveBeenCalledWith(teamspace);
		});
	});
};

describe('processors/teamspaces/jobs', () => {
	testGetJobs();
});
