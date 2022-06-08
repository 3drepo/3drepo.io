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
import { defaults, pick, transform, isMatch } from 'lodash';
import { UnexpectedError } from '@controls/errorMessage/unexpectedError/unexpectedError.component';
import { ScrollArea } from '@controls/scrollArea';
import { EditProfileAvatar } from './editProfileAvatar/editProfileAvatar.component';
import { ScrollAreaPadding } from './editProfilePersonal.styles';

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
	const [unexpectedError, setUnexpectedError] = useState(false);

	const trimPersonalValues = (personalValues: IUpdatePersonalInputs): IUpdatePersonalInputs => transform(
		personalValues,
		// eslint-disable-next-line no-param-reassign
		(result, value, key) => { result[key] = value.trim(); },
		{} as IUpdatePersonalInputs,
	);

	const getUserPersonalValues = () => trimPersonalValues(
		pick(
			defaults(user, { company: '', countryCode: 'GB' }),
			['firstName', 'lastName', 'email', 'company', 'countryCode'],
		),
	);

	const {
		getValues,
		trigger,
		handleSubmit,
		reset,
		watch,
		control,
		formState: { errors, isValid: formIsValid, isSubmitted, isSubmitSuccessful },
	} = useForm<IUpdatePersonalInputs>({
		mode: 'all',
		resolver: yupResolver(EditProfileUpdatePersonalSchema(alreadyExistingEmails)),
		defaultValues: getUserPersonalValues(),
	});

	const firstName = watch('firstName');
	const lastName = watch('lastName');
	const company = watch('company');

	const getTrimmedValues = () => trimPersonalValues(getValues());

	const onSubmit = () => {
		setUnexpectedError(false);
		const values = getTrimmedValues();
		if (!values.company) {
			delete values.company;
		}
		CurrentUserActionsDispatchers.updatePersonalData({
			...values,
			avatarFile: newAvatarFile,
		});
	};

	const uploadWasSuccessful = !formIsUploading && !personalError;

	const fieldsAreDirty = () => !isMatch(user, getTrimmedValues()) || newAvatarFile;

	// enable submission only if form is valid and fields are dirty (or avatar was changed)
	useEffect(() => {
		const shouldEnableSubmit = formIsValid && fieldsAreDirty();
		setSubmitFunction(() => (shouldEnableSubmit ? handleSubmit(onSubmit) : null));
	}, [newAvatarFile, firstName, lastName, company]);

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
		if (personalError) {
			if (personalError?.message === 'Email already exists') {
				setAlreadyExistingEmails([...alreadyExistingEmails, getValues().email]);
			} else {
				setUnexpectedError(true);
			}
		}
	}, [personalError]);

	useEffect(() => {
		if (alreadyExistingEmails.length) {
			trigger('email');
		}
	}, [alreadyExistingEmails]);

	useEffect(() => setIsSubmitting(formIsUploading));

	return (
		<ScrollArea>
			<ScrollAreaPadding>
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
				{unexpectedError && <UnexpectedError gapTop />}
			</ScrollAreaPadding>
		</ScrollArea>
	);
};
