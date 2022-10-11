/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { UsersHooksSelectors } from '@/v5/services/selectorsHooks/usersSelectors.hooks';
import { useParams } from 'react-router-dom';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { getTeamspaceImgSrc } from '@/v5/store/teamspaces/teamspaces.helpers';
import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { JobPopover } from '@components/shared/jobPopover/jobPopover.component';
import { Popover } from '@controls/popover/popover.component';
import { JOBS_LIST } from '@/v5/store/users/user.types';
import { JobCircle, UserCircle } from '../assignees.styles';

type IAssigneeListItem = {
	assignee: string;
};

export const AssigneeListItem = ({ assignee }: IAssigneeListItem) => {
	const { teamspace } = useParams<DashboardParams>();
	const job = JOBS_LIST.find((j) => j.titleLong === assignee);
	let user = UsersHooksSelectors.selectUser(teamspace, assignee);
	if (user) {
		user = { ...user, avatarUrl: getTeamspaceImgSrc(assignee), hasAvatar: true };
	}

	if (!job && !user) return <></>;
	return job ? (
		<Popover
			anchor={(props) => <JobCircle job={assignee} {...props} />}
			popoverContent={() => <JobPopover job={job.titleLong} />}
		/>
	) : (
		<Popover
			anchor={(props) => <UserCircle user={user} {...props} />}
			popoverContent={() => <UserPopover user={user} />}
		/>
	);
};
