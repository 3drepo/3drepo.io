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
import { ICurrentUser } from '@/v5/store/currentUser/currentUser.types';
import { FormattedMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { FormImage } from '@controls/formImage/formImage.component';
import {
	Header,
	ProfilePicture,
	Username,
	UserInfo,
	FullName,
	UserIcon,
	TruncatableName,
	Avatar,
	AvatarButton,
	ErrorMessage,
} from './editProfileAvatar.styles';

type EditProfilePersonalTabProps = {
	user: ICurrentUser,
};

export const EditProfileAvatar = ({ user }: EditProfilePersonalTabProps) => {
	const { watch, control, formState: { errors } } = useFormContext();

	const AVATAR_NAME = 'avatarFile';
	const avatarFile = watch(AVATAR_NAME);
	const error = errors.avatarFile;

	const getUserWithAvatar = () => {
		if (!avatarFile) return user;
		return {
			...user,
			hasAvatar: true,
			avatarUrl: URL.createObjectURL(avatarFile),
		};
	};

	const avatarIsAvailable = () => avatarFile || user.hasAvatar;

	return (
		<Header>
			<ProfilePicture>
				{avatarIsAvailable() ? (
					<Avatar user={getUserWithAvatar()} />
				) : (
					<UserIcon />
				)}
			</ProfilePicture>
			<UserInfo>
				<Username>{user.username}</Username>
				<FullName>
					<TruncatableName>{user.firstName}</TruncatableName>
					<TruncatableName>{user.lastName}</TruncatableName>
				</FullName>
				<AvatarButton color={avatarIsAvailable() ? 'secondary' : 'primary'}>
					<FormImage name={AVATAR_NAME} control={control}>
						{avatarIsAvailable() ? (
							<FormattedMessage id="editProfile.changeImage" defaultMessage="Change image" />
						) : (
							<FormattedMessage id="editProfile.addImage" defaultMessage="Add image" />
						)}
					</FormImage>
				</AvatarButton>
				{error && <ErrorMessage>{error.message}</ErrorMessage>}
			</UserInfo>
		</Header>
	);
};
