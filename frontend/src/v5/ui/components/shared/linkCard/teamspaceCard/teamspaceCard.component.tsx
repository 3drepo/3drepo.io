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

import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { DEFAULT_TEAMSPACE_IMG_SRC, getTeamspaceImgSrc } from '@/v5/store/teamspaces/teamspaces.helpers';
import { uriCombine } from '@/v5/helpers/url.helper';
import { LinkCard } from '../linkCard.component';

import type { JSX } from "react";

interface ITeamspaceCard {
	teamspaceName?: string;
	className?: string;
}

export const TeamspaceCard = ({ teamspaceName, className }: ITeamspaceCard): JSX.Element => {
	const { username } = CurrentUserHooksSelectors.selectCurrentUser();

	const isPersonalTeamspace = teamspaceName === username;
	const { url } = useRouteMatch();
	const to = uriCombine(url, teamspaceName || '');
	const imgSrc = getTeamspaceImgSrc(teamspaceName);

	return (
		<LinkCard
			className={className}
			to={to}
			variant="secondary"
			heading={teamspaceName}
			imgSrc={imgSrc}
			defaultImgSrc={DEFAULT_TEAMSPACE_IMG_SRC}
			subheading={
				isPersonalTeamspace
					? <FormattedMessage id="teamspaceCard.myTeamspace" defaultMessage="My Teamspace" />
					: <FormattedMessage id="teamspaceCard.sharedWithMe" defaultMessage="Shared with me" />
			}
		/>
	);
};
