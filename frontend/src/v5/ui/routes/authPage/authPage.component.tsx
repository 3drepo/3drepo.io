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
import { AuthTemplate } from '@components/authTemplate';
import { Button, Footer, Container, Heading, Link } from './authPage.styles';
import { COOKIES_ROUTE, PRIVACY_ROUTE, RELEASE_NOTES_ROUTE, TERMS_ROUTE } from '../routes.constants';
import { useSSOAuth } from '@/v5/services/sso.hooks';

const APP_VERSION = ClientConfig.VERSION;

export const AuthPage = () => {
	const [authWithSSO] = useSSOAuth();
	return (
		<AuthTemplate
			footer={(
				<a href={RELEASE_NOTES_ROUTE}>
					<FormattedMessage id="authPage.versionFooter" defaultMessage="Version: {version}" values={{ version: APP_VERSION }} />
				</a>
			)}
		>
			<Container>
				<Heading>
					<FormattedMessage id="authPage.heading" defaultMessage="Welcome to 3D Repo" />
				</Heading>
				<Button onClick={authWithSSO}>
					<FormattedMessage id="authPage.button" defaultMessage="Log in / Sign up" />
				</Button>
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
			</Container>
		</AuthTemplate>
	);
};
