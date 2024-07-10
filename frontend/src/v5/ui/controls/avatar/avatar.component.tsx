/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { ICurrentUser } from '@/v5/store/currentUser/currentUser.types';
import { IUser } from '@/v5/store/users/users.redux';
import { getUserInitials } from '@/v5/store/users/users.helpers';
import { StyledIconButton } from './avatar.styles';
import { useAuthenticatedImg } from '@components/authenticatedImage/authenticatedImage.hooks';

type AvatarProps = {
	onClick?: (event: MouseEvent) => void;
	user: ICurrentUser | IUser;
	size?: 'small' | 'medium' | 'large';
	isButton?: boolean;
	className?: string;
};

export const Avatar = ({ user, size, isButton, ...props }: AvatarProps) => {
	const src = useAuthenticatedImg(user.avatarUrl);
	return (
		<StyledIconButton
			$isButton={isButton}
			size={size}
			{...props}
		>
			<AvatarIcon src={src}>
				{getUserInitials(user)}
			</AvatarIcon>
		</StyledIconButton>
	);
};
