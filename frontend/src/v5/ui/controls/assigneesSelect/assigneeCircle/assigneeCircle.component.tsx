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

import { useSelector } from 'react-redux';
import { selectJobs } from '@/v4/modules/jobs/jobs.selectors';
import { JobPopoverCircle } from '@components/shared/popoverCircles/jobPopoverCircle/jobPopoverCircle.component';
import { UserPopoverCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.component';
import { IPopoverCircle } from '@components/shared/popoverCircles/popoverCircle.styles';

type IAssigneeCircle = IPopoverCircle & {
	assignee: string;
};

export const AssigneeCircle = ({ assignee, ...props }: IAssigneeCircle) => {
	const jobsInTeamspace = useSelector(selectJobs);
	const isJob = jobsInTeamspace.some(({ _id }) => _id === assignee);

	if (!isJob) return (<UserPopoverCircle username={assignee} {...props} />);
	return <JobPopoverCircle job={jobsInTeamspace.find(({ _id }) => _id === assignee)} {...props} />;
};
