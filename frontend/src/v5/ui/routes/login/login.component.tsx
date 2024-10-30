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

import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Link } from 'react-router-dom';
import LoginIcon from '@assets/icons/outlined/login-outlined.svg';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginSchema } from '@/v5/validation/userSchemes/loginSchemes';
import { AuthTemplate } from '@components/authTemplate';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks';
import { SubmitButton } from '@controls/submitButton/submitButton.component';
import { AuthSubHeader, Divider } from '@components/authTemplate/authTemplate.styles';
import { useSSOLogin } from '@/v5/services/sso.hooks';
import { Gap } from '@controls/gap';
import { AuthFormLogin, ForgotPasswordPrompt, MicrosoftButton, OtherOptions, SignUpPrompt, UnhandledErrorInterceptor } from './login.styles';
import { AuthHeading, ErrorMessage, FormPasswordField, FormUsernameField } from './components/components.styles';
import { PASSWORD_FORGOT_PATH, RELEASE_NOTES_ROUTE, SIGN_UP_PATH } from '../routes.constants';

const APP_VERSION = ClientConfig.VERSION;

export const Login = () => {
	const [ssoErrorMessage, loginWithSSO] = useSSOLogin();

	const { control, handleSubmit, formState: { isValid, errors } } = useForm({
		mode: 'onSubmit',
		defaultValues: {
			username: '',
			password: '',
		},
		resolver: yupResolver(LoginSchema),
	});

	const isPending = AuthHooksSelectors.selectIsPending();
	const errorMessage: string = AuthHooksSelectors.selectLoginError();

	const onSubmit = ({ username, password }) => {
		AuthActionsDispatchers.login(username, password);
	};

	const isExpectedError = (err) => (
		[
			'NOT_LOGGED_IN',
			'INCORRECT_USERNAME_OR_PASSWORD',
			'ALREADY_LOGGED_IN',
			'TOO_MANY_LOGIN_ATTEMPTS',
			'USER_NOT_VERIFIED',
		].includes(err.response?.data?.code)
	);

	return (
		<AuthTemplate
			footer={(
				<a href={RELEASE_NOTES_ROUTE}>
					<FormattedMessage id="auth.login.versionFooter" defaultMessage="Version: {version}" values={{ version: APP_VERSION }} />
				</a>
			)}
		>
			<AuthFormLogin onSubmit={handleSubmit(onSubmit)}>
				<AuthHeading>
					<FormattedMessage id="auth.login.heading" defaultMessage="Sign in to your account" />
				</AuthHeading>
				<AuthSubHeader>
					<FormattedMessage id="auth.login.heading.signInWithMicrosoft" defaultMessage="Sign in with Microsoft" />
				</AuthSubHeader>
				<MicrosoftButton onClick={loginWithSSO}>
					<FormattedMessage id="auth.login.sso.microsoft" defaultMessage="Sign in with Microsoft" />
				</MicrosoftButton>
				{ssoErrorMessage && (
					<>
						<Gap $height="5px" />
						<ErrorMessage>{ssoErrorMessage}</ErrorMessage>
					</>
				)}
				<Divider><FormattedMessage id="auth.login.divider" defaultMessage="or" /></Divider>
				<AuthSubHeader>
					<FormattedMessage id="auth.login.heading.signInWithUsername" defaultMessage="Sign in with username or email" />
				</AuthSubHeader>
				<FormUsernameField
					control={control}
					name="username"
					required
					formError={errors.username}
				/>
				<FormPasswordField
					control={control}
					name="password"
					label={formatMessage({
						id: 'auth.login.password',
						defaultMessage: 'Password',
					})}
					required
				/>
				<UnhandledErrorInterceptor expectedErrorValidators={[isExpectedError]} />
				{errorMessage && <ErrorMessage title={errorMessage} />}
				<OtherOptions>
					<SignUpPrompt>
						<FormattedMessage
							id="auth.login.signUp"
							defaultMessage="Don't have an account? <Link>Sign up</Link>"
							values={{
								Link: (val:string) => <Link to={SIGN_UP_PATH}>{val}</Link>,
							}}
						/>
					</SignUpPrompt>
					<ForgotPasswordPrompt>
						<Link to={PASSWORD_FORGOT_PATH}>
							<FormattedMessage id="auth.login.forgotPassword" defaultMessage="Forgotten your password?" />
						</Link>
					</ForgotPasswordPrompt>
				</OtherOptions>
				<SubmitButton disabled={!isValid} isPending={isPending} startIcon={<LoginIcon />}>
					<FormattedMessage id="auth.login.buttonText" defaultMessage="Log in" />
				</SubmitButton>
			</AuthFormLogin>
		</AuthTemplate>
	);
};
