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

import { FormattedMessage } from 'react-intl';
import { FormSelect } from '@controls/inputs/formInputs.component';
import { ListSubheader, MenuItem } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';

export const FilterOperationSelect = () => (
	<FormSelect
		placeholder={formatMessage({ id: 'ticket.groups.operation.placeholder', defaultMessage: 'Set operation'})}
		name='operation'
		label={formatMessage({ id: 'tickets.groups.operation.label', defaultMessage: 'Operation' })}
		required
	>
		{/* Field */}
		<ListSubheader>
			<FormattedMessage id="ticket.groups.operation.field" defaultMessage="Field" />
		</ListSubheader>
		<MenuItem value="EXISTS">
			<FormattedMessage id="filter.operation.exists" defaultMessage="exists" />
		</MenuItem>
		<MenuItem value="NOT_EXISTS">
			<FormattedMessage id="filter.operation.doesNotExist" defaultMessage="does not exist" />
		</MenuItem>
		{/* Text */}
		<ListSubheader>
			<FormattedMessage id="ticket.groups.operation.text" defaultMessage="Text" />
		</ListSubheader>
		<MenuItem value="IS">
			<FormattedMessage id="filter.operation.is" defaultMessage="is" />
		</MenuItem>
		<MenuItem value="IS_NOT">
			<FormattedMessage id="filter.operation.isNot" defaultMessage="is not" />
		</MenuItem>
		<MenuItem value="CONTAINS">
			<FormattedMessage id="filter.operation.contains" defaultMessage="contains" />
		</MenuItem>
		<MenuItem value="NOT_CONTAINS">
			<FormattedMessage id="filter.operation.doesNotContain" defaultMessage="does not contain" />
		</MenuItem>
		{/* Text - Regex */}
		<MenuItem value="REGEX">
			<FormattedMessage id="filter.operation.regex" defaultMessage="regex" />
		</MenuItem>
		{/* Number */}
		<ListSubheader>
			<FormattedMessage id="ticket.groups.operation.number" defaultMessage="Number" />
		</ListSubheader>
		<MenuItem value="EQUALS">
			<FormattedMessage id="filter.operation.equals" defaultMessage="equals" />
		</MenuItem>
		<MenuItem value="NOT_EQUALS">
			<FormattedMessage id="filter.operation.doesNotEqual" defaultMessage="does not equal" />
		</MenuItem>
		{/* Number - Comparison */}
		<MenuItem value="GT">
			<FormattedMessage id="filter.operation.greaterThan" defaultMessage="greater than" />
		</MenuItem>
		<MenuItem value="GTE">
			<FormattedMessage id="filter.operation.greaterOrTqualTo" defaultMessage="greater or equal to" />
		</MenuItem>
		<MenuItem value="LT">
			<FormattedMessage id="filter.operation.lessThan" defaultMessage="less than" />
		</MenuItem>
		<MenuItem value="LTE">
			<FormattedMessage id="filter.operation.lessOrEqualTo" defaultMessage="less or equal to" />
		</MenuItem>
		{/* Number - Range */}
		<MenuItem value="IN_RANGE">
			<FormattedMessage id="filter.operation.inRange" defaultMessage="in range" />
		</MenuItem>
		<MenuItem value="NOT_IN_RANGE">
			<FormattedMessage id="filter.operation.notInRange" defaultMessage="not in range" />
		</MenuItem>
	</FormSelect>
);
