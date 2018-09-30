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

import { put, takeLatest, select } from 'redux-saga/effects';

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { selectCurrentTeamspace } from '../userManagement/userManagement.selectors';
import { JobsTypes, JobsActions } from './jobs.redux';

export function* updateJobColor({ job }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const data = yield API.updateJob(teamspace, job);

		yield put(JobsActions.updateJobSuccess(job));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'job color', error.response));
	}
}

export function* createJob({ job }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const data = yield API.createJob(teamspace, job);

		yield put(JobsActions.createJobSuccess(job));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('create', 'job', error.response));
	}
}

export function* removeJob({ jobId }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const data = yield API.deleteJob(teamspace, jobId);

		yield put(JobsActions.removeJobSuccess(jobId));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'job', error.response));
	}
}

export default function* JobsSaga() {
	yield takeLatest(JobsTypes.CREATE_JOB, createJob);
	yield takeLatest(JobsTypes.REMOVE_JOB, removeJob);
	yield takeLatest(JobsTypes.UPDATE_JOB_COLOR, updateJobColor);
}
