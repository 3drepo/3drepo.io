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

export class ProjectsService {
	public static $inject: string[] = [
		"APIService"
	];

	constructor(private APIService) {}

	/**
	 * Return project details
	 * @param teamspace
	 * @param project
	 * @returns {*|promise}
	 */
	public getProject = (teamspace, project): Promise<any> => {
		return this.APIService.get(`${teamspace}/projects/${project}`);
	}
}

export const ProjectsServiceModule = angular
	.module("3drepo")
	.service("ProjectsService", ProjectsService);
