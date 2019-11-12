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

import { normalize } from 'normalizr';
import { all, put, select, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { selectStarredModels, StarredActions } from '../starred';
import { UserManagementActions } from '../userManagement';
import { TeamspacesActions, TeamspacesTypes } from './teamspaces.redux';
import { teamspacesSchema } from './teamspaces.schema';
import { selectProjects } from './teamspaces.selectors';

export function* fetchTeamspaces({ username }) {
	try {
		yield put(TeamspacesActions.setPendingState(true));
		const teamspaces = (yield API.fetchTeamspace(username)).data.accounts;
		const normalizedData = normalize(teamspaces, [teamspacesSchema]);

		yield put(TeamspacesActions.fetchTeamspacesSuccess(normalizedData.entities));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'team spaces', e));
	}

	yield put(TeamspacesActions.setPendingState(false));
}

export function* leaveTeamspace({ teamspace }) {
	try {
		const { username } = yield select( selectCurrentUser );
		yield API.removeUserCascade(teamspace, username);
		yield put(UserManagementActions.removeUserSuccess(username));
		yield put(TeamspacesActions.removeTeamspaceSuccess(teamspace));
		yield put(SnackbarActions.show(`User removed from ${teamspace} successfully.`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('leave', 'teamspace', error));
	}
}

// Projects
export function* createProject({ teamspace, projectData }) {
	try {
		const response = yield API.createProject(teamspace, projectData);

		yield put(SnackbarActions.show('Project created'));

		yield put(TeamspacesActions.createProjectSuccess(teamspace, response.data));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'project', e));
	}
}

export function* updateProject({ teamspace, projectId, projectData }) {
	try {
		const projects = yield select(selectProjects);
		yield API.updateProject(teamspace, projects[projectId].name, projectData);

		const updatedProject = { ...projects[projectData._id], ...projectData };

		yield put(SnackbarActions.show('Project updated'));
		yield put(TeamspacesActions.updateProjectSuccess(updatedProject));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'project', e));
	}
}

export function* removeProject({ teamspace, projectId }) {
	try {
		const projects = yield select(selectProjects);
		const projectDetails = projects[projectId];

		yield API.removeProject(teamspace, projectDetails.name);

		if (projectDetails.models.length) {
			const starredModelsMap = yield select(selectStarredModels);

			const starredModelsToRemove = [];
			projectDetails.models.forEach((model) => {
				const isStarredModel = starredModelsMap[`${teamspace}/${model}`];

				if (isStarredModel) {
					const starredModel = { model, teamspace };
					starredModelsToRemove.push(starredModel);
				}
			});

			if (starredModelsToRemove.length) {
				yield all(starredModelsToRemove.map((model) => {
					return put(StarredActions.removeFromStarredModels(model));
				}));
			}
		}

		yield put(SnackbarActions.show('Project removed'));
		yield put(TeamspacesActions.removeProjectSuccess(teamspace, projectId));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'project', e));
	}
}

// Models
export function* createModel({ teamspace, modelData }) {
	try {
		const response = yield API.createModel(teamspace, modelData);
		const createdModel = {
			...response.data.setting,
			permissions: response.data.permissions,
			model: response.data.model,
			projectName: modelData.project,
			subModels: modelData.subModels
		};

		yield put(SnackbarActions.show(`${modelData.federate ? 'Federation' : 'Model'} created`));
		yield put(TeamspacesActions.createModelSuccess(teamspace, createdModel));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'model', e));
	}
}

export function* updateModel({ teamspace, modelId, modelData }) {
	try {
		const response = yield API.updateModel(teamspace, modelId, modelData);
		const updatedModel = {
			...response.data.setting,
			project: modelData.project,
			subModels: modelData.subModels
		};

		yield put(TeamspacesActions.updateModelSuccess(teamspace, modelId, updatedModel));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'model', e));
	}
}

export function* removeModel({ teamspace, modelData }) {
	try {
		const { data: removedModel } = yield API.removeModel(teamspace, modelData.id);
		const starredModelsMap = yield select(selectStarredModels);
		const isStarredModel = starredModelsMap[`${teamspace}/${modelData.id}`];

		if (isStarredModel) {
			const starredModel = {
				model: modelData.id,
				name: modelData.name,
				teamspace
			};

			yield put(StarredActions.removeFromStarredModels(starredModel));
		}

		const projects = yield select(selectProjects);

		yield put(SnackbarActions.show(`${removedModel.federate ? 'Federation' : 'Model'} removed`));
		yield put(TeamspacesActions.removeModelSuccess(
			teamspace, {
				...removedModel,
				projectName: projects[modelData.project].name,
				name: modelData.name
			})
		);
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'model', e));
	}
}

export default function* TeamspacesSaga() {
	yield takeLatest(TeamspacesTypes.FETCH_TEAMSPACES, fetchTeamspaces);
	yield takeLatest(TeamspacesTypes.LEAVE_TEAMSPACE, leaveTeamspace);

	// Projects
	yield takeLatest(TeamspacesTypes.CREATE_PROJECT, createProject);
	yield takeLatest(TeamspacesTypes.UPDATE_PROJECT, updateProject);
	yield takeLatest(TeamspacesTypes.REMOVE_PROJECT, removeProject);
	// Models
	yield takeLatest(TeamspacesTypes.CREATE_MODEL, createModel);
	yield takeLatest(TeamspacesTypes.UPDATE_MODEL, updateModel);
	yield takeLatest(TeamspacesTypes.REMOVE_MODEL, removeModel);
}
