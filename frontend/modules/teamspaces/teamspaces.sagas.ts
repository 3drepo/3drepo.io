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

import { put, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { TeamspacesTypes, TeamspacesActions } from './teamspaces.redux';
import { SnackbarActions } from '../snackbar';
import { DialogActions } from '../dialog';

// Projects
export function* createProject({ teamspace, projectData }) {
	try {
		yield API.createProject(teamspace, projectData);

		yield put(SnackbarActions.show('Project created'));
		yield put(TeamspacesActions.createProjectSuccess(teamspace, projectData));
	} catch (e) {
		put(DialogActions.showErrorDialog('create', 'project', e.response));
	}
}

export function* updateProject({ teamspace, projectName, projectData }) {
	try {
		yield API.updateProject(teamspace, projectName, projectData);

		yield put(SnackbarActions.show('Project updated'));
		yield put(TeamspacesActions.updateProjectSuccess(teamspace, projectName, projectData));
	} catch (e) {
		put(DialogActions.showErrorDialog('update', 'project', e.response));
	}
}

export function* removeProject({ teamspace, projectName }) {
	try {
		yield API.removeProject(teamspace, projectName);

		yield put(SnackbarActions.show('Project removed'));
		yield put(TeamspacesActions.removeProjectSuccess(teamspace, projectName));
	} catch (e) {
		put(DialogActions.showErrorDialog('remove', 'project', e.response));
	}
}

// Models
export function* createModel({ teamspace, modelData }) {
	try {
		yield API.createModel(teamspace, modelData);

		yield put(SnackbarActions.show('Model created'));
		yield put(TeamspacesActions.createModelSuccess(teamspace, modelData));
	} catch (e) {
		put(DialogActions.showErrorDialog('create', 'model', e.response));
	}
}

export function* updateModel({ teamspace, modelName, modelData }) {
	try {
		yield API.updateModel(teamspace, modelName, modelData);

		yield put(SnackbarActions.show('Model updated'));
		yield put(TeamspacesActions.updateModelSuccess(teamspace, modelName, modelData));
	} catch (e) {
		put(DialogActions.showErrorDialog('update', 'model', e.response));
	}
}

export function* removeModel({ teamspace, modelName }) {
	try {
		yield API.removeModel(teamspace, modelName);

		yield put(SnackbarActions.show('Model removed'));
		yield put(TeamspacesActions.removeModelSuccess(teamspace, modelName));
	} catch (e) {
		put(DialogActions.showErrorDialog('remove', 'model', e.response));
	}
}

export default function* TeamspacesSaga() {
	// Projects
	yield takeLatest(TeamspacesTypes.CREATE_PROJECT, createProject);
	yield takeLatest(TeamspacesTypes.UPDATE_PROJECT, updateProject);
	yield takeLatest(TeamspacesTypes.REMOVE_PROJECT, removeProject);
	// Models
	yield takeLatest(TeamspacesTypes.CREATE_MODEL, createModel);
	yield takeLatest(TeamspacesTypes.UPDATE_MODEL, updateModel);
	yield takeLatest(TeamspacesTypes.REMOVE_MODEL, removeModel);
}
