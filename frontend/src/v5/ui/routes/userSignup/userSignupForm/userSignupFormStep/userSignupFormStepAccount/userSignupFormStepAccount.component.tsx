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
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import UserIcon from '@assets/icons/outlined/user-outlined.svg';
import EmailIcon from '@assets/icons/outlined/email-outlined.svg';
import PasswordIcon from '@assets/icons/outlined/lock-outlined.svg';
import { UserSignupSchemaAccount } from '@/v5/validation/schemes';
import { isEqual, pick, defaults } from 'lodash';
import { NextStepButton } from '../userSignupFormStep.styles';
import { IconContainer } from './userSignupFormStepAccount.styles';

export interface IAccountFormInput {
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
	fields: IAccountFormInput;
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
	const DEFAULT_FIELDS: IAccountFormInput = {
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	};

	const getAccountFields = (): IAccountFormInput => defaults(
		pick(fields, ['username', 'email', 'password', 'confirmPassword']),
		DEFAULT_FIELDS,
	);

	const {
		watch,
		getValues,
		trigger,
		control,
		formState,
		formState: { errors, isValid: formIsValid, dirtyFields },
	} = useForm<IAccountFormInput>({
		mode: 'all',
		reValidateMode: 'onChange',
		resolver: yupResolver(UserSignupSchemaAccount(alreadyExistingUsernames)),
		defaultValues: getAccountFields(),
	});

	const password = watch('password');

	useEffect(() => {
		if (dirtyFields.password && dirtyFields.confirmPassword) {
			trigger('confirmPassword');
		}
	}, [password]);

	useEffect(() => {
		if (formIsValid) {
			onComplete();
		} else {
			onUncomplete();
			if (alreadyExistingUsernames.length) trigger('username');
		}
	}, [formIsValid]);

	useEffect(() => {
		const newFields = getValues();
		if (!isEqual(newFields, getAccountFields())) {
			updateFields(newFields);
		}
	}, [formState]);

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
						<IconContainer>
							<UserIcon />
						</IconContainer>
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
						<IconContainer>
							<EmailIcon />
						</IconContainer>
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
						<IconContainer>
							<PasswordIcon />
						</IconContainer>
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
						<IconContainer>
							<PasswordIcon />
						</IconContainer>
					),
				}}
			/>
			<NextStepButton
				disabled={!formIsValid}
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
