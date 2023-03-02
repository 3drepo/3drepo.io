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

import * as API from '@/v5/services/api';
import { UnhandledError } from '@controls/errorMessage/unhandledError/unhandledError.component';
import { isPasswordIncorrect } from '@/v5/validation/errors.helpers';
import { FormPasswordField } from '@controls/inputs/formInputs.component';
import { FormModalActions } from '@controls/formModal/modalButtons/modalButtons.styles';
import { ModalCancelButton, ModalSubmitButton } from '@controls/formModal/modalButtons/modalButtons.component';
import { MicrosoftButton } from '@components/shared/sso/microsoftButton.component';
import { Gap } from '@controls/gap';
import { linkAccount } from '@/v5/services/api/sso';
import { TabContent } from '../editProfileModal.styles';
import { MicrosoftText } from './editProfileAuthenticationTab.styles'

export interface IUpdatePasswordInputs {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

type EditProfileAuthenticationNonSSOTabProps = {
	incorrectPassword: boolean;
	setIncorrectPassword: (isIncorrect: boolean) => void;
	setIsSubmitting: (isSubmitting: boolean) => void;
	unexpectedError: any,
	onClickClose: () => void,
};

export const EditProfileAuthenticationNonSSOTab = ({
	incorrectPassword,
	setIncorrectPassword,
	setIsSubmitting,
	unexpectedError,
	onClickClose,
}: EditProfileAuthenticationNonSSOTabProps) => {
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
		reset();
	};

	const onSubmitError = (apiError) => {
		if (isPasswordIncorrect(apiError)) {
			setIncorrectPassword(true);
		}
	};

	const onSubmitClick = (event) => handleSubmit(onSubmit)(event).catch(onSubmitError)

	const handleLinkAccount = async () => {
		const res = await linkAccount();
		window.location.href = res.data.link;
	};

	useEffect(() => setIsSubmitting(isSubmitting), [isSubmitting]);

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
			<TabContent>
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
				<Gap />
				<MicrosoftText
					title={formatMessage({
						id: 'editProfile.authentication.linkAccountWithMicrosoft.title',
						defaultMessage: 'Link account with Microsoft',
					})}
				/>
				<MicrosoftButton onClick={handleLinkAccount}>
					<FormattedMessage id="editProfile.authentication.signInWithMicrosoft.button" defaultMessage="Link account with Microsoft" />
				</MicrosoftButton>
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
				<ModalSubmitButton disabled={!formIsValid} onClick={onSubmitClick} isPending={isSubmitting}>
					<FormattedMessage
						defaultMessage="Update password"
						id="editProfile.authentication.submitButton.updatePassword"
					/>
				</ModalSubmitButton>
			</FormModalActions>
		</>
	);
};
