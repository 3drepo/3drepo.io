/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { TeamspacesHooksSelectors, JobsHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { UserPopover } from '@components/shared/popoverCircles/userPopoverCircle/userPopover/userPopover.component';
import { JobPopover } from '@components/shared/popoverCircles/jobPopoverCircle/jobPopover.component';
import { ChangeValue } from './changesTable.styles';
import { getAssigneeDisplayName } from '@/v5/store/users/users.helpers';
import { FormattedMessage } from 'react-intl';

export const JobOrUserValue = ({ jobOrUserId }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const job = JobsHooksSelectors.selectJobById(jobOrUserId);
	const user = UsersHooksSelectors.selectUser(teamspace, jobOrUserId);

	if (job) return (
		<HoverPopover anchor={() => <ChangeValue>{getAssigneeDisplayName(job)}</ChangeValue>}>
			<JobPopover job={job} />
		</HoverPopover>
	);
	if (user?.lastName) return (
		<HoverPopover anchor={() => <ChangeValue>{getAssigneeDisplayName(user)}</ChangeValue>}>
			<UserPopover user={user} />
		</HoverPopover>
	);
	
	return <ChangeValue><FormattedMessage id="ticketHistory.changesTable.jobOrUser.unknown" defaultMessage="Unknown job/user" /></ChangeValue>;
};
