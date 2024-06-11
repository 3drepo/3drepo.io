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

import { ITeamspace } from '@/v5/store/teamspaces/teamspaces.redux';
import { TeamspacesHooksSelectors, CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { TeamspaceCard } from '@components/shared/linkCard/teamspaceCard/teamspaceCard.component';
import { TeamspacePlaceholderCard } from '@components/shared/linkCard/teamspaceCard/teamspacePlaceholderCard/teamspacePlaceholderCard.component';
import { CardList } from './teamspaceList.styles';

type ITeamspaceList = {
	className?: string;
};

export const TeamspaceList = ({ className }: ITeamspaceList): JSX.Element => {
	const username = CurrentUserHooksSelectors.selectUsername();
	const teamspaces: ITeamspace[] = TeamspacesHooksSelectors.selectTeamspaces();
	const teamspacesArePending = TeamspacesHooksSelectors.selectTeamspacesArePending();

	const sortedTeamspaces = [...teamspaces].sort((a, b) => {
		if (a.name === username) return -1; // personal teamspace appears first
		if (b.name === username) return 1;
		return a.name > b.name ? 1 : -1;
	});

	return (
		<CardList className={className}>
			{sortedTeamspaces.map(({ name }) => <TeamspaceCard key={name} teamspaceName={name}/>)}
			{teamspacesArePending && (
				<>
					<TeamspacePlaceholderCard />
					<TeamspacePlaceholderCard />
					<TeamspacePlaceholderCard />
				</>
			)}
		</CardList>
	);
};
