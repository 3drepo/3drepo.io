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

import { IJob } from '@/v5/store/jobs/jobs.types';
import { uniq } from 'lodash';
import { createSelector } from 'reselect';

export const selectJobsDomain = (state) => ({...state.jobs});

export const selectJobs = createSelector(
	selectJobsDomain, (state): IJob[] => state.jobs || []
);

export const selectJobsColors = createSelector(
	selectJobs, (jobs) => uniq(jobs.map(({color}) => color))
);

export const selectTruthyJobsColors = createSelector(
		selectJobsColors, (colors) => colors.filter(Boolean)
);

export const selectJobsList = createSelector(
	selectJobs, (jobs) => jobs.map(({ _id: name, color }) => ({ name, color, value: name }))
);

export const selectMyJob = createSelector(
	selectJobsDomain, (state) => state.myJob
);

export const selectJobsPending = createSelector(
	selectJobsDomain, (state) => state.jobsPending
);

export const selectColorsPending = createSelector(
	selectJobsDomain, (state) => state.colorsPending
);

export const selectJobById = createSelector(
	selectJobs,
	(state, jobId) => jobId,
	(jobs, jobId) => jobs.find(({ _id }) => _id === jobId)
);