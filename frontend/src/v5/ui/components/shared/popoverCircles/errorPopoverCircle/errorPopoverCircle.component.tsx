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

import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { getJobAbbreviation } from '@/v5/store/jobs/jobs.helpers';
import { ErrorPopover } from './errorPopover.component';
import { ErrorCircle } from './errorPopoverCircle.styles';
import { IPopoverCircle } from '../popoverCircle.component';

type ErrorPopoverCircleProps = IPopoverCircle & {
	value: string;
	className?: string;
	message: string;
};

export const ErrorPopoverCircle = ({ value, size, message, className }: ErrorPopoverCircleProps) => (
	<HoverPopover
		className={className}
		anchor={() => <ErrorCircle size={size}>{getJobAbbreviation(value)}</ErrorCircle>}
	>
		<ErrorPopover value={value} message={message} />
	</HoverPopover>
);
