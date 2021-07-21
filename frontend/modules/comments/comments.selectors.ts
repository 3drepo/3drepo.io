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

import { createSelector } from 'reselect';

import { COLOR } from '../../styles';
import { selectJobs } from '../jobs';

const getJobColor = (jobs, jobId) => {
	const jobData = jobs.find(({ _id }) => jobId === _id );

	if (jobData && jobData.color) {
		return jobData.color;
	}

	return COLOR.TRANSPARENT;
};

export const selectCommentsDomain = (state) => ({ ...state.comments });

export const selectTeamspaceUsers = createSelector(
	selectCommentsDomain, selectJobs, (state, jobs) => state.users ? state.users
		.map(({ job, ...user }) => ({
			...user,
			job: {
				_id: job,
				color: getJobColor(jobs, job),
			}
	})) : []
);

export const selectTeamspaceUser = (name) => createSelector(
	selectTeamspaceUsers, (users) => users.find(({ user }) => user === name) || null
);
