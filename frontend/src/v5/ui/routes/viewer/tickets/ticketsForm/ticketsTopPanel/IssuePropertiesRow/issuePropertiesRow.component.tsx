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

import { TicketDetailsAssignees } from '@controls/assignees/ticketDetailsAssignees/ticketDetailAssignees.component';
import { PriorityLevelChip, PriorityLevels, TicketStatuses } from '@controls/chip';
import { DueDateWithIcon } from '@controls/dueDate/dueDateWithIcon/dueDateWithIcon.component';
import { InputController } from '@controls/inputs/inputController.component';
import { FormattedMessage } from 'react-intl';
import { ColumnSeparator, IssuePropertiesContainer, PropertyColumn, PropertyTitle, Status } from './issuePropertiesRow.styles';

type IIssuePropertiesRow = {
	priority: PriorityLevels;
	dueDate: number;
	status: TicketStatuses;
	onBlur: () => void;
};

export const IssuePropertiesRow = ({ priority, dueDate, status, onBlur }: IIssuePropertiesRow) => (
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
		<ColumnSeparator />
		<PropertyColumn>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.dueDate"
					defaultMessage="Due"
				/>
			</PropertyTitle>
			<DueDateWithIcon value={dueDate} onBlur={onBlur} />
		</PropertyColumn>
		<ColumnSeparator />
		<PropertyColumn>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.status"
					defaultMessage="Status"
				/>
			</PropertyTitle>
			<Status state={status} />
		</PropertyColumn>
		<InputController
			Input={TicketDetailsAssignees}
			name="properties.Assignees"
			onBlur={onBlur}
			key="Assignees"
		/>
	</IssuePropertiesContainer>
);
