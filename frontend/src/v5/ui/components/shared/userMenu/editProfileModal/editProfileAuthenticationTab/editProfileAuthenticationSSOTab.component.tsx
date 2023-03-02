/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { UnhandledError } from '@controls/errorMessage/unhandledError/unhandledError.component';
import { isPasswordIncorrect } from '@/v5/validation/errors.helpers';
import { FormPasswordField } from '@controls/inputs/formInputs.component';
import { FormModalActions } from '@controls/formModal/modalButtons/modalButtons.styles';
import { ModalCancelButton, ModalSubmitButton } from '@controls/formModal/modalButtons/modalButtons.component';
import { TabContent } from '../editProfileModal.styles';

type IUpdateSSOPasswordInputs = {
	newPassword: string;
	confirmPassword: string;
};

type EditProfileAuthenticationSSOTabProps = {
	setIsSubmitting: (isSubmitting: boolean) => void;
	unexpectedError: any,
	onClickClose: () => void,
};

export const EditProfileAuthenticationSSOTab = ({
	setIsSubmitting,
	unexpectedError,
	onClickClose,
}: EditProfileAuthenticationSSOTabProps) => {
	const {
		formState: { errors, isValid: formIsValid, isSubmitting, isSubmitSuccessful, touchedFields },
		control,
		trigger,
		watch,
		handleSubmit,
	} = useFormContext();

	const newPassword = watch('newPassword');
	const confirmPassword = watch('confirmPassword');

	const onSubmit = () => {
		// API.SSOUser.unlink({ password });
		setIsSubmitting(isSubmitting);
	};

	useEffect(() => {
		trigger(Object.keys(touchedFields) as Array<keyof IUpdateSSOPasswordInputs>);
	}, [newPassword, confirmPassword]);

	return (
		<>
			<TabContent>
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
			</TabContent>
			<FormModalActions>
				<ModalCancelButton onClick={onClickClose} />
				<ModalSubmitButton disabled={!formIsValid} onClick={handleSubmit(onSubmit)} isPending={isSubmitting}>
					<FormattedMessage
						defaultMessage="Unlink with Microsoft"
						id="editProfile.authentication.submitButton.unlinkWithMicrosoft"
					/>
				</ModalSubmitButton>
			</FormModalActions>
		</>
	);
};
