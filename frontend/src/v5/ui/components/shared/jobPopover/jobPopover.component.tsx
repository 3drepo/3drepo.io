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

import { Job } from '@/v5/store/users/user.types';
import { JobAvatar } from '@controls/jobAvatar/jobAvatar.component';
import { AvatarWrapper, PopoverContainer, Heading as JobTitle, Data as JobData } from '../userPopover/userPopover.styles';

interface IJobPopover {
	job: Job;
}

export const JobPopover = ({ job }: IJobPopover) => (
	<PopoverContainer>
		<AvatarWrapper>
			<JobAvatar job={job} />
		</AvatarWrapper>
		<JobData>
			<JobTitle>{job}</JobTitle>
		</JobData>
	</PopoverContainer>
);
