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
import { PRIVACY_ROUTE, TERMS_ROUTE } from '@/v5/ui/routes/routes.constants';
import {
	Container,
	MicrosoftTitleText,
	MicrosoftInstructionsText,
	MicrosoftInstructionsRemarkText,
	MicrosoftInstructionsTermsText,
	Link,
} from './microsoftText.styles';

type MicrosoftTextProps = {
	title: string,
	className?: string,
};
export const MicrosoftText = ({ title, className }: MicrosoftTextProps) => (
	<Container className={className}>
		<MicrosoftTitleText>
			{title}
		</MicrosoftTitleText>
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
					PrivacyLink: (label) => <Link to={{ pathname: PRIVACY_ROUTE }} target="_blank" rel="noopener noreferrer">{label}</Link>,
				}}

			/>
		</MicrosoftInstructionsTermsText>
	</Container>
);
