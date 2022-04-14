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
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers/currentUsersActions.dispatchers';
import { EditProfileUpdatePersonalSchema } from '@/v5/validation/schemes';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { MenuItem } from '@mui/material';
import { clientConfigService } from '@/v4/services/clientConfig';
import { IUser } from '@/v5/store/users/users.redux';
import { FormattedMessage } from 'react-intl';
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { fileIsTooBig } from '@/v5/store/currentUser/currentUser.helpers';
import {
	Header,
	ProfilePicture,
	Username,
	UserInfo,
	FullName,
	AddImageButton,
	AddImageHiddenInput,
	AddImageButtonContainer,
} from './editProfilePersonalTab.styles';

export interface IUpdatePersonalInputs {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	countryCode: string;
}

type EditProfilePersonalTabProps = {
	setSubmitFunction: (fn: Function) => void,
	updatePersonalFields: (values: Partial<IUpdatePersonalInputs>) => void,
	fields: IUpdatePersonalInputs,
	alreadyExistingEmails: string[],
	user: IUser,
};

export const EditProfilePersonalTab = ({
	setSubmitFunction,
	fields,
	updatePersonalFields,
	alreadyExistingEmails,
	user,
}: EditProfilePersonalTabProps) => {
	const [newAvatarUrl, setNewAvatarUrl] = useState(null);
	const [avatarFile, setAvatarFile] = useState(null);
	const [avatarTooBigError, setAvatarTooBigError] = useState('');
	const {
		getValues,
		handleSubmit,
		trigger,
		reset,
		control,
		formState: { errors, isValid: formIsValid, isDirty: formIsDirty },
	} = useForm<IUpdatePersonalInputs>({
		mode: 'all',
		reValidateMode: 'onChange',
		resolver: yupResolver(EditProfileUpdatePersonalSchema(alreadyExistingEmails)),
		defaultValues: fields,
	});
	const { avatarError } = CurrentUserHooksSelectors.selectErrors();

	const onSubmit = () => {
		try {
			CurrentUserActionsDispatchers.updateUser(getValues());
			if (avatarFile) {
				CurrentUserActionsDispatchers.updateUserAvatar(avatarFile);
				setAvatarFile(null);
				setNewAvatarUrl(null);
			}
			reset();
		} catch (error) {
			if (alreadyExistingEmails.length) trigger('email');
			// TODO handle error
		}
	};

	const addImage = (event) => {
		setAvatarTooBigError('');
		CurrentUserActionsDispatchers.resetErrors();
		const file = event.target.files[0];
		if (!fileIsTooBig(file)) {
			setNewAvatarUrl(URL.createObjectURL(file));
			setAvatarFile(file);
		} else {
			setAvatarTooBigError(formatMessage({
				id: 'editProfile.avatar.error.size',
				defaultMessage: 'File is too big! Must be smaller than 1 MB.',
			}));
		}
	};

	useEffect(() => {
		setSubmitFunction(formIsValid && (formIsDirty || newAvatarUrl) ? handleSubmit(onSubmit) : null);
	}, [formIsValid, newAvatarUrl]);

	useEffect(() => () => {
		updatePersonalFields(getValues());
		CurrentUserActionsDispatchers.resetErrors();
	}, []);

	return (
		<>
			<Header>
				<ProfilePicture>
					{newAvatarUrl || user.hasAvatar ? (
						<img src={newAvatarUrl || user.avatarUrl} alt="avatar" />
					) : (
						<i>icon</i>
					)}
				</ProfilePicture>
				<UserInfo>
					<Username>{user.username}</Username>
					<FullName>{user.firstName} {user.lastName}</FullName>
					<AddImageButtonContainer>
						<AddImageButton>
							<FormattedMessage id="editProfile.addImage" defaultMessage="Add image" />
						</AddImageButton>
					</AddImageButtonContainer>
					<AddImageHiddenInput id="add-image" onChange={addImage} />
					{(avatarTooBigError || avatarError) && (
						<ErrorMessage>{avatarTooBigError || avatarError}</ErrorMessage>
					)}
				</UserInfo>
			</Header>

			<FormTextField
				name="firstName"
				control={control}
				label={formatMessage({
					id: 'editProfile.updateProfile.firstName',
					defaultMessage: 'First Name',
				})}
				required
				formError={errors.firstName}
			/>
			<FormTextField
				name="lastName"
				control={control}
				label={formatMessage({
					id: 'editProfile.updateProfile.lastName',
					defaultMessage: 'Last Name',
				})}
				required
				formError={errors.lastName}
			/>
			<FormTextField
				name="email"
				control={control}
				label={formatMessage({
					id: 'editProfile.updateProfile.email',
					defaultMessage: 'Email',
				})}
				required
				formError={errors.email}
			/>
			<FormTextField
				name="company"
				control={control}
				label={formatMessage({
					id: 'editProfile.updateProfile.company',
					defaultMessage: 'Company',
				})}
				required
				formError={errors.company}
			/>
			<FormSelect
				name="countryCode"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.countryCode',
					defaultMessage: 'Country',
				})}
				required
			>
				{clientConfigService.countries.map((country) => (
					<MenuItem key={country.code} value={country.code}>
						{country.name}
					</MenuItem>
				))}
			</FormSelect>
		</>
	);
};
