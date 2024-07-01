/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { hexColorRE } from '@/v4/helpers/colors';
import { IJob } from '@/v5/store/jobs/jobs.types';
import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { selectCurrentTeamspace } from '../userManagement';
import { JobsActions, JobsTypes } from './jobs.redux';

const sanitizeJob =  (job: IJob) => {
	if (!hexColorRE.test(job.color)) {
		delete job.color;
	}

	return job;
}

export function* fetchJobs({ teamspace }) {
	try {
		yield put(JobsActions.setJobsPending(true));
		const {data}: {data: IJob[]} = yield API.getJobs(teamspace);
		const jobs = data.map(sanitizeJob);

		yield put(JobsActions.fetchJobsSuccess(jobs));
		yield put(JobsActions.setJobsPending(false));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'jobs', error));
		yield put(JobsActions.setJobsPending(false));
	}
}

export function* fetchJobsAndColors() {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		yield put(JobsActions.fetchJobs(teamspace));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'jobs and colors', error));
	}
}

export function* updateJobColor({ job }) {
	if (!hexColorRE.test(job.color)) {
		return;
	}

	try {
		const teamspace = yield select(selectCurrentTeamspace);

		yield API.updateJob(teamspace, job);

		yield put(JobsActions.updateJobSuccess(job));
		yield put(SnackbarActions.show('Job color updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'job color', error));
	}
}

export function* createJob({ job }) {
	if (!hexColorRE.test(job.color)) {
		return;
	}

	try {
		const teamspace = yield select(selectCurrentTeamspace);
		yield API.createJob(teamspace, job);

		yield put(JobsActions.createJobSuccess(job));
		yield put(SnackbarActions.show('Job created'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'job', error));
	}
}

export function* removeJob({ jobId }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		yield API.deleteJob(teamspace, jobId);

		yield put(JobsActions.removeJobSuccess(jobId));
		yield put(SnackbarActions.show('Job removed'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'job', error));
	}
}

export function* getMyJob({ teamspace }) {
	try {
		const { data } = yield API.getMyJob(teamspace);

		const job = sanitizeJob(data);
		yield put(JobsActions.getMyJobSuccess(job));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'my job', error));
	}
}

export default function* JobsSaga() {
	yield takeLatest(JobsTypes.FETCH_JOBS, fetchJobs);
	yield takeLatest(JobsTypes.FETCH_JOBS_AND_COLORS, fetchJobsAndColors);
	yield takeLatest(JobsTypes.CREATE_JOB, createJob);
	yield takeLatest(JobsTypes.REMOVE_JOB, removeJob);
	yield takeLatest(JobsTypes.UPDATE_JOB_COLOR, updateJobColor);
	yield takeLatest(JobsTypes.GET_MY_JOB, getMyJob);
}
