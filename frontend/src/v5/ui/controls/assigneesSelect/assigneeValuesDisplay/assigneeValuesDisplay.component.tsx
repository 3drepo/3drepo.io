/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import AddUserIcon from '@assets/icons/outlined/add_user-outlined.svg';
import { AddUserButton, Tooltip } from '../assigneesSelect.styles';
import { AssigneeCircle } from '../assigneeCircle/assigneeCircle.component';
import { ExtraAssigneesPopover } from '../extraAssigneesCircle/extraAssigneesPopover.component';
import { ExtraAssigneesCircle } from '../extraAssigneesCircle/extraAssignees.styles';

export type AssigneesValuesDisplayProps = {
	value: any[];
	disabled?: boolean;
	maxItems?: number;
	showEmptyText?: boolean;
};
export const AssigneesValuesDisplay = ({
	value,
	maxItems = 3,
	showEmptyText = false,
	disabled,
}) => {
	// Using this logic instead of a simple partition because ExtraAssigneesCircle needs to occupy
	// the last position when the overflow value is 2+. There is no point showing +1 overflow
	// since the overflowing assignee could just be displayed instead
	const overflowRequired = value.length > maxItems;
	const listedAssignees = overflowRequired ? value.slice(0, maxItems - 1) : value;
	const overflowValue = overflowRequired ? value.slice(maxItems - 1).length : 0;
	return (
		<>
			{!listedAssignees.length && showEmptyText && (
				<FormattedMessage id="assignees.circleList.unassigned" defaultMessage="Unassigned" />
			)}
			{listedAssignees.map((assignee) => (
				<AssigneeCircle key={assignee} assignee={assignee} size="small" />
			))}
			{overflowRequired && (
				<HoverPopover
					anchor={(attrs) => <ExtraAssigneesCircle {...attrs}> +{overflowValue} </ExtraAssigneesCircle>}
				>
					<ExtraAssigneesPopover assignees={value} />
				</HoverPopover>
			)}
			{!disabled && (
				<Tooltip
					title={formatMessage({
						id: 'customTicket.topPanel.addAssignees.tooltip',
						defaultMessage: 'Assign',
					})}
					arrow
				>
					<AddUserButton>
						<AddUserIcon />
					</AddUserButton>
				</Tooltip>
			)}
		</>
	);
};