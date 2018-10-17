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
import { ProjectsTypes, ProjectsActions } from './projects.redux';
import { DialogActions } from '../dialog/';

export function* create({teamspace, project}) {
	try {
		yield API.createProject(teamspace, project);
		yield put(ProjectsActions.createSuccess(project));
	} catch (e) {
		put(DialogActions.showErrorDialog('create', 'project', e.response));
	}
}

export function* update({teamspace, project}) {
	try {
		yield API.updateProject(teamspace, project);
		yield put(ProjectsActions.updateSuccess(project));
	} catch (e) {
		put(DialogActions.showErrorDialog('update', 'project', e.response));
	}
}

export function* remove({ teamspace, project }) {
	try {
		yield API.removeProject(teamspace, project);
		yield put(ProjectsActions.removeSuccess(project));
	} catch (e) {
		put(DialogActions.showErrorDialog('remove', 'project', e.response));
	}
}

export default function* ProjectsSaga() {
	yield takeLatest(ProjectsTypes.CREATE, create);
	yield takeLatest(ProjectsTypes.UPDATE, update);
	yield takeLatest(ProjectsTypes.REMOVE, remove);
}
