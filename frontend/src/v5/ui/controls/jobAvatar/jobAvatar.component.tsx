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

import { MouseEvent } from 'react';
import AvatarIcon from '@mui/material/Avatar';
import { StyledIconButton } from '@controls/avatar/avatar.styles';
import { Job, JOBS_LIST } from '@/v5/store/users/user.types';

type JobAvatarProps = {
	onClick?: (event: MouseEvent) => void;
	onMouseEnter?: (event: MouseEvent) => void;
	onMouseLeave?: () => void;
	job: Job;
	size?: 'small' | 'medium' | 'large';
	isButton?: boolean;
	className?: string;
};

export const JobAvatar = ({ job, isButton, ...props }: JobAvatarProps) => (
	<StyledIconButton
		$isButton={isButton}
		{...props}
	>
		<AvatarIcon>
			{JOBS_LIST.find(({ titleLong }) => titleLong === job)?.titleShort}
		</AvatarIcon>
	</StyledIconButton>
);
