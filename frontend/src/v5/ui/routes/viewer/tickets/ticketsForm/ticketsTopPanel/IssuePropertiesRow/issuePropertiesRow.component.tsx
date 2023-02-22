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
import { PRIORITY_LEVELS_MAP, STATUS_MAP } from '@controls/chip/chip.types';
import { ChipSelect } from '@controls/chip/chipSelect/chipSelect.component';
import { DueDateWithIcon } from '@controls/dueDate/dueDateWithIcon/dueDateWithIcon.component';
import { InputController } from '@controls/inputs/inputController.component';

import { FormattedMessage } from 'react-intl';
import { ColumnSeparator, IssuePropertiesContainer, PropertyColumn, PropertyTitle } from './issuePropertiesRow.styles';

type IIssuePropertiesRow = {
	dueDate: number;
	onBlur: () => void;
};

export const IssuePropertiesRow = ({ dueDate, onBlur }: IIssuePropertiesRow) => (
	<IssuePropertiesContainer>
		<PropertyColumn>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.priority"
					defaultMessage="Priority"
				/>
			</PropertyTitle>
			<InputController
				Input={ChipSelect}
				variant="text"
				tooltip="Set priority"
				name="properties.Priority"
				onBlur={onBlur}
				key="Priority"
				values={PRIORITY_LEVELS_MAP}
			/>
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
			<InputController
				Input={ChipSelect}
				variant="text"
				tooltip="Set status"
				name="properties.Status"
				onBlur={onBlur}
				key="Status"
				values={STATUS_MAP}
			/>
		</PropertyColumn>
		<InputController
			Input={TicketDetailsAssignees}
			name="properties.Assignees"
			onBlur={onBlur}
			key="Assignees"
		/>
	</IssuePropertiesContainer>
);
