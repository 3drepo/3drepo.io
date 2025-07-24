/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import NotFoundIcon from '@assets/icons/filled/404-filled.svg';
import { Link } from 'react-router-dom';
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';
import { AppBar } from '@components/shared/appBar';
import { Container, Title, Message, ButtonsContainer } from './notFound.styles';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/v5/ui/themes/theme';
import { IntercomProvider } from 'react-use-intercom';
import { clientConfigService } from '@/v4/services/clientConfig';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useEffect, type JSX } from 'react';
import { formatMessage } from '@/v5/services/intl';

export const NotFound = (): JSX.Element => {
	const { intercomLicense } = clientConfigService;
	const isAuthenticated = AuthHooksSelectors.selectIsAuthenticated();
	const authenticationFetched = AuthHooksSelectors.selectAuthenticationFetched();

	const message = isAuthenticated ? formatMessage({ id: 'notFound.message.authenticated', defaultMessage: 'You can return to your dashboard, or contact our support team if you can\'t find what you\'re looking for.' })
		: formatMessage({ id: 'notFound.message.unauthenticated', defaultMessage: 'You can contact our support team if you can\'t find what you\'re looking for.' });

	useEffect(() => {
		if (!authenticationFetched) {
			AuthActionsDispatchers.authenticate();
		}
	}, [authenticationFetched]);

	return (
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<IntercomProvider appId={intercomLicense}>
					<GlobalStyle />
					<AppBar />
					<Container>
						<NotFoundIcon />
						<Title>
							<FormattedMessage id="notFound.title" defaultMessage="Sorry, but the page you were looking for could not be found." />
						</Title>
						<Message>
							{authenticationFetched && message}
						</Message>
						<ButtonsContainer>
							{
								isAuthenticated && (
									<Button
										variant="contained"
										color="primary"
										component={Link}
										to="/v5/dashboard"
									>
										<FormattedMessage
											id="notFound.goToDashboardButton.label"
											defaultMessage="Go to your Dashboard"
										/>
									</Button>
								)
							}
							<Button
								variant="outlined"
								color="primary"
								href="https://3drepo.com/contact/"
							>
								<FormattedMessage
									id="notFound.contactSupportButton.label"
									defaultMessage="Contact support team"
								/>
							</Button>
						</ButtonsContainer>
					</Container>
				</IntercomProvider>
			</MuiThemeProvider>
		</ThemeProvider>
	);
};
