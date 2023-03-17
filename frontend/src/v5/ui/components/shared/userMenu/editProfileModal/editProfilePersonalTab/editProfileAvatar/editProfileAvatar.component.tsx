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
import { Controller, useFormContext } from 'react-hook-form';
import {
	Header,
	ProfilePicture,
	Username,
	UserInfo,
	FullName,
	UserIcon,
	TruncatableName,
	AvatarLabel,
	AvatarInput,
	Avatar,
	AvatarButton,
	ErrorMessage,
} from './editProfileAvatar.styles';

type EditProfilePersonalTabProps = {
	user: ICurrentUser,
};

export const EditProfileAvatar = ({ user }: EditProfilePersonalTabProps) => {
	const { setValue, getValues, formState: { errors }, control } = useFormContext();

	const addImage = (event, field) => {
		if (!event.target.files.length) return;
		const file = event.target.files[0];
		setValue('avatarFile', file);
		field.onChange(file);
	};

	const error = errors.avatarFile;
	const newAvatar = getValues('avatarFile');

	const getUserWithAvatar = () => {
		if (!newAvatar) return user;
		return {
			...user,
			hasAvatar: true,
			avatarUrl: URL.createObjectURL(newAvatar),
		};
	};

	const avatarIsAvailable = () => newAvatar || user.hasAvatar;

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
				<Controller
					name="avatarFile"
					control={control}
					render={({ field: { value, ...field } }) => (
						<AvatarButton color={avatarIsAvailable() ? 'secondary' : 'primary'}>
							<AvatarLabel>
								{avatarIsAvailable() ? (
									<FormattedMessage id="editProfile.changeImage" defaultMessage="Change image" />
								) : (
									<FormattedMessage id="editProfile.addImage" defaultMessage="Add image" />
								)}
								<AvatarInput
									{...field}
									onChange={(event) => addImage(event, field)}
								/>
							</AvatarLabel>
						</AvatarButton>
					)}
				/>
				{error && <ErrorMessage title={error.message} />}
			</UserInfo>
		</Header>
	);
};
