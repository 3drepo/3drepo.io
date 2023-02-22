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

import { BlueLogo, LogoContainer } from '@components/authTemplate/authTemplate.styles';
import { FormattedMessage } from 'react-intl';
import { Background, Container, LogoHeightBalancer, UserSignupMain } from '../userSignup.styles';
import { Title, Container as FormContainer, LoginPrompt, LoginPromptLink } from '../userSignupForm/userSignupForm.styles';

export const UserSignupSSOError = () => (
	<Container>
		<Background>
			<UserSignupMain>
				<LogoContainer>
					<BlueLogo />
				</LogoContainer>
				<LogoHeightBalancer />
				<FormContainer>
					<Title>
						<FormattedMessage id="userSignupSSO.title" defaultMessage="We just need a few more details from you..." />
					</Title>

					<LoginPrompt>
						<FormattedMessage id="userSignup.loginPrompt.message" defaultMessage="Already have an account?" />
						<LoginPromptLink to="/v5/login">
							<FormattedMessage id="userSignup.loginPrompt.link" defaultMessage="Log in" />
						</LoginPromptLink>
					</LoginPrompt>
				</FormContainer>
			</UserSignupMain>
		</Background>
	</Container>
);
