/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { getJobAbbreviation } from '@/v5/store/jobs/jobs.helpers';
import { IJob } from '@/v5/store/jobs/jobs.types';
import { IPopoverCircle, PopoverCircle } from '../popoverCircle.component';
import { JobPopover } from './jobPopover.component';

type JobPopoverCircleProps = IPopoverCircle & {
	job: IJob;
	className?: string;
};

export const JobPopoverCircle = ({ job, size, className }: JobPopoverCircleProps) => (
	<HoverPopover
		className={className}
		anchor={(props) => <PopoverCircle size={size} backgroundColor={job.color} {...props}>{getJobAbbreviation(job._id)}</PopoverCircle>}
	>
		<JobPopover job={job} />
	</HoverPopover>
);
