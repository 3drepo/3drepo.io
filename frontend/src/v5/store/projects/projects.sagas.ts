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

import { put, select, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { ProjectsActions, ProjectsTypes } from './projects.redux';
import { IProject } from './projects.types';
import { selectContainers } from '../containers/containers.selectors';
import { selectFederations } from '../federations/federations.selectors';

export function* fetch({ teamspace }) {
	try {
		const { data: { projects } } = yield API.Projects.fetchProjects(teamspace);
		yield put(ProjectsActions.fetchSuccess(teamspace, projects as IProject[]));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'projects.fetch.error', defaultMessage: 'trying to fetch projects' }),
			error,
		}));
		yield put(ProjectsActions.fetchFailure());
	}
}

export function* createProject({ teamspace, projectName, onSuccess, onError }) {
	try {
		const projectId = yield API.Projects.createProject(teamspace, projectName);
		const project = {
			_id: projectId,
			name: projectName,
			isAdmin: true,
		};
		yield put(ProjectsActions.createProjectSuccess(teamspace, project));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* updateProject({ teamspace, projectId, project, onSuccess, onError }) {
	try {
		yield API.Projects.updateProject(teamspace, projectId, project);
		yield put(ProjectsActions.updateProjectSuccess(teamspace, projectId, project));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* deleteProject({ teamspace, projectId, onSuccess, onError }) {
	try {
		yield API.Projects.deleteProject(teamspace, projectId);
		yield put(ProjectsActions.deleteProjectSuccess(teamspace, projectId));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* fetchTemplates({ teamspace, projectId }) {
	try {
		let isFed = false;
		let model = (yield select(selectContainers))?.[0];
		if (!model) {
			isFed = true;
			model = (yield select(selectFederations))?.[0];
		}
		if (!model) {
			throw new Error(
				formatMessage({
					id: 'projects.error.noModels',
					defaultMessage: 'The project must contain at least one container or federation to fetch the templates',
				}),
			);
		}
		const fetchModelTemplates = isFed ? API.Tickets.fetchFederationTemplates : API.Tickets.fetchContainerTemplates;
		const templates = yield fetchModelTemplates(teamspace, projectId, model._id);
		yield put(ProjectsActions.fetchTemplatesSuccess(projectId, templates));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'projects.fetchTemplates.error.action',
				defaultMessage: 'fetching the templates',
			}),
			error,
		}));
	}
}

export default function* ProjectsSaga() {
	yield takeLatest(ProjectsTypes.FETCH as any, fetch);
	yield takeLatest(ProjectsTypes.CREATE_PROJECT as any, createProject);
	yield takeLatest(ProjectsTypes.UPDATE_PROJECT as any, updateProject);
	yield takeLatest(ProjectsTypes.DELETE_PROJECT as any, deleteProject);
	yield takeLatest(ProjectsTypes.FETCH_TEMPLATES as any, fetchTemplates);
}
