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
import MicrosoftIcon from '@assets/icons/thirdParty/microsoft.svg';
import {
	Container,
	SSOButton,
	MainTitle,
	SignUpWithMicrosoftText,
	MicrosoftInstructionsRemarkText,
	MicrosoftInstructionsTermsText,
	MicrosoftInstructionsText,
	Link,
	SidebarContent,
	NewSticker,
} from './userSignupSidebar.styles';
import { LoginPrompt, LoginPromptLink } from '../userSignupForm/userSignupForm.styles';
import { TERMS_ROUTE, PRIVACY_ROUTE } from '../../routes.constants';

export const UserSignupSidebar = () => (
	<Container>
		<MainTitle>
			<FormattedMessage
				id="userSignup.sidebar.mainTitle"
				defaultMessage="Create your free account"
			/>
		</MainTitle>
		<SignUpWithMicrosoftText>
			<FormattedMessage
				id="userSignup.sidebar.signUpWithMicrosoft"
				defaultMessage="Sign up with microsoft"
			/>
			<NewSticker>
				<FormattedMessage
					id="userSignup.sidebar.new"
					defaultMessage="New"
				/>
			</NewSticker>
		</SignUpWithMicrosoftText>
		<SidebarContent>
			<MicrosoftInstructionsText>
				<FormattedMessage
					id="userSignup.sidebar.signUpWithMicrosoftInstructions"
					defaultMessage={`
					You can now link your Microsoft account and sign in to 3D Repo using your Microsoft account. It’s quick, easy, and secure.
				`}
				/>
			</MicrosoftInstructionsText>
			<MicrosoftInstructionsRemarkText>
				<FormattedMessage
					id="userSignup.sidebar.signUpWithMicrosoftInstructionsRemark"
					defaultMessage={`
					Your Microsoft data will be completely private.
				`}
				/>
			</MicrosoftInstructionsRemarkText>
			<MicrosoftInstructionsTermsText>
				<FormattedMessage
					id="userSignup.sidebar.signUpWithMicrosoftTerms"
					defaultMessage={`
					By creating an account using your Microsoft account, you agree to our <TermsLink>Terms</TermsLink> and <PrivacyLink>Privacy Policy</PrivacyLink>.
				`}
					values={{
						TermsLink: (label) => <Link to={TERMS_ROUTE} target="_blank">{label}</Link>,
						PrivacyLink: (label) => <Link to={PRIVACY_ROUTE} target="_blank">{label}</Link>,
					}}

				/>
			</MicrosoftInstructionsTermsText>
			<SSOButton
				to={{ pathname: 'signup-sso' }}
				startIcon={<MicrosoftIcon />}
			>
				<FormattedMessage id="userSignup.sidebar.sso.microsoft" defaultMessage="Sign up with Microsoft" />
			</SSOButton>
			<LoginPrompt>
				<FormattedMessage id="userSignup.loginPrompt.message" defaultMessage="Already have an account?" />
				<LoginPromptLink to="/v5/login">
					<FormattedMessage id="userSignup.loginPrompt.link" defaultMessage="Sign in" />
				</LoginPromptLink>
			</LoginPrompt>
		</SidebarContent>
	</Container>
);
