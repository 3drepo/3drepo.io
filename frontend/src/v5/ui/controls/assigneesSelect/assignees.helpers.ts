/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { IJob } from '@/v5/store/jobs/jobs.types';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { IUser } from '@/v5/store/users/users.redux';
import { groupBy } from 'lodash';

export const getModelJobsAndUsers = (containerOrFederation) => {
	const isFed = modelIsFederation(containerOrFederation);
	
	const users = isFed
		? FederationsHooksSelectors.selectFederationUsers(containerOrFederation)
		: ContainersHooksSelectors.selectContainerUsers(containerOrFederation);
	
	const jobs = isFed
		? FederationsHooksSelectors.selectFederationJobs(containerOrFederation)
		: ContainersHooksSelectors.selectContainerJobs(containerOrFederation);

	return { users, jobs };
};

export const jobOrUserToString = (ju): string | null => (ju._id || ju.user);

export const getValidValues = (jobsAndUsers, excludeViewers): (string | null)[] => {
	const jobsAndTeamspaceUsers = jobsAndUsers.filter((ju) => !ju.isNotTeamspaceMember);
	const validJobsAndUsers = excludeViewers ? jobsAndTeamspaceUsers.filter((ju) => (!ju?.isViewer)) : jobsAndTeamspaceUsers;
	return validJobsAndUsers.map(jobOrUserToString);
};

export const getInvalidValues = (value: string[], validValues) => value.filter((val) => !validValues.includes(val));

export const groupJobsAndUsers = (items) => {
	const { users = [], jobs = [], notFound = [] } = groupBy(items, (item) => {
		if (item?.user) return 'users';
		if (item?._id) return 'jobs';
		return 'notFound';
	});
	return { users, jobs, notFound } as { users: IUser[], jobs: IJob[], notFound: { notFoundName: string }[] };
};