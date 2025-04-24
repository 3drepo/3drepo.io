/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { FormattedMessage } from 'react-intl';
import { AuthTemplate } from '@components/authTemplate/authTemplate.component';
import { Footer, Form, Heading, Link } from './authPage.styles';
import { COOKIES_ROUTE, PRIVACY_ROUTE, RELEASE_NOTES_ROUTE, TERMS_ROUTE } from '../routes.constants';
import { useSSOLogin } from '@/v5/services/sso.hooks';
import { Redirect, useRouteMatch } from 'react-router';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks';
import { addParams } from '@/v5/helpers/url.helper';
import { formatMessage } from '@/v5/services/intl';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginSchema } from '@/v5/validation/userSchemes/loginSchemes';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { SubmitButton } from '@controls/submitButton';

const APP_VERSION = ClientConfig.VERSION;

export const AuthPage = () => {
	const [login] = useSSOLogin();
	const { url } = useRouteMatch();
	const returnUrl = AuthHooksSelectors.selectReturnUrl();
	const isAuthenticated = AuthHooksSelectors.selectIsAuthenticated();
	const redirectUri = addParams(returnUrl.pathname, returnUrl.search);

	const { control, formState: { isValid, errors }, handleSubmit } = useForm({
		mode: 'onChange',
		resolver: yupResolver(LoginSchema),
	});

	const onSubmit = ({ email }) => login(redirectUri, email);

	if (isAuthenticated) {
		return (<Redirect to={{ ...returnUrl, state: { referrer: url } }} />);
	}

	return (
		<AuthTemplate
			footer={(
				<a href={RELEASE_NOTES_ROUTE}>
					<FormattedMessage id="authPage.versionFooter" defaultMessage="Version: {version}" values={{ version: APP_VERSION }} />
				</a>
			)}
		>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Heading>
					<FormattedMessage id="authPage.heading" defaultMessage="Welcome to 3D Repo" />
				</Heading>
				<FormTextField
					required
					name="email"
					label={formatMessage({ defaultMessage: 'Email', id: 'authPage.email' })}
					control={control}
					formError={errors.email}
				/>
				<SubmitButton disabled={!isValid}>
					<FormattedMessage id="authPage.button" defaultMessage="Log in" />
				</SubmitButton>
				<Footer>
					<FormattedMessage
						id="authPage.footer"
						defaultMessage={`
						By using this platform, you acknowledge that you have read and agree to our 
						<TermsLink>Terms & Conditions</TermsLink>, <PrivacyLink>Privacy Policy</PrivacyLink>, and <CookieLink>Cookie Policy</CookieLink>.
					`}
						values={{
							TermsLink: (label) => <Link to={TERMS_ROUTE} target="_blank">{label}</Link>,
							PrivacyLink: (label) => <Link to={{ pathname: PRIVACY_ROUTE }} target="_blank" rel="noopener noreferrer">{label}</Link>,
							CookieLink: (label) => <Link to={{ pathname: COOKIES_ROUTE }} target="_blank" rel="noopener noreferrer">{label}</Link>,
						}}
					/>
				</Footer>
			</Form>
		</AuthTemplate>
	);
};
