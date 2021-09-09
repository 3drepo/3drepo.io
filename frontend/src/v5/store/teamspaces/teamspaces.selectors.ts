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

import { createSelector } from 'reselect';
import { useParams } from 'react-router';

export const selectTeamspacesDomain = () => ({
	teamspaces: [
		{
			name: 'teamspace1',
			isAdmin: true,
			projects: [
				'5bea8d8c-531f-f85d-47ea-e72600000000',
				'5bea8e1c-531f-f85d-47ea-e79100000000',
				'5bea8eb9-531f-f85d-47ea-e7fc00000000',
				'5c0e60b3-d770-c252-5a81-c6f600000000',
				'5cee4c80-26ce-da7d-f03a-7a4d00000000',
				'5cf8c303-e197-a2d2-f7fc-457000000000',
				'5d70b6e2-7c89-b354-aef1-758a00000000',
				'5d70c4f2-7c89-b354-aef1-b23b00000000',
				'd9700e80-da5f-11eb-8ec1-8d1afc9aca23',
				'e120df80-db1b-11eb-8bb6-7dae7a76300c',
			],
		},
		{
			name: 'teamspace2',
			isAdmin: true,
			projects: [
				'project_title_1',
				'project_title_2',
				'project_title_3',
				'project_title_4',
				'project_title_5',
				'project_title_6',
				'project_title_7',
				'project_title_8',
				'project_title_9',
				'project_title_10',
			],
		},
	],
});

export const selectTeamspaces = createSelector(
	selectTeamspacesDomain, (state) => state.teamspaces,
);

export const selectTeamspacesList = createSelector(
	selectTeamspaces, (state) => state.map(({ name }) => name),
);

export const selectCurrentProjectsList = createSelector(
	selectTeamspacesDomain, ({ teamspaces }) => {
		const { teamspace } = useParams();
		return teamspaces.find(({ name }) => name === teamspace)?.projects;
	},
);
