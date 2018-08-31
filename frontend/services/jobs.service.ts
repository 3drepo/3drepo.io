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

export class JobsService {
	public static $inject: string[] = [
		"APIService"
	];

	constructor(private APIService) {}

	/**
	 * Get jobs list
	 *
	 * @param teamspace
	 * @returns {*|promise}
	 */
	public getList(teamspace): Promise<any> {
		return this.APIService.get(`${teamspace}/jobs`);
	}

	/**
	 * Get jobs colors list
	 *
	 * @param teamspace
	 * @returns {*|promise}
	 */
	public getColors(teamspace): Promise<any> {
		return this.APIService.get(`${teamspace}/jobs/colors`);
	}

	/**
	 * Create new job
	 *
	 * @param teamspace
	 * @param job
	 * @returns {*|promise}
	 */
	public create(teamspace, job): Promise<any> {
		return this.APIService.post(`${teamspace}/jobs`, job);
	}

	/**
	 * Delete job by id
	 *
	 * @param teamspace
	 * @param jobId
	 * @returns {*|promise}
	 */
	public delete(teamspace, jobId): Promise<any> {
		return this.APIService.delete(`${teamspace}/jobs/${jobId}`);
	}

	/**
	 * Update job by id
	 *
	 * @param teamspace
	 * @param jobId
	 * @returns {*|promise}
	 */
	public update(teamspace, job): Promise<any> {
		return this.APIService.put(`${teamspace}/jobs/${job._id}`, job);
	}
}

export const JobsServiceModule = angular
	.module("3drepo")
	.service("JobsService", JobsService);
