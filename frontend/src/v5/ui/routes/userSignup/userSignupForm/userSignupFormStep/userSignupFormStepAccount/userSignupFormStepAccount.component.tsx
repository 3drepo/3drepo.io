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
import { formatMessage } from '@/v5/services/intl';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import UserIcon from '@assets/icons/outlined/user-outlined.svg';
import EmailIcon from '@assets/icons/outlined/email-outlined.svg';
import PasswordIcon from '@assets/icons/outlined/lock-outlined.svg';
import { InputAdornment } from '@material-ui/core';
import { UserSignupSchemaAccount } from '@/v5/validation/schemes';
import { pick } from 'lodash';
import { NextStepButton } from '../userSignupFormStep.styles';

interface IAccountFormInput {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

type UserSignupFormStepAccountProps = {
	updateFields: (fields: any) => void;
	onSubmitStep: () => void;
	onComplete: () => void;
	onUncomplete: () => void;
	fields: Omit<IAccountFormInput, 'confirmPassword'>;
	alreadyExistingUsernames?: string[];
};

export const UserSignupFormStepAccount = ({
	updateFields,
	onSubmitStep,
	onComplete,
	onUncomplete,
	fields,
	alreadyExistingUsernames,
}: UserSignupFormStepAccountProps) => {
	const getDefaultValues = (): IAccountFormInput => ({
		username: fields.username || '',
		email: fields.email || '',
		password: fields.password || '',
		confirmPassword: fields.password || '',
	});

	const {
		watch,
		getValues,
		trigger,
		control,
		formState: { errors, isValid, dirtyFields },
	} = useForm<IAccountFormInput>({
		mode: 'all',
		resolver: yupResolver(UserSignupSchemaAccount(alreadyExistingUsernames)),
		defaultValues: getDefaultValues(),
	});

	const password = watch('password');

	const [formIsValid, setFormIsValid] = useState(isValid);

	useEffect(() => {
		if (dirtyFields.password && dirtyFields.confirmPassword) {
			trigger('confirmPassword');
		}
	}, [password]);

	useEffect(() => {
		if (alreadyExistingUsernames.length) {
			trigger('username');
			onUncomplete();
		}
	}, [alreadyExistingUsernames]);

	useEffect(() => {
		if (isValid !== formIsValid) {
			setFormIsValid(isValid);
			(isValid ? onComplete : onUncomplete)();
		}
	}, [isValid]);

	useEffect(() => () => {
		updateFields(pick(getValues(), ['username', 'email', 'password']));
	}, []);

	return (
		<>
			<FormTextField
				name="username"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.username',
					defaultMessage: 'Username',
				})}
				required
				formError={errors.username}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<UserIcon />
						</InputAdornment>
					),
				}}
			/>
			<FormTextField
				name="email"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.email',
					defaultMessage: 'Email',
				})}
				required
				formError={errors.email}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<EmailIcon />
						</InputAdornment>
					),
				}}
			/>
			<FormTextField
				name="password"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.password',
					defaultMessage: 'Password',
				})}
				type="password"
				required
				formError={errors.password}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<PasswordIcon />
						</InputAdornment>
					),
				}}
			/>
			<FormTextField
				name="confirmPassword"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.confirmPassword',
					defaultMessage: 'Confirm password',
				})}
				type="password"
				required
				disabled={!password}
				formError={errors.confirmPassword}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<PasswordIcon />
						</InputAdornment>
					),
				}}
			/>
			<NextStepButton
				disabled={!isValid}
				onClick={onSubmitStep}
			>
				<FormattedMessage
					id="userSignup.form.button.next"
					defaultMessage="Next step"
				/>
			</NextStepButton>
		</>
	);
};
