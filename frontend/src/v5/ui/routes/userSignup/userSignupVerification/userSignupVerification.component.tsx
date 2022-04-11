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
import TwitterIcon from '@assets/icons/socials/twitter.svg';
import FacebookIcon from '@assets/icons/socials/facebook.svg';
import GitHubIcon from '@assets/icons/socials/github.svg';
import LinkedInIcon from '@assets/icons/socials/linkedin.svg';
import YouTubeIcon from '@assets/icons/socials/youtube.svg';
import { verifyUser } from '@/v5/services/api/signup';
import {
	Container,
	Logo,
	VerificationBox,
	Title,
	Body,
	Subtitle,
	VerificationButton,
	Divider,
	InfoMessage,
	GreetingsMessage,
	GreetingsAuthor,
	Link,
	EmailLink,
	Footer,
	FooterText,
	SocialIconsContainer,
	SocialIcon,
} from './userSignupVerification.styles';

export const UserSignupVerification = () => {
	const [
		firstName = 'Ale',
		username = 'aleLocal',
		token = 'wefb73rhnqwdr23e-w4tr3d4-4few+w',
	] = window.location.search.split('=');

	const verifyAccount = () => verifyUser(token, username);

	return (
		<Container>
			<Logo />
			<VerificationBox>
				<Body>
					<Title>
						<FormattedMessage
							id="userSignup.verification.title"
							defaultMessage="Hello {firstName},"
							values={{ firstName }}
						/>
					</Title>
					<Subtitle>
						<FormattedMessage
							id="userSignup.verification.subtitle"
							defaultMessage="Thank you for signing up to 3D Repo!"
						/>
					</Subtitle>
					<InfoMessage>
						<FormattedMessage
							id="userSignup.verification.clickButtonPrompt"
							defaultMessage="Please click the button below to verify your email address:"
						/>
					</InfoMessage>
					<VerificationButton onClick={verifyAccount}>
						<FormattedMessage
							id="userSignup.verification.button"
							defaultMessage="Verify email address"
						/>
					</VerificationButton>
					<Divider />
					<InfoMessage>
						<FormattedMessage
							id="userSignup.verification.info.agreement"
							defaultMessage="By verifying your email address you are agreeing to 3D Repo's {terms}."
							values={{
								terms: (
									<Link
										to="/terms"
										target="_blank"
									>
										<FormattedMessage
											id="userSignup.verification.info.agreement.terms"
											defaultMessage="Terms of Service"
										/>
									</Link>
								),
							}}
						/>
					</InfoMessage>
					<InfoMessage>
						<FormattedMessage
							id="userSignup.verification.info.support"
							defaultMessage="For any queries please contact our support team at {supportEmail}."
							values={{
								supportEmail: (
									<EmailLink>support@3drepo.org</EmailLink>
								),
							}}
						/>
					</InfoMessage>
					<GreetingsMessage>
						<FormattedMessage
							id="userSignup.verification.greetings"
							defaultMessage="All the best,"
						/>
					</GreetingsMessage>
					<GreetingsAuthor>
						<FormattedMessage
							id="userSignup.verification.singature"
							defaultMessage="3D Repo team"
						/>
					</GreetingsAuthor>
				</Body>
			</VerificationBox>
			<Footer>
				<SocialIconsContainer>
					<SocialIcon to={{ pathname: 'twitter.com/3drepo' }}>
						<TwitterIcon />
					</SocialIcon>
					<SocialIcon to={{ pathname: 'en-gb.facebook.com/3DRepo/' }}>
						<FacebookIcon />
					</SocialIcon>
					<SocialIcon to={{ pathname: 'www.linkedin.com/company/3d-repo' }}>
						<LinkedInIcon />
					</SocialIcon>
					<SocialIcon to={{ pathname: 'github.com/3drepo' }}>
						<GitHubIcon />
					</SocialIcon>
					<SocialIcon to={{ pathname: 'www.youtube.com/channel' }}>
						<YouTubeIcon />
					</SocialIcon>
				</SocialIconsContainer>
				<FooterText>
					<FormattedMessage
						id="userSignup.verification.footer.copyright"
						defaultMessage={`Copyright © ${new Date().getFullYear()} 3D Repo Ltd. all rights reserved.`}
					/>
				</FooterText>
				<FooterText>
					<FormattedMessage
						id="userSignup.verification.footer.address"
						defaultMessage="3D Repo, 307 Euston Road, Bloomsbury,{br}London, NW1 3AD, United Kingdom."
						values={{ br: <br /> }}
					/>
				</FooterText>
			</Footer>
		</Container>
	);
};
