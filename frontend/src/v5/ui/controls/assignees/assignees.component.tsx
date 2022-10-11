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
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { UsersActionsDispatchers } from '@/v5/services/actionsDispatchers/usersAction.dispatchers';
import { Popover } from '@controls/popover/popover.component';
import { AssigneesList, ExtraAssignees } from './assignees.styles';
import { ExtraAssigneesPopover } from './extraAssignees/extraAssigneesPopover.component';
import { AssigneeListItem } from './assigneeListItem/assigneeListItem.component';
import { DashboardParams } from '../../routes/routes.constants';

type AssigneesType = {
	assignees: string[];
	max?: number;
	className?: string;
};

export const Assignees = ({ assignees = [], max, className }: AssigneesType) => {
	const { teamspace } = useParams<DashboardParams>();

	UsersActionsDispatchers.fetchUsers(teamspace);

	let displayedAssignees = assignees ?? [];
	let extraAssignees = [];
	if (max && assignees.length > max) {
		displayedAssignees = assignees.slice(0, max - 1);
		extraAssignees = assignees.slice(max - 1);
	}

	return (
		<AssigneesList className={className}>
			{assignees.length && displayedAssignees.length ? (
				displayedAssignees.map((assignee) => (
					<AssigneeListItem key={assignee} assignee={assignee} />
				))
			) : (
				<FormattedMessage id="assignedAssignees.unassigned" defaultMessage="Unassigned" />
			)}
			{extraAssignees.length ? (
				<Popover
					anchor={(props) => <ExtraAssignees assignees={extraAssignees} {...props} />}
					popoverContent={() => <ExtraAssigneesPopover assignees={extraAssignees} />}
				/>
			) : <></>}
		</AssigneesList>
	);
};
