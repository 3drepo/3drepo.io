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

import { formatMessage } from '@/v5/services/intl';
import { uriCombine } from '@/v5/services/routing/routing';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { FormattedMessage } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { CardHeading, CardSubheading, Container, Content, ListItem, TeamspaceImage, TeamspaceLogo, Link } from './teamspaceCard.styles';

interface ITeamspaceCard {
	variant?: 'primary' | 'secondary',
	teamspaceName?: string;
	imageURL?: string;
	className?: string;
}

export const TeamspaceCard = ({ variant = 'primary', teamspaceName, imageURL, className }: ITeamspaceCard): JSX.Element => {
	const username = CurrentUserHooksSelectors.selectUsername();
	const isPersonalTeamspace = teamspaceName === username;
	const { url } = useRouteMatch();
	const to = uriCombine(url, teamspaceName || '');
	return (
		<ListItem>
			<Link to={to}>
				<Container $variant={variant} className={className}>
					{
						isPersonalTeamspace
							? (
								<TeamspaceImage
									title={formatMessage({
										id: 'teamspaceSelect.teamspaceImageAlt',
										defaultMessage: 'Image for {teamspaceName} teamspace',
									}, { teamspaceName })}
									imageURL={imageURL}
								/>
							) : (
								<TeamspaceImage>
									<TeamspaceLogo
										src={imageURL}
										alt={formatMessage({
											id: 'teamspaceSelect.teamspaceImageAlt',
											defaultMessage: 'Image for {teamspaceName} teamspace',
										}, { teamspaceName })}
									/>
								</TeamspaceImage>
							)
					}
					<Content>
						<CardHeading>{teamspaceName}</CardHeading>
						<CardSubheading>
							{
								isPersonalTeamspace
									? <FormattedMessage id="teamspaceCard.myTeamspace" defaultMessage="My Teamspace" />
									: <FormattedMessage id="teamspaceCard.sharedWithMe" defaultMessage="Shared with me" />
							}
						</CardSubheading>
					</Content>
				</Container>
			</Link>
		</ListItem>
	);
};
