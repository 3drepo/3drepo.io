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
import { FormattedMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import UserIcon from '@assets/icons/outlined/user-outlined.svg';
import EmailIcon from '@assets/icons/outlined/email-outlined.svg';
import PasswordIcon from '@assets/icons/outlined/lock-outlined.svg';
import { FormPasswordField, FormTextField } from '@controls/inputs/formInputs.component';
import { IconContainer } from './userSignupFormStepAccount.styles';
import { NextStepButton } from '../userSignupFormNextButton/userSignupFormNextButton.component';

export const UserSignupFormStepAccount = () => {
	const { control, formState: { errors } } = useFormContext();

	return (
		<>
			<FormTextField
				InputProps={{
					startAdornment: (
						<IconContainer>
							<UserIcon />
						</IconContainer>
					),
				}}
				name="username"
				label={formatMessage({
					id: 'userSignup.form.username',
					defaultMessage: 'Username',
				})}
				control={control}
				required
				formError={errors.username}
				autoComplete="UserName"
			/>
			<FormTextField
				InputProps={{
					startAdornment: (
						<IconContainer>
							<EmailIcon />
						</IconContainer>
					),
				}}
				name="email"
				label={formatMessage({
					id: 'userSignup.form.email',
					defaultMessage: 'Email',
				})}
				control={control}
				required
				formError={errors.email}
				autoComplete="email"
			/>
			<FormPasswordField
				InputProps={{
					startAdornment: (
						<IconContainer>
							<PasswordIcon />
						</IconContainer>
					),
				}}
				name="password"
				label={formatMessage({
					id: 'userSignup.form.password',
					defaultMessage: 'Password',
				})}
				required
				control={control}
				formError={errors.password}
				autoComplete="off"
			/>
			<NextStepButton>
				<FormattedMessage id="userSignup.form.button.next" defaultMessage="Next step" />
			</NextStepButton>
		</>
	);
};
