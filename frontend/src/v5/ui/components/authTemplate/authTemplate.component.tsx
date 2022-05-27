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

import { AuthHooksSelectors } from '@/v5/services/selectorsHooks/authSelectors.hooks';
import { useRouteMatch, Redirect } from 'react-router-dom';
import { clientConfigService } from '@/v4/services/clientConfig';
import { Background, Container, Footer, Logo, BackgroundOverlay } from './authTemplate.styles';

interface IAuthTemplate {
	footer?: JSX.Element;
	children: JSX.Element | JSX.Element[];
}

export const AuthTemplate = ({ footer, children }: IAuthTemplate): JSX.Element => {
	const { url } = useRouteMatch();
	const returnUrl = AuthHooksSelectors.selectReturnUrl();

	if (AuthHooksSelectors.selectIsAuthenticated()) {
		return (<Redirect to={{ ...returnUrl, state: { referrer: url } }} />);
	}

	const backgroundSrc = clientConfigService.getCustomBackgroundImagePath();

	return (
		<Background>
			{!backgroundSrc && <BackgroundOverlay />}
			<Logo />
			<Container>
				{children}
			</Container>
			<Footer>
				{footer}
			</Footer>
		</Background>
	);
};
