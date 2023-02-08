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

import { Assignees } from '@controls/assignees/assignees.component';
import { PriorityLevelChip, PriorityLevels, TicketStatusChip, TicketStatuses } from '@controls/chip';
import { DueDate } from '@controls/dueDate/dueDate.component';
import { FormattedMessage } from 'react-intl';
import { ColumnSeparator, DueDate, IssuePropertiesContainer, PropertyColumn, PropertyTitle, Status } from './issuePropertiesRow.styles';

type IIssuePropertiesRow = {
	priority: PriorityLevels;
	dueDate: number;
	status: TicketStatuses;
	assignees: string[];
	onBlur: () => void;
};

export const IssuePropertiesRow = ({ priority, dueDate, status, assignees, onBlur }: IIssuePropertiesRow) => (
	<IssuePropertiesContainer>
		<PropertyColumn>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.priority"
					defaultMessage="Priority"
				/>
			</PropertyTitle>
			<PriorityLevelChip state={priority} />
		</PropertyColumn>
		<PropertyColumn>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.dueDate"
					defaultMessage="Due"
				/>
			</PropertyTitle>
			<DueDate value={dueDate} />
		</PropertyColumn>
		<PropertyColumn>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.status"
					defaultMessage="Status"
				/>
			</PropertyTitle>
			<Status state={status} />
		</PropertyColumn>
		<Assignees max={4} values={assignees} onBlur={onBlur} />
	</IssuePropertiesContainer>
);
