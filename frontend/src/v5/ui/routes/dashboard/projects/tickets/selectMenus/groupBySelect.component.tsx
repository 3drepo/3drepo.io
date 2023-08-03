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

import { MenuItem } from '@mui/material';
import { Select, SelectProps } from '@controls/inputs/select/select.component';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';

export const GROUP_BY_NONE_OPTION = 'None';
const GroupByNoneOptionMessage = formatMessage({ id: 'groupBy.none', defaultMessage: 'None' });

const GROUP_BY_OPTIONS = {
	[BaseProperties.OWNER]: formatMessage({ id: 'groupBy.owner', defaultMessage: 'Owner'}),
	[IssueProperties.DUE_DATE]: formatMessage({ id: 'groupBy.dueDate', defaultMessage: 'Due Date'}),
	[IssueProperties.PRIORITY]: formatMessage({ id: 'groupBy.priority', defaultMessage: 'Priority'}),
	[IssueProperties.STATUS]: formatMessage({ id: 'groupBy.status', defaultMessage: 'Status'}),
	[SafetibaseProperties.LEVEL_OF_RISK]: formatMessage({ id: 'groupBy.levelOfRisk', defaultMessage: 'Level Of Risk'}),
	[SafetibaseProperties.TREATMENT_STATUS]: formatMessage({ id: 'groupBy.treatmentStatus', defaultMessage: 'Treatment Status'}),
};

export const GroupBySelect = ({ onChange, defaultValue = null, ...props }: SelectProps) => (
	<Select
		{...props}
		defaultValue={defaultValue}
		onChange={(e) => onChange(e.target.value)}
		label={<FormattedMessage id="ticketTable.groupBy.placeholder" defaultMessage="group by:" />}
		renderValue={(groupBy: string | null) => (
			<>
				<FormattedMessage id="ticketTable.groupBy.renderValue" defaultMessage="Group by:" />
				<b> {groupBy || GroupByNoneOptionMessage}</b>
			</>
		)}
	>
		<MenuItem value={GROUP_BY_NONE_OPTION}>{GroupByNoneOptionMessage}</MenuItem>
		{Object.entries(GROUP_BY_OPTIONS).map(([key, val]) => (<MenuItem value={key} key={key}>{val}</MenuItem>))}
	</Select>
);
