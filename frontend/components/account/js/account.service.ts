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

export class AccountService {

	public static $inject: string[] = [
		"$q",
		"APIService",
	];

	public accountDefer;

	constructor(
		private $q,
		private APIService,
	) {
		this.accountDefer = $q.defer();
	}

	public isDuplicateFederation(teamspaces, teamspaceName, projectName, name) {

		let duplicate = false;

		const feds = this.getFederationsByProjectName(teamspaces, teamspaceName, projectName);
		feds.forEach((fed) => {
			if (fed.name === name) {
				duplicate = true;
			}
		});

		return duplicate;
	}

	public getFederationsByProjectName(teamspaces, teamspaceName, projectName) {
		const project = this.getProject(teamspaces, teamspaceName, projectName);
		return project.models.filter((model) => {
			return model.subModels;
		});
	}

	public getIndividualModelsByProjectName(teamspaces, teamspaceName, projectName) {
		const project = this.getProject(teamspaces, teamspaceName, projectName);
		return project.models.filter((model) =>  {
			return !model.subModels;
		});
	}

	public getIndividualTeamspaceModels(teamspaces, teamspaceName) {
		const teamspace = this.getTeamspaceByName(teamspaces, teamspaceName);
		return teamspace.models.filter((model) =>  {
			return !model.subModels;
		});
	}

	public hasFederations(models) {
		return this.getFederations(models).length > 0;
	}

	public getFederations(models) {
		return models.filter((model) =>  {
			return model.subModels;
		});
	}

	public getIndividualModels(models) {
		return models.filter((model) =>  {
			return !model.subModels;
		});
	}

	public removeProjectInTeamspace(teamspaces, teamspaceName, projectName) {
		const teamspace = this.getTeamspaceByName(teamspaces, teamspaceName);
		teamspace.projects.forEach((project, i) => {
			if (projectName === project.name) {
				teamspace.projects.splice(i, 1);
			}
		});
	}

	public renameProjectInTeamspace(teamspaces, teamspaceName, newProjectName, oldProjectName) {
		const teamspace = this.getTeamspaceByName(teamspaces, teamspaceName);
		teamspace.projects.forEach((project) => {
			if (project.name === oldProjectName) {
				project.name = newProjectName;
			}
		});
	}

	public addProjectToTeamspace(teamspaces, teamspaceName, project) {
		const teamspace = this.getTeamspaceByName(teamspaces, teamspaceName);
		teamspace.projects.push(project);
	}

	public getProjectsByTeamspaceName(teamspaces, name) {

		let projects = [];
		teamspaces.forEach((teamspace) => {
			if (teamspace.name === name) {
				projects = teamspace.projects;
			}
		});

		projects.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}

			if (a.name > b.name) {
				return 1;
			}

			return 0;

		});

		return projects;

	}

	public getTeamspaceByName(teamspaces: any[], name: string) {
		return teamspaces.filter((teamspace) => {
			return teamspace.name === name;
		})[0];
	}

	public isSubModel(federation: any, model: any) {
		let isSubModelOfFed = false;
		federation.subModels.forEach((submodel) => {
			if (submodel.model === model.model) {
				isSubModelOfFed = true;
			}
		});
		return isSubModelOfFed;
	}

	public getNoneFederatedModels(federation, models) {
		return models.filter((model) => {
			return !this.isSubModel(federation, model);
		});
	}

	public removeFromFederation(federation, modelId) {

		federation.subModels.forEach((submodel, i) => {
			if (submodel.model === modelId) {
				federation.subModels.splice(i, 1);
			}
		});

	}

	public getProject(teamspaces, teamspaceName, projectName) {

		// Return models that are not federated (federations)
		const selectedTeamspace = teamspaces.filter((teamspace) => {
			return teamspace.name === teamspaceName;
		})[0];

		const selectedProject = selectedTeamspace.projects.filter((project) => {
			return project.name === projectName;
		})[0];

		return selectedProject;

	}

	public getModel(teamspaces, teamspaceName, projectName, id) {
		return this.getModels(teamspaces, teamspaceName, projectName).find((model) => {
			return model.model === id;
		});
	}

	public getModels(teamspaces, teamspaceName, projectName) {
		return this.getProject(teamspaces, teamspaceName, projectName).models;
	}

	public removeModelByProjectName(teamspaces, teamspaceName, projectName, modelName) {
		const models = this.getModels(teamspaces, teamspaceName, projectName);
		const project = this.getProject(teamspaces, teamspaceName, projectName);
		models.forEach((model, i) => {
			if (model.model === modelName) {
				project.models.splice(i, 1);
			}
		});
	}

	public removeFromFederationByProjectName(teamspaces, teamspaceName, projectName, modelName) {
		const federations = this.getFederationsByProjectName(teamspaces, teamspaceName, projectName);
		federations.forEach((model, i) => {
			if (model.model === modelName) {
				model.subModels.splice(i, 1);
			}
		});
	}

	/**
	 * Update the user info
	 *
	 * @param username
	 * @param info
	 */
	public updateInfo(username, info): Promise<any> {
		return this.APIService.put(username, info);
	}

	/**
	 * Update the user password
	 *
	 * @param username
	 * @param passwords
	 * @returns
	 */
	public updatePassword(username, passwords): Promise<any> {
		return this.APIService.put(username, passwords);
	}

	/**
	 * Create a new subscription
	 *
	 * @param teamspace
	 * @param data
	 * @returns {*|promise}
	 */
	public newSubscription(teamspace, data): Promise<any> {
		return this.APIService.post(teamspace + "/subscriptions", data);
	}

	/**
	 * Get user info
	 *
	 * @param username
	 * @returns {*|promise}
	 */
	public getUserInfo(username): Promise<any> {
		const currentAccount = this.APIService.get(username + ".json");
		this.accountDefer.resolve(currentAccount);
		return currentAccount;
	}

}

export const AccountServiceModule = angular
	.module("3drepo")
	.service("AccountService", AccountService);
