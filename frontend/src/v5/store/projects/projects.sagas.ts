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
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { ProjectsActions, ProjectsTypes, IProject } from './projects.redux';

export function* fetch({ teamspace }) {
	try {
		const { data: { projects } } = yield API.fetchProjects(teamspace);
		yield put(ProjectsActions.fetchSuccess(teamspace, projects as IProject[]));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'projects.fetch.error', defaultMessage: 'trying to fetch projects' }),
			error,
		}));
		yield put(ProjectsActions.fetchFailure());
	}
}

export default function* ProjectsSaga() {
	yield takeLatest(ProjectsTypes.FETCH as any, fetch);
}
