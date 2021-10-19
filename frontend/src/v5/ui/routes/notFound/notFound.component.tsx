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

import React from 'react';
import { Trans } from '@lingui/react';
import NotFoundIcon from '@assets/icons/404.svg';
import { Link } from 'react-router-dom';
import { Button } from '@controls/button';
import { Container, Title, Message, ButtonsContainer } from './notFound.styles';

export const NotFound = (): JSX.Element => (
	<Container>
		<NotFoundIcon />
		<Title>
			<Trans id="notFound.title" message="Sorry, but the page you were looking for could not be found." />
		</Title>
		<Message>
			<Trans
				id="notFound.message"
				message="You can return to our dashboard, or contact our support team if you can't find what you're looking for."
			/>
		</Message>
		<ButtonsContainer>
			<Button
				variant="contained"
				color="primary"
				component={Link}
				to="/v5/dashboard"
			>
				<Trans
					id="notFound.goToDashboardButton.label"
					message="Go to your Dashboard"
				/>
			</Button>
			<Button
				variant="outlined"
				color="primary"
				href="https://3drepo.com/contact/"
			>
				<Trans
					id="notFound.contactSupportButton.label"
					message="Contact support team"
				/>
			</Button>
		</ButtonsContainer>
	</Container>
);
