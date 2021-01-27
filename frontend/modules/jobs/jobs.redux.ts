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

import { createActions, createReducer } from 'reduxsauce';
import { sortByField } from '../../helpers/sorting';

export const { Types: JobsTypes, Creators: JobsActions } = createActions({
	fetchJobs: ['teamspace'],
	fetchJobsAndColors: ['teamspace'],
	setJobsPending: ['isPending'],
	setColorsPending: ['isPending'],
	createJob: ['teamspace', 'job'],
	createJobSuccess: ['job'],
	removeJob: ['teamspace', 'jobId'],
	fetchJobsSuccess: ['jobs'],
	removeJobSuccess: ['jobId'],
	updateJobColor: ['teamspace', 'job'],
	updateJobSuccess: ['job'],
	getMyJob: ['teamspace'],
	getMyJobSuccess: ['myJob']
}, { prefix: 'JOBS/' });

export const INITIAL_STATE = {
	jobs: [],
	colors: [],
	myJob: {},
	jobsPending: true,
	colorsPending: true
};

export const fetchJobsSuccess = (state = INITIAL_STATE, { jobs }) => {
	jobs = sortByField([...jobs], { order: 'asc', config: { field: '_id' } });
	return { ...state, jobs };
};

export const updateColors = (state = INITIAL_STATE, { color }) => {
	const colors = [...state.colors] as any;
	if (color && !colors.includes(color)) {
		colors.unshift(color);
	}

	return {...state, colors};
};

export const createJobSuccess = (state = INITIAL_STATE, { job }) => {
	const jobs = [...state.jobs, job];
	return updateColors({ ...state, jobs }, job);
};

export const updateJobSuccess = (state = INITIAL_STATE, { job }) => {
	const jobs = [...state.jobs].map((jobData) => {
		if (jobData._id === job._id) {
			return job;
		}

		return jobData;
	});

	return updateColors({...state, jobs}, job);
};

export const removeJobSuccess = (state = INITIAL_STATE, { jobId }) => {
	const jobs = [...state.jobs].filter(({ _id }) => {
		return _id !== jobId;
	});

	return {...state, jobs};
};

export const getMyJobSuccess = (state = INITIAL_STATE, { myJob }) => {
	return {...state, myJob};
};

export const setJobsPending = (state = INITIAL_STATE, { isPending }) => {
	return {...state, jobsPending: isPending };
};

export const setColorsPending = (state = INITIAL_STATE, { isPending }) => {
	return {...state, colorsPending: isPending };
};

export const reducer = createReducer(INITIAL_STATE, {
	[JobsTypes.FETCH_JOBS_SUCCESS]: fetchJobsSuccess,
	[JobsTypes.CREATE_JOB_SUCCESS]: createJobSuccess,
	[JobsTypes.UPDATE_JOB_SUCCESS]: updateJobSuccess,
	[JobsTypes.REMOVE_JOB_SUCCESS]: removeJobSuccess,
	[JobsTypes.GET_MY_JOB_SUCCESS]: getMyJobSuccess,
	[JobsTypes.SET_JOBS_PENDING]: setJobsPending
});
