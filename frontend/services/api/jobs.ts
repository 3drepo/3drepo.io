/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import api from './';

/**
 * Get jobs list
 *
 * @param teamspace
 * @returns {*|promise}
 */
export const getJobs = (teamspace): Promise<any> => {
	return api.get(`${teamspace}/jobs`);
};

/**
 * Get jobs colors list
 *
 * @param teamspace
 * @returns {*|promise}
 */
export const getJobsColors = (teamspace): Promise<any> => {
	return api.get(`${teamspace}/jobs/colors`);
};

/**
 * Create new job
 *
 * @param teamspace
 * @param job
 * @returns {*|promise}
 */
export const createJob = (teamspace, job): Promise<any> => {
	return api.post(`${teamspace}/jobs`, job);
};

/**
 * Delete job by id
 *
 * @param teamspace
 * @param jobId
 * @returns {*|promise}
 */
export const deleteJob = (teamspace, jobId): Promise<any> => {
	return api.delete(`${teamspace}/jobs/${jobId}`);
};

/**
 * Update job by id
 *
 * @param teamspace
 * @param jobId
 * @returns {*|promise}
 */
export const updateJob = (teamspace, job): Promise<any> => {
	return api.put(`${teamspace}/jobs/${job._id}`, job);
};

export const getMyJob = (teamspace): Promise<any> => {
	return api.get(`${teamspace}/myJob`);
};
