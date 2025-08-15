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
import { avatarFile } from '@/v5/validation/userSchemes/validators';
import { FormattedMessage } from 'react-intl';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
	Header,
	ProfilePicture,
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
	const [fileSizeError, setFileSizeError] = useState('');
	const { setValue, watch, formState: { errors }, control } = useFormContext();

	const error = errors.avatarFile;
	const newAvatar = watch('avatarFile');

	const addImage = (event, onChange) => {
		if (!event.target.files.length) return;
		const file = event.target.files[0];
		setFileSizeError('');
		try {
			avatarFile.validateSync(file);
			setValue('avatarFile', file);
			onChange(file);
		} catch (validationError) {
			// sets the value to dirty
			setValue('avatarFile', newAvatar, { shouldDirty: true });
			setFileSizeError(validationError.message);
		}
	};

	const getUserWithAvatar = () => {
		if (!newAvatar) return user;
		return {
			...user,
			hasAvatar: true,
			avatarUrl: URL.createObjectURL(newAvatar),
		};
	};

	const avatarIsAvailable = () => newAvatar || user.hasAvatar;

	useEffect(() => {
		setFileSizeError('');
	}, [JSON.stringify(watch())]);

	return (
		<>
			<Header>
				<ProfilePicture>
					{avatarIsAvailable() ? (
						<Avatar user={getUserWithAvatar()} />
					) : (
						<UserIcon />
					)}
				</ProfilePicture>
				<UserInfo>
					<FullName>
						<TruncatableName>{user.firstName}</TruncatableName>
						<TruncatableName>{user.lastName}</TruncatableName>
					</FullName>
					<Controller
						name="avatarFile"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<AvatarButton color={avatarIsAvailable() ? 'secondary' : 'primary'}>
								<AvatarLabel>
									{avatarIsAvailable() ? (
										<FormattedMessage id="editProfile.changeImage" defaultMessage="Change image" />
									) : (
										<FormattedMessage id="editProfile.addImage" defaultMessage="Add image" />
									)}
									<AvatarInput
										{...field}
										onChange={(event) => addImage(event, onChange)}
									/>
								</AvatarLabel>
							</AvatarButton>
						)}
					/>
				</UserInfo>
			</Header>
			{(fileSizeError || error) && <ErrorMessage title={fileSizeError || error.message?.toString()} />}
		</>
	);
};
