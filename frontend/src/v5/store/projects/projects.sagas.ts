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

import { put, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { ProjectsActions, ProjectsTypes, IProjects } from './projects.redux';

export function* fetch({ teamspace }) {
	yield put(ProjectsActions.setSending(true));

	try {
		const { data: { projects } } = yield API.fetchProjects(teamspace);
		yield put(ProjectsActions.fetchSuccess(projects as IProjects[]));
	} catch (e) {
		console.error(e);
	}

	yield put(ProjectsActions.setSending(false));
}

export default function* ProjectsSaga() {
	yield takeLatest(ProjectsTypes.FETCH as any, fetch);
}
