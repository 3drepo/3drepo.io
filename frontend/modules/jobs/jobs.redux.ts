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

import { createActions, createReducer } from 'reduxsauce';

export const { Types: JobsTypes, Creators: JobsActions } = createActions({
	fetchJobs: ['teamspace'],
	fetchJobsColors: ['teamspace'],
	createJob: ['teamspace', 'job'],
	createJobSuccess: ['job'],
	removeJob: ['teamspace', 'jobId'],
	fetchJobsSuccess: ['jobs'],
	fetchJobsColorsSuccess: ['colors'],
	removeJobSuccess: ['jobId'],
	updateJobColor: ['teamspace', 'job'],
	updateJobSuccess: ['job'],
	getMyJob: ['teamspace'],
	getMyJobSuccess: ['myJob']
}, { prefix: 'JOBS_' });

export const INITIAL_STATE = {
	jobs: [],
	colors: [],
	myJob: {}
};
export const fetchJobsSuccess = (state = INITIAL_STATE, { jobs }) => ({ ...state, jobs });

export const fetchJobsColorsSuccess = (state = INITIAL_STATE, { colors }) => ({ ...state, colors });

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

export const reducer = createReducer(INITIAL_STATE, {
	[JobsTypes.FETCH_JOBS_SUCCESS]: fetchJobsSuccess,
	[JobsTypes.FETCH_JOBS_COLORS_SUCCESS]: fetchJobsColorsSuccess,
	[JobsTypes.CREATE_JOB_SUCCESS]: createJobSuccess,
	[JobsTypes.UPDATE_JOB_SUCCESS]: updateJobSuccess,
	[JobsTypes.REMOVE_JOB_SUCCESS]: removeJobSuccess,
	[JobsTypes.GET_MY_JOB_SUCCESS]: getMyJobSuccess
});
