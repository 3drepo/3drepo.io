/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { intersection } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { AssigneeListItem } from './assigneeListItem/assigneeListItem.component';
import { AssigneesListContainer } from './assigneesList.styles';
import { ExtraAssigneesCircle } from './extraAssignees/extraAssigneesCircle.component';
import { ExtraAssigneesPopover } from './extraAssignees/extraAssigneesPopover.component';

type IAssigneesList = {
	values: string[];
	maxItems: number;
	onClick?: (e) => void;
	className?: string;
};

export const AssigneesList = ({ values, maxItems = 3, onClick, className }: IAssigneesList) => {
	const allUsersAndJobs = UsersHooksSelectors.selectAssigneesListItems();
	const filteredValues = intersection(values, allUsersAndJobs.map((i) => i.value));
	const overflowRequired = filteredValues.length > maxItems;
	const listedAssignees = overflowRequired ? filteredValues.slice(0, maxItems - 1) : filteredValues;
	const overflowValue = overflowRequired ? filteredValues.slice(maxItems - 1).length : 0;
	return (
		<AssigneesListContainer onClick={onClick} className={className}>
			{listedAssignees.length ? (
				listedAssignees.map((assignee) => (
					<AssigneeListItem key={assignee} assignee={assignee} />
				))
			) : (
				<FormattedMessage id="assignees.unassigned" defaultMessage="Unassigned" />
			)}
			{overflowValue ? (
				<HoverPopover
					anchor={(extraProps) => <ExtraAssigneesCircle overflowValue={overflowValue} {...extraProps} />}
				>
					<ExtraAssigneesPopover assignees={filteredValues} />
				</HoverPopover>
			) : <></>}
		</AssigneesListContainer>
	);
};
