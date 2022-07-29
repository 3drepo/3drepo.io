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

import { FormattedMessage } from 'react-intl';
import { Container, Title } from '../userSignupForm/userSignupForm.styles';
import {
	Body,
	EmailIcon,
	Subtitle,
	ActionMessage,
	EmailAddress,
	InfoMessage,
	HelpMessage,
	Link,
} from './userSignupWelcome.styles';

export type UserSignupWelcomeProps = {
	email: string;
	firstName: string;
};

export const UserSignupWelcome = ({ firstName, email }: UserSignupWelcomeProps) => (
	<Container>
		<Title>
			<FormattedMessage
				id="userSignup.confirmation.title"
				defaultMessage="Welcome, {firstName}!"
				values={{ firstName }}
			/>
		</Title>
		<Body>
			<EmailIcon />
			<Subtitle>
				<FormattedMessage
					id="userSignup.confirmation.subtitle"
					defaultMessage="First, let's verify your email"
				/>
			</Subtitle>
			<ActionMessage>
				<FormattedMessage
					id="userSignup.confirmation.checkEmail"
					defaultMessage="Check {email} to verify your account and get started."
					values={{
						email: <EmailAddress>{email}</EmailAddress>,
					}}
				/>
			</ActionMessage>
			<InfoMessage>
				<FormattedMessage
					id="userSignup.confirmation.description"
					defaultMessage={`
						If you have not received your verification email, please
						check your spam folder or ask your email administrator for assistance.
					`}
				/>
			</InfoMessage>
			<HelpMessage>
				<FormattedMessage
					id="userSignup.confirmation.help"
					defaultMessage="Need help? Visit {support} or {contact} us."
					values={{
						support: (
							<Link
								to={{ pathname: 'https://3drepo.com/support/' }}
							>
								<FormattedMessage id="userSignup.confirmation.help.support" defaultMessage="support" />
							</Link>
						),
						contact: (
							<Link to={{ pathname: 'https://3drepo.com/contact/' }}>
								<FormattedMessage id="userSignup.confirmation.help.contact" defaultMessage="contact" />
							</Link>
						),
					}}
				/>
			</HelpMessage>
		</Body>
	</Container>
);
