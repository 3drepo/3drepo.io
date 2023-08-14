/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { AuthTemplate } from '@components/authTemplate';
import { Gap } from '@controls/gap';
import { SubmitButton } from '@controls/submitButton';
import { FormattedMessage } from 'react-intl';
import { SSOErrorCode } from '@/v5/services/api/sso';
import { UserSignupMain } from '../userSignup.styles';
import { Title, Container as FormContainer, LoginPrompt, LoginPromptLink } from '../userSignupForm/userSignupForm.styles';
import { Container, Link } from './userSignUpSSO.styles';

export const UserSignupSSOError = ({ error }: { error: string }) => (
	<AuthTemplate>
		<Container>
			<UserSignupMain>
				<FormContainer>
					<Title>
						{error === SSOErrorCode.EXISTING_USERNAME ? (
							<FormattedMessage
								id="userSignupSSO.error.usernameAlreadyTaken"
								defaultMessage="It looks like the selected username is already taken..."
							/>
						) : (
							<FormattedMessage
								id="userSignupSSO.error.alreadyRegistered"
								defaultMessage="It looks like you already have an account with us..."
							/>
						)}
					</Title>
					<FormattedMessage
						id="userSignupSSO.error.linkAccountMessage"
						defaultMessage="To use the Microsoft Sign In feature, you’ll need to link your existing 3D Repo account."
					/>
					<Gap />
					<FormattedMessage
						id="userSignupSSO.error.signInMessage"
						defaultMessage="Sign in using your 3D Repo credentials and we’ll direct you to where you can link your account to Microsoft."
					/>
					<Link to="/v5/login">
						<SubmitButton>
							<FormattedMessage id="userSignup.signupPrompt.signInButton" defaultMessage="Go to Sign in" />
						</SubmitButton>
					</Link>
					<LoginPrompt>
						<FormattedMessage id="userSignup.signupPrompt.message" defaultMessage="Don't have an account?" />
						<LoginPromptLink to="/v5/signup">
							<FormattedMessage id="userSignup.signupPrompt.link" defaultMessage="Sign up" />
						</LoginPromptLink>
					</LoginPrompt>
				</FormContainer>
			</UserSignupMain>
		</Container>
	</AuthTemplate>
);
