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

import { JobPopoverCircle } from '@components/shared/popoverCircles/jobPopoverCircle/jobPopoverCircle.component';
import { UserPopoverCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.component';
import { IPopoverCircle } from '@components/shared/popoverCircles/popoverCircle.component';
import { UsersHooksSelectors, TeamspacesHooksSelectors, JobsHooksSelectors } from '@/v5/services/selectorsHooks';
import { memo } from 'react';
import { ErrorPopoverCircle } from '@components/shared/popoverCircles/errorPopoverCircle/errorPopoverCircle.component';
import { formatMessage } from '@/v5/services/intl';

const JOB_OR_USER_NOT_FOUND = formatMessage({
	id: 'errorPopover.nonexistentJobOrUser',
	defaultMessage: 'The user/job could not be found in this teamspace',
});

type IAssigneeCircle = IPopoverCircle & {
	assignee: string;
};
export const AssigneeCircle = memo(({ assignee, ...props }: IAssigneeCircle) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const job = JobsHooksSelectors.selectJobById(assignee);
	const user = UsersHooksSelectors.selectUser(teamspace, assignee);

	if (!assignee) return null;
	if (!job && user.isNotTeamspaceMember) return (
		<ErrorPopoverCircle
			value={assignee}
			message={JOB_OR_USER_NOT_FOUND}
			{...props}
		/>
	);
	if (!!job) return <JobPopoverCircle job={job} {...props} />;
	return (<UserPopoverCircle user={user} {...props} />);
});
