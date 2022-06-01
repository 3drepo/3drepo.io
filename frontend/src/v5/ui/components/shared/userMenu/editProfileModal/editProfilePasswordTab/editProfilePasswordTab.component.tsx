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

import { EditProfileUpdatePasswordSchema } from '@/v5/validation/schemes';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { useEffect, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';

import * as API from '@/v5/services/api';
import { UnexpectedError } from '@controls/errorMessage/unexpectedError/unexpectedError.component';
import { Gap } from '@controls/gap';

interface IUpdatePasswordInputs {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

type EditProfilePasswordTabProps = {
	setIsSubmitting: (isSubmitting: boolean) => void;
	setSubmitFunction: (fn: Function) => void;
};

export const EditProfilePasswordTab = ({
	setIsSubmitting,
	setSubmitFunction,
}: EditProfilePasswordTabProps) => {
	const EMPTY_PASSWORDS = {
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	};
	const [unexpectedError, setUnexpectedError] = useState(false);
	const [incorrectPassword, setIncorrectPassword] = useState(false);

	const {
		formState: { errors, isValid: formIsValid, isSubmitting, isSubmitSuccessful },
		control,
		trigger,
		reset,
		watch,
		handleSubmit,
	} = useForm<IUpdatePasswordInputs>({
		mode: 'onChange',
		resolver: yupResolver(EditProfileUpdatePasswordSchema(incorrectPassword)),
		defaultValues: EMPTY_PASSWORDS,
	});
	
	setIsSubmitting(isSubmitting);
	const oldPassword = watch('oldPassword');
	const newPassword = watch('newPassword');

	const onSubmit = async () => {
		try {
			await API.CurrentUser.updateUser({ oldPassword, newPassword });
			reset(EMPTY_PASSWORDS, { keepIsSubmitted: true });
			setUnexpectedError(false);
			setIncorrectPassword(false);
		} catch (error) {
			const errorData = error.response?.data;
			if (errorData?.code === 'INCORRECT_PASSWORD') {
				setIncorrectPassword(true);
			} else {
				setUnexpectedError(true);
			}
		}
	};

	useEffect(() => {
		setSubmitFunction(() => formIsValid ? handleSubmit(onSubmit) : null);
	}, [formIsValid]);

	// re-trigger validation on confirmPassword when newPassword changes
	useEffect(() => {
		if (newPassword && !errors.newPassword) {
			trigger('confirmPassword');
		}
	}, [newPassword]);

	// re-trigger validation on newPassword when oldPassword changes
	useEffect(() => {
		if (oldPassword && oldPassword === newPassword && !errors.oldPassword) {
			trigger('newPassword');
		}
	}, [oldPassword]);

	return (
		<>
			<FormTextField
				control={control}
				name="oldPassword"
				label={formatMessage({
					id: 'editProfile.updatePassword.oldPassword',
					defaultMessage: 'Current Password',
				})}
				type="password"
				formError={errors.oldPassword}
				required
			/>
			<FormTextField
				control={control}
				name="newPassword"
				label={formatMessage({
					id: 'editProfile.updatePassword.newPassword',
					defaultMessage: 'New Password',
				})}
				type="password"
				formError={errors.newPassword}
				required
			/>
			<FormTextField
				control={control}
				name="confirmPassword"
				label={formatMessage({
					id: 'editProfile.updatePassword.confirmPassword',
					defaultMessage: 'Confirm Password',
				})}
				type="password"
				formError={errors.confirmPassword}
				required
			/>
			{unexpectedError && (
				<>
					<Gap $height='19px'/>
					<UnexpectedError />
				</>
			)}
			{isSubmitSuccessful && !unexpectedError && (
				<SuccessMessage>
					<FormattedMessage id="editProfile.updatePassword.success" defaultMessage="Your password has been changed successfully." />
				</SuccessMessage>
			)}
		</>
	);
};
