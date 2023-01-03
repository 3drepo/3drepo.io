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
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '@/v5/services/intl';
import { ICurrentUser } from '@/v5/store/currentUser/currentUser.types';
import { clientConfigService } from '@/v4/services/clientConfig';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';
import { MenuItem } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { pickBy, isEmpty, isMatch, mapValues } from 'lodash';
import { UnhandledError } from '@controls/errorMessage/unhandledError/unhandledError.component';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { emailAlreadyExists, isFileFormatUnsupported } from '@/v5/validation/errors.helpers';
import { EditProfileAvatar } from './editProfileAvatar/editProfileAvatar.component';
import { ScrollArea } from './editProfilePersonalTab.styles';

export interface IUpdatePersonalInputs {
	firstName: string;
	lastName: string;
	email: string;
	company?: string;
	countryCode?: string;
	avatarFile?: File;
}

type EditProfilePersonalTabProps = {
	alreadyExistingEmails: string[];
	setAlreadyExistingEmails: (emails: string[]) => void;
	setSubmitFunction: (fn: Function) => void,
	setIsSubmitting: (isSubmitting: boolean) => void,
	unexpectedError: any,
	user: ICurrentUser,
};

export const EditProfilePersonalTab = ({
	alreadyExistingEmails,
	setAlreadyExistingEmails,
	setSubmitFunction,
	setIsSubmitting,
	unexpectedError,
	user,
}: EditProfilePersonalTabProps) => {
	const formIsUploading = CurrentUserHooksSelectors.selectPersonalDataIsUpdating();
	const [submitWasSuccessful, setSubmitWasSuccessful] = useState(false);
	const {
		getValues,
		trigger,
		handleSubmit,
		reset,
		watch,
		setError: setFormError,
		control,
		formState: { errors: formErrors, isValid: formIsValid },
	} = useFormContext();

	const getTrimmedNonEmptyValues = (): IUpdatePersonalInputs => {
		const trimmedValues = mapValues(getValues(), (value) => value?.trim?.() ?? value);
		return pickBy(trimmedValues) as IUpdatePersonalInputs;
	};

	const onSubmissionSuccess = () => {
		setSubmitWasSuccessful(true);
		const { avatarFile, ...values } = getTrimmedNonEmptyValues();
		reset(values);
	};

	const onSubmissionError = (apiError) => {
		setSubmitWasSuccessful(false);
		if (emailAlreadyExists(apiError)) {
			setAlreadyExistingEmails([...alreadyExistingEmails, getValues('email')]);
			trigger('email');
		}
		if (isFileFormatUnsupported(apiError)) {
			setFormError('avatarFile', {
				type: 'custom',
				message: formatMessage({
					id: 'editProfile.avatar.error.format',
					defaultMessage: 'The file format is not supported',
				}),
			});
		}
	};

	const onSubmit = () => {
		const values = getTrimmedNonEmptyValues();
		CurrentUserActionsDispatchers.updatePersonalData(
			values,
			onSubmissionSuccess,
			onSubmissionError,
		);
	};

	const fieldsAreDirty = !isMatch(user, getTrimmedNonEmptyValues());

	// enable submission only if form is valid and fields are dirty
	useEffect(() => {
		const shouldEnableSubmit = formIsValid && isEmpty(formErrors) && fieldsAreDirty;
		setSubmitFunction(() => (shouldEnableSubmit ? handleSubmit(onSubmit) : null));
	}, [JSON.stringify(watch()), user, formIsValid, JSON.stringify(formErrors)]);

	useEffect(() => setIsSubmitting(formIsUploading), [formIsUploading]);

	return (
		<ScrollArea>
			<EditProfileAvatar user={user} />
			<FormTextField
				name="firstName"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.firstName',
					defaultMessage: 'First Name',
				})}
				required
				formError={formErrors.firstName}
			/>
			<FormTextField
				name="lastName"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.lastName',
					defaultMessage: 'Last Name',
				})}
				required
				formError={formErrors.lastName}
			/>
			<FormTextField
				name="email"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.email',
					defaultMessage: 'Email',
				})}
				required
				formError={formErrors.email}
			/>
			<FormTextField
				name="company"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.company',
					defaultMessage: 'Company',
				})}
				formError={formErrors.company}
			/>
			<FormSelect
				name="countryCode"
				control={control}
				label={formatMessage({
					id: 'editProfile.form.countryCode',
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
					<FormattedMessage
						id="editProfile.form.updateProfileSuccess"
						defaultMessage="Your profile has been changed successfully."
					/>
				</SuccessMessage>
			)}
			<UnhandledError
				error={unexpectedError}
				expectedErrorValidators={[emailAlreadyExists, isFileFormatUnsupported]}
			/>
		</ScrollArea>
	);
};
