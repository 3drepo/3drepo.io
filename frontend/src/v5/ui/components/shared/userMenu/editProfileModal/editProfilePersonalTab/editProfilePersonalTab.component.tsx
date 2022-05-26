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
import { isMatch } from 'lodash';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';
import { EditProfileAvatar } from './editProfileAvatar/editProfileAvatar.component';

export interface IUpdatePersonalInputs {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	countryCode: string;
}

type EditProfilePersonalTabProps = {
	setSubmitFunction: (fn: Function) => void,
	fields: IUpdatePersonalInputs,
	updatePersonalFields: (values: Partial<IUpdatePersonalInputs>) => void,
	newAvatarFile: File | null,
	setNewAvatarFile: (file: File | null) => void,
	alreadyExistingEmails: string[],
	user: IUser,
};

export const EditProfilePersonalTab = ({
	setSubmitFunction,
	fields,
	updatePersonalFields,
	newAvatarFile,
	setNewAvatarFile,
	alreadyExistingEmails,
	user,
}: EditProfilePersonalTabProps) => {
	const [submitWasSuccessful, setSubmitWasSuccessful] = useState(false);
	const {
		getValues,
		trigger,
		handleSubmit,
		control,
		formState: { errors, isValid: formIsValid },
	} = useForm<IUpdatePersonalInputs>({
		mode: 'all',
		reValidateMode: 'onChange',
		resolver: yupResolver(EditProfileUpdatePersonalSchema(alreadyExistingEmails)),
		defaultValues: fields,
	});

	const onSubmit = () => {
		try {
			CurrentUserActionsDispatchers.updateUser(getValues());
			setSubmitWasSuccessful(true);
			if (newAvatarFile) {
				CurrentUserActionsDispatchers.updateUserAvatar(newAvatarFile);
			}
		} catch (error) {
			if (alreadyExistingEmails.length) trigger('email');
			// TODO handle error using sagas
		}
	};

	const fieldsAreDirty = () => !isMatch(user, getValues());

	useEffect(() => {
		const shouldEnableSubmit = formIsValid && (fieldsAreDirty() || newAvatarFile);
		setSubmitFunction(shouldEnableSubmit ? handleSubmit(onSubmit) : null);
	}, [formIsValid, newAvatarFile, fieldsAreDirty()]);

	useEffect(() => () => {
		updatePersonalFields(getValues());
	}, []);

	return (
		<>
			<EditProfileAvatar
				user={user}
				newAvatarFile={newAvatarFile}
				setNewAvatarFile={setNewAvatarFile}
			/>
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
			{submitWasSuccessful && (
				<SuccessMessage>
					<FormattedMessage id="editProfile.updateProfile.success" defaultMessage="Your profile has been changed successfully." />
				</SuccessMessage>
			)}
		</>
	);
};
