/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { flatten, partition } from 'lodash';
import { AddTeamspaceCard, TeamspaceCard, PlaceholderCard } from '@components/shared/teamspaceCard';
import { ITeamspace } from '@/v5/store/teamspaces/teamspaces.redux';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { clientConfigService } from '@/v4/services/clientConfig';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { CardList } from './teamspaceList.styles';

type ITeamspaceList = {
	className?: string;
};

export const TeamspaceList = ({ className }: ITeamspaceList): JSX.Element => {
	const username = CurrentUserHooksSelectors.selectUsername();
	const teamspaces: ITeamspace[] = TeamspacesHooksSelectors.selectTeamspaces();
	const sortedTeamspaces = flatten(partition(teamspaces, (ts) => ts.name === username));

	return (
		<CardList className={className}>
			{
				teamspaces.length ? (
					sortedTeamspaces.map((teamspace) => (
						<TeamspaceCard
							key={teamspace.name}
							variant="secondary"
							teamspaceName={teamspace.name}
							imageURL={generateV5ApiUrl(`teamspaces/${teamspace.name}/avatar?${Date.now()}`, clientConfigService.GET_API)}
						/>
					))
				) : (
					<>
						<PlaceholderCard variant="secondary" />
						<PlaceholderCard variant="secondary" />
						<PlaceholderCard variant="secondary" />
					</>
				)
			}
			{ !!teamspaces.length && (<AddTeamspaceCard variant="secondary" />) }
		</CardList>
	);
};
