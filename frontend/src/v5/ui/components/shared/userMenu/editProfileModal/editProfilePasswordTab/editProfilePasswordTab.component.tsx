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

import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';

import * as API from '@/v5/services/api';
import { UnhandledError } from '@controls/errorMessage/unhandledError/unhandledError.component';
import { isPasswordIncorrect } from '@/v5/validation/errors.helpers';
import { FormPasswordField } from '@controls/inputs/formInputs.component';

export interface IUpdatePasswordInputs {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export const EMPTY_PASSWORDS = {
	oldPassword: '',
	newPassword: '',
	confirmPassword: '',
};

type EditProfilePasswordTabProps = {
	incorrectPassword: boolean;
	setIncorrectPassword: (isIncorrect: boolean) => void;
	setIsSubmitting: (isSubmitting: boolean) => void;
	setSubmitFunction: (fn: Function) => void;
	unexpectedError: any,
};

export const EditProfilePasswordTab = ({
	incorrectPassword,
	setIncorrectPassword,
	setIsSubmitting,
	setSubmitFunction,
	unexpectedError,
}: EditProfilePasswordTabProps) => {
	const {
		formState: { errors, isValid: formIsValid, isSubmitting, isSubmitSuccessful, touchedFields },
		control,
		trigger,
		reset,
		watch,
		handleSubmit,
	} = useFormContext();

	const oldPassword = watch('oldPassword');
	const newPassword = watch('newPassword');
	const confirmPassword = watch('confirmPassword');

	const onSubmit = async () => {
		setIncorrectPassword(false);
		await API.CurrentUser.updateUser({ oldPassword, newPassword });
		reset(EMPTY_PASSWORDS);
	};

	const onSubmitError = (apiError) => {
		if (isPasswordIncorrect(apiError)) {
			setIncorrectPassword(true);
		}
	};

	useEffect(() => setIsSubmitting(isSubmitting), [isSubmitting]);

	useEffect(() => {
		setSubmitFunction(() => (formIsValid
			? (event) => handleSubmit(onSubmit)(event).catch(onSubmitError)
			: null
		));
	}, [formIsValid]);

	useEffect(() => {
		if (incorrectPassword && touchedFields.oldPassword) {
			setIncorrectPassword(false);
		}
	}, [oldPassword]);

	// re-trigger validation on oldPassword when incorrect
	useEffect(() => {
		if (oldPassword) {
			trigger('oldPassword');
		}
	}, [incorrectPassword]);

	useEffect(() => {
		trigger(Object.keys(touchedFields) as Array<keyof IUpdatePasswordInputs>);
	}, [oldPassword, newPassword, confirmPassword]);

	return (
		<>
			<FormPasswordField
				control={control}
				name="oldPassword"
				label={formatMessage({
					id: 'editProfile.form.oldPassword',
					defaultMessage: 'Current Password',
				})}
				formError={errors.oldPassword}
				required
			/>
			<FormPasswordField
				control={control}
				name="newPassword"
				label={formatMessage({
					id: 'editProfile.form.newPassword',
					defaultMessage: 'New Password',
				})}
				formError={errors.newPassword}
				required
			/>
			<FormPasswordField
				control={control}
				name="confirmPassword"
				label={formatMessage({
					id: 'editProfile.form.confirmPassword',
					defaultMessage: 'Confirm Password',
				})}
				formError={errors.confirmPassword}
				required
			/>
			<UnhandledError
				error={unexpectedError}
				expectedErrorValidators={[isPasswordIncorrect]}
			/>
			{isSubmitSuccessful && (
				<SuccessMessage>
					<FormattedMessage
						id="editProfile.form.updatePasswordSuccess"
						defaultMessage="Your password has been changed successfully."
					/>
				</SuccessMessage>
			)}
		</>
	);
};
