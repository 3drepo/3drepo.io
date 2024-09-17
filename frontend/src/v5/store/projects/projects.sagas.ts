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
import { FetchProjectsAction, ProjectsActions, ProjectsTypes } from './projects.redux';
import { IProject } from './projects.types';
import { selectContainers } from '../containers/containers.selectors';
import { selectFederationById, selectFederations } from '../federations/federations.selectors';
import { RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE } from '../store.helpers';
import { TeamspacesActions } from '../teamspaces/teamspaces.redux';

export function* fetch({ teamspace }: FetchProjectsAction) {
	try {
		const addOns = yield API.Teamspaces.fetchAddons(teamspace);
		yield put(TeamspacesActions.fetchAddOnsSuccess(teamspace, addOns));
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

function * updateImage({ teamspace, projectId, image }) {
	const formData = new FormData();
	formData.append('file', image);
	yield API.Projects.updateProjectImage(teamspace, projectId, formData);
}

export function* createProject({ teamspace, project, onSuccess, onImageError, onError }) {
	const { name, image } = project;
	let projectId;
	let newProject;
	try {
		projectId = yield API.Projects.createProject(teamspace, name);

		newProject = {
			_id: projectId,
			name,
			isAdmin: true,
		};
		
		if (image) {
			yield updateImage({ teamspace, projectId, image });
		}
		
		yield put(ProjectsActions.createProjectSuccess(teamspace, newProject));
		
		onSuccess();
	} catch (error) {
		if (projectId) {
			onImageError(error, projectId);
			yield put(ProjectsActions.createProjectSuccess(teamspace, newProject));
		} else {
			onError(error);
		}
	}
}

export function* updateProject({ teamspace, projectId, project, onSuccess, onError }) {
	const { name, image } = project;
	try {
		if (image) {
			yield updateImage({ teamspace, projectId, image });
		} else if (image === null) {
			yield API.Projects.deleteProjectImage(teamspace, projectId);
		}

		if (name) {
			yield API.Projects.updateProjectName(teamspace, projectId, name);
			yield put(ProjectsActions.updateProjectSuccess(teamspace, projectId, { name }));
		}
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

export function* fetchTemplates({ teamspace, projectId, getDetails = false }) {
	try {
		const models = [...(yield select(selectContainers)), ...(yield select(selectFederations))];
		if (!models.length) {
			yield put(ProjectsActions.fetchTemplatesSuccess(projectId, []));
			return;
		}
		const modelId = models[0]._id;
		const isFed = !!(yield select(selectFederationById, modelId));
		const fetchModelTemplates = isFed ? API.Tickets.fetchFederationTemplates : API.Tickets.fetchContainerTemplates;
		const templates = yield fetchModelTemplates(teamspace, projectId, modelId, getDetails);
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

export function* fetchTemplate({ teamspace, projectId, templateId }) {
	try {
		const models = [...(yield select(selectContainers)), ...(yield select(selectFederations))];
		if (!models.length) {
			yield put(ProjectsActions.fetchTemplatesSuccess(projectId, []));
			return;
		}
		const modelId = models[0]._id;
		const isFed = !!(yield select(selectFederationById, modelId));
		const fetchTicketsTemplate = isFed
			? API.Tickets.fetchFederationTemplate
			: API.Tickets.fetchContainerTemplate;
		const template = yield fetchTicketsTemplate(teamspace, projectId, modelId, templateId);
		yield put(ProjectsActions.replaceTemplateSuccess(projectId, template));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'projects.fetchQuota.error.action',
				defaultMessage: 'fetching the template details',
			}),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export default function* ProjectsSaga() {
	yield takeLatest(ProjectsTypes.FETCH as any, fetch);
	yield takeLatest(ProjectsTypes.CREATE_PROJECT as any, createProject);
	yield takeLatest(ProjectsTypes.UPDATE_PROJECT as any, updateProject);
	yield takeLatest(ProjectsTypes.DELETE_PROJECT as any, deleteProject);
	yield takeLatest(ProjectsTypes.FETCH_TEMPLATES as any, fetchTemplates);
	yield takeLatest(ProjectsTypes.FETCH_TEMPLATE as any, fetchTemplate);
}
