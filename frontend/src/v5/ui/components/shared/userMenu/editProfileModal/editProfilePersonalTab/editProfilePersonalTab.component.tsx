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
import { EditProfileUpdatePersonalSchema } from '@/v5/validation/schemes';
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers/currentUsersActions.dispatchers';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { formatMessage } from '@/v5/services/intl';
import { IUser } from '@/v5/store/users/users.redux';
import { clientConfigService } from '@/v4/services/clientConfig';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { defaults, isMatch, pick } from 'lodash';
import { UnexpectedError } from '@controls/errorMessage/unexpectedError/unexpectedError.component';
import { EditProfileAvatar } from './editProfileAvatar/editProfileAvatar.component';

interface IUpdatePersonalInputs {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	countryCode: string;
}

type EditProfilePersonalTabProps = {
	setSubmitFunction: (fn: Function) => void,
	setIsSubmitting: (isSubmitting: boolean) => void,
	user: IUser,
};

export const EditProfilePersonalTab = ({
	setSubmitFunction,
	setIsSubmitting,
	user,
}: EditProfilePersonalTabProps) => {
	const personalError = CurrentUserHooksSelectors.selectPersonalError();
	const formIsUploading = CurrentUserHooksSelectors.selectPersonalDataIsUpdating();
	const [newAvatarFile, setNewAvatarFile] = useState(null);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);

	const getUserPersonalValues = () => pick(
		defaults(user, { company: '', countryCode: 'GB' }),
		['firstName', 'lastName', 'email', 'company', 'countryCode'],
	);

	const {
		getValues,
		trigger,
		handleSubmit,
		reset,
		control,
		formState: { errors, isValid: formIsValid, isSubmitted, isSubmitSuccessful, isDirty },
	} = useForm<IUpdatePersonalInputs>({
		mode: 'all',
		reValidateMode: 'onChange',
		resolver: yupResolver(EditProfileUpdatePersonalSchema(alreadyExistingEmails)),
		defaultValues: getUserPersonalValues(),
	});

	setIsSubmitting(formIsUploading);

	const onSubmit = () => {
		CurrentUserActionsDispatchers.updatePersonalData({
			...getValues(),
			avatarFile: newAvatarFile,
		});
	};

	const isUnexpectedError = personalError && personalError.type === 'unexpected';

	const uploadWasSuccessful = !formIsUploading && !personalError;
	const fieldsAreDirty = () => {
		const a = !isMatch(user, getValues());
		return a;
	}

	// enable submission only if form is valid and fields are dirty (or avatar was changed)
	useEffect(() => {
		const shouldEnableSubmit = formIsValid && (fieldsAreDirty() || newAvatarFile);
		setSubmitFunction(() => shouldEnableSubmit ? handleSubmit(onSubmit) : null);
	}, [formIsValid, newAvatarFile, fieldsAreDirty()]);

	// update form values when user is updated
	useEffect(() => {
		if (uploadWasSuccessful && isSubmitSuccessful) {
			if (newAvatarFile) {
				setNewAvatarFile(null);
			}
			reset(getUserPersonalValues(), { keepIsSubmitted: true });
		}
	}, [formIsUploading]);

	useEffect(() => {
		if (personalError && personalError.message === 'Email already exists') {
			setAlreadyExistingEmails([...alreadyExistingEmails, getValues().email]);
		}
	}, [personalError]);

	useEffect(() => {
		if (alreadyExistingEmails.length) {
			trigger('email');
		}
	}, [alreadyExistingEmails]);

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
					id: 'editProfile.form.firstName',
					defaultMessage: 'First Name',
				})}
				required
				formError={errors.firstName}
			/>
			<FormTextField
				name="lastName"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.lastName',
					defaultMessage: 'Last Name',
				})}
				required
				formError={errors.lastName}
			/>
			<FormTextField
				name="email"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.email',
					defaultMessage: 'Email',
				})}
				required
				formError={errors.email}
			/>
			<FormTextField
				name="company"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.company',
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
			{isSubmitted && uploadWasSuccessful && (
				<SuccessMessage>
					<FormattedMessage id="editProfile.form.success" defaultMessage="Your profile has been changed successfully." />
				</SuccessMessage>
			)}
			{isUnexpectedError && <UnexpectedError gapTop />}
		</>
	);
};
