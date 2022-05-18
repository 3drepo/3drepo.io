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
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks/authSelectors.hooks';
import { useRouteMatch, Redirect } from 'react-router-dom';
import { Background, Container, Footer, Logo, BackgroundOverlay } from './authPage.styles';

interface IAuthPage {
	footer?: JSX.Element;
	children: JSX.Element;
}

export const AuthPage = ({ footer, children }: IAuthPage): JSX.Element => {
	const { url } = useRouteMatch();
	const returnUrl = AuthHooksSelectors.selectReturnUrl();

	if (AuthHooksSelectors.selectIsAuthenticated()) {
		return (<Redirect to={{ pathname: returnUrl, state: { referrer: url } }} />);
	}

	const getSubdomain = () => {
		const host = window.location.hostname;
		if (host.indexOf('.') < 0) return '';
		return host.split('.')[0];
	};

	const customLogin = ClientConfig.customLogins[getSubdomain()];
	const topLogoSrc = customLogin?.topLogo || 'assets/images/3drepo-logo-white.png';
	const backgroundSrc = customLogin?.backgroundImage;

	return (
		<Background backgroundSrc={backgroundSrc}>
			{!backgroundSrc && <BackgroundOverlay />}
			<Logo
				draggable="false"
				src={topLogoSrc}
				alt={formatMessage({ id: 'auth.logo.alt', defaultMessage: 'Logo' })}
			/>
			<Container>
				{children}
			</Container>
			<Footer>
				{footer}
			</Footer>
		</Background>
	);
};
