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

import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers/authActions.dispatchers';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginSchema } from '@/v5/validation/auth';
import { AuthPage } from '@components/authPage';
import { ForgotPassword, Heading, LoginButton, OtherOptions, PasswordField, SignUp, UsernameField } from './login.styles';

const APP_VERSION = ClientConfig.VERSION;

export const Login = () => {
	const { control, handleSubmit, formState: { isValid } } = useForm({
		mode: 'onSubmit',
		defaultValues: {
			username: '',
			password: '',
		},
		resolver: yupResolver(LoginSchema),
	});

	const onSubmit = ({ username, password }) => {
		AuthActionsDispatchers.login(username, password);
	};

	return (
		<AuthPage
			footer={(
				<Link to="/releaseNotes">
					<FormattedMessage id="placeholder" defaultMessage="Version: {version}" values={{ version: APP_VERSION }} />
				</Link>
			)}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Heading>
					<FormattedMessage id="placeholder" defaultMessage="Log in" />
				</Heading>
				<UsernameField
					control={control}
					name="username"
					label={formatMessage({
						id: 'placeholder',
						defaultMessage: 'Username or email',
					})}
					autoComplete="login"
				/>
				<PasswordField
					control={control}
					name="password"
					label={formatMessage({
						id: 'placeholder',
						defaultMessage: 'Password',
					})}
					autoComplete="current-password"
					type="password"
				/>
				<OtherOptions>
					<SignUp>
						<FormattedMessage
							id="placeholder"
							defaultMessage="Don't have an account? <Link>Sign up</Link>"
							values={{
								Link: (val:string) => <Link to="/sign-up">{val}</Link>,
							}}
						/>
					</SignUp>
					<ForgotPassword>
						<Link to="/password-forgot">
							<FormattedMessage id="placeholder" defaultMessage="Forgotten your password?" />
						</Link>
					</ForgotPassword>
				</OtherOptions>
				<LoginButton disabled={!isValid}>
					<FormattedMessage id="placeholder" defaultMessage="Log in" />
				</LoginButton>
			</form>
		</AuthPage>
	);
};
