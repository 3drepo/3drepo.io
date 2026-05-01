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

import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { ExtraAssigneesList, ExtraAssigneesListItem } from './extraAssignees.styles';
import { getAssigneeDisplayName } from '@/v5/store/users/users.helpers';
import { pick, toArray } from 'lodash';

type IExtraAssignees = {
	assignees: string[];
};

export const ExtraAssigneesPopover = ({ assignees }: IExtraAssignees) => {
	const allJobsAndUsers = UsersHooksSelectors.selectJobsAndUsersByIds() || {};
	const assigneeNames = toArray(pick(allJobsAndUsers, assignees)).map(getAssigneeDisplayName);
	return (
		<ExtraAssigneesList>
			{assigneeNames.map((name) => (
				<ExtraAssigneesListItem key={name}>{name}</ExtraAssigneesListItem>
			))}
		</ExtraAssigneesList>
	);
};
