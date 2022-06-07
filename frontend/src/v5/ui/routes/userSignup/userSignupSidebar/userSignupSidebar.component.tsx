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
import { LoginLink, Logo } from '@components/authTemplate/authTemplate.styles';
import {
	Container,
	BulletPoint,
	BulletPointMessage,
	BulletPointTitle,
	BulletPointBody,
	BulletPointIcon,
	Check,
	BookADemoButton,
	LaptopIcon,
	MainTitle,
} from './userSignupSidebar.styles';

export const UserSignupSidebar = () => (
	<Container>
		<LoginLink>
			<Logo />
		</LoginLink>
		<MainTitle>
			<FormattedMessage
				id="userSignup.sidebar"
				defaultMessage={`
					3D Repo is the most accessible BIM 
					collaboration platform to enable open 
					and transparent communication for AECO 
					projects of all sizes.
				`}
			/>
		</MainTitle>
		<BulletPoint>
			<BulletPointIcon>
				<Check />
			</BulletPointIcon>
			<BulletPointMessage>
				<BulletPointTitle>
					<FormattedMessage
						id="userSignup.sidebar.noSoftwareInstallation.title"
						defaultMessage="Security & encryption"
					/>
				</BulletPointTitle>
				<BulletPointBody>
					<FormattedMessage
						id="userSignup.sidebar.noSoftwareInstallation.message"
						defaultMessage="Reduce required BIM coordination and data checking time by up to 35%."
					/>
				</BulletPointBody>
			</BulletPointMessage>
		</BulletPoint>
		<BulletPoint>
			<BulletPointIcon>
				<Check />
			</BulletPointIcon>
			<BulletPointMessage>
				<BulletPointTitle>
					<FormattedMessage
						id="userSignup.sidebar.securityAndExnryption.title"
						defaultMessage="No software installation"
					/>
				</BulletPointTitle>
				<BulletPointBody>
					<FormattedMessage
						id="userSignup.sidebar.securityAndExnryption.message"
						defaultMessage="Automating manual tasks can boost related data accuracy by up to 95%."
					/>
				</BulletPointBody>
			</BulletPointMessage>
		</BulletPoint>
		<BulletPoint>
			<BulletPointIcon>
				<Check />
			</BulletPointIcon>
			<BulletPointMessage>
				<BulletPointTitle>
					<FormattedMessage
						id="userSignup.sidebar.integration.title"
						defaultMessage="Integration - open API’s"
					/>
				</BulletPointTitle>
				<BulletPointBody>
					<FormattedMessage
						id="userSignup.sidebar.integration.message"
						defaultMessage="Get the whole team on the same page and talking to each other."
					/>
				</BulletPointBody>
			</BulletPointMessage>
		</BulletPoint>
		<BookADemoButton
			to={{ pathname: 'https://3drepo.com/demo/' }}
			startIcon={<LaptopIcon />}
		>
			<FormattedMessage id="userSignup.sidebar.bookADemo" defaultMessage="Book A Demo" />
		</BookADemoButton>
	</Container>
);
