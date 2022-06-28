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

import { uriCombine } from '@/v5/services/routing/routing';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { LinkCard } from '../linkCard.component';
import { OtherTeamspaceImage, MyTeamspaceImage } from './teamspaceCard.styles';

interface ITeamspaceCard {
	teamspaceName?: string;
	imageURL?: string;
	className?: string;
}

export const TeamspaceCard = ({ teamspaceName, imageURL, ...props }: ITeamspaceCard): JSX.Element => {
	const user = CurrentUserHooksSelectors.selectCurrentUser();
	const isPersonalTeamspace = teamspaceName === user.username;
	const { url } = useRouteMatch();
	const to = uriCombine(url, teamspaceName || '');

	const [imgSrc, setImgSrc] = useState(imageURL);
	const DEFAULT_IMAGE = 'assets/images/teamspace_placeholder.svg';
	const onImageError = () => {
		setImgSrc(DEFAULT_IMAGE);
	};
	return (
		<LinkCard
			{...props}
			to={to}
			variant="secondary"
			heading={teamspaceName}
			subheading={
				isPersonalTeamspace
					? <FormattedMessage id="teamspaceCard.myTeamspace" defaultMessage="My Teamspace" />
					: <FormattedMessage id="teamspaceCard.sharedWithMe" defaultMessage="Shared with me" />
			}
		>
			{
				isPersonalTeamspace
					? <MyTeamspaceImage user={user} isButton={false} />
					: <OtherTeamspaceImage src={imgSrc} onError={onImageError} />
			}
		</LinkCard>
	);
};
