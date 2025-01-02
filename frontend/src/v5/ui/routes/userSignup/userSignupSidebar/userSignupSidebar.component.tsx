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
import { MicrosoftButton } from '@components/shared/sso/microsoftButton.component';
import { Link } from 'react-router-dom';
import { MicrosoftText } from '@components/shared/sso/microsoftText.component';
import { formatMessage } from '@/v5/services/intl';
import { Gap } from '@controls/gap';
import { Container, MainTitle } from './userSignupSidebar.styles';
import { LoginPrompt, LoginPromptLink } from '../userSignupForm/userSignupForm.styles';
import { SIGN_UP_SSO_PATH } from '../../routes.constants';

export const UserSignupSidebar = () => (
	<Container>
		<MainTitle>
			<FormattedMessage
				id="userSignup.sidebar.mainTitle"
				defaultMessage="Create your free account"
			/>
		</MainTitle>
		<div>
			<MicrosoftText
				title={formatMessage({
					id: 'userSignup.sidebar.signUpWithMicrosoft',
					defaultMessage: 'Sign up with Microsoft',
				})}
			/>
			<Link to={SIGN_UP_SSO_PATH}>
				<MicrosoftButton>
					<FormattedMessage id="userSignup.sidebar.sso.microsoft" defaultMessage="Sign up with Microsoft" />
				</MicrosoftButton>
			</Link>
			<Gap $height="43px" />
			<LoginPrompt>
				<FormattedMessage id="userSignup.loginPrompt.message" defaultMessage="Already have an account?" />
				<LoginPromptLink to="/v5/login">
					<FormattedMessage id="userSignup.loginPrompt.link" defaultMessage="Sign in" />
				</LoginPromptLink>
			</LoginPrompt>
		</div>
	</Container>
);
