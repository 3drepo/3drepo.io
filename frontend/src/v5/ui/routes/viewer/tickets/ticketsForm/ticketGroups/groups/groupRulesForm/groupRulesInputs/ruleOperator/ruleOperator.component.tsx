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
import { MenuItem } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { OPERATION_DISPLAY_NAMES } from '../../groupRulesForm.helpers';
import { ListSubheader } from '../groupRulesInputs.styles';
import { Operator } from '@/v5/store/tickets/tickets.types';

export const RuleOperator = ({ disabled }) => (
	<FormSelect
		name="operator"
		label={formatMessage({ id: 'tickets.groups.value.label', defaultMessage: 'Value' })}
		disabled={disabled}
		renderValue={(value: Operator) => OPERATION_DISPLAY_NAMES[value]}
	>
		{/* Field */}
		<ListSubheader>
			<FormattedMessage id="ticket.groups.value.field" defaultMessage="Field" />
		</ListSubheader>
		<MenuItem value="IS_NOT_EMPTY">{OPERATION_DISPLAY_NAMES.IS_NOT_EMPTY}</MenuItem>
		<MenuItem value="IS_EMPTY">{OPERATION_DISPLAY_NAMES.IS_EMPTY}</MenuItem>

		{/* Text */}
		<ListSubheader>
			<FormattedMessage id="ticket.groups.value.text" defaultMessage="Text" />
		</ListSubheader>
		<MenuItem value="IS">{OPERATION_DISPLAY_NAMES.IS}</MenuItem>
		<MenuItem value="IS_NOT">{OPERATION_DISPLAY_NAMES.IS_NOT}</MenuItem>
		<MenuItem value="CONTAINS">{OPERATION_DISPLAY_NAMES.CONTAINS}</MenuItem>
		<MenuItem value="NOT_CONTAINS">{OPERATION_DISPLAY_NAMES.NOT_CONTAINS}</MenuItem>
		{/* Text - Regex */}
		<MenuItem value="REGEX">{OPERATION_DISPLAY_NAMES.REGEX}</MenuItem>

		{/* Number */}
		<ListSubheader>
			<FormattedMessage id="ticket.groups.value.number" defaultMessage="Number" />
		</ListSubheader>
		<MenuItem value="EQUALS">{OPERATION_DISPLAY_NAMES.EQUALS}</MenuItem>
		<MenuItem value="NOT_EQUALS">{OPERATION_DISPLAY_NAMES.NOT_EQUALS}</MenuItem>
		{/* Number - Comparison */}
		<MenuItem value="GT">{OPERATION_DISPLAY_NAMES.GT}</MenuItem>
		<MenuItem value="GTE">{OPERATION_DISPLAY_NAMES.GTE}</MenuItem>
		<MenuItem value="LT">{OPERATION_DISPLAY_NAMES.LT}</MenuItem>
		<MenuItem value="LTE">{OPERATION_DISPLAY_NAMES.LTE}</MenuItem>
		{/* Number - Range */}
		<MenuItem value="IN_RANGE">{OPERATION_DISPLAY_NAMES.IN_RANGE}</MenuItem>
		<MenuItem value="NOT_IN_RANGE">{OPERATION_DISPLAY_NAMES.NOT_IN_RANGE}</MenuItem>
	</FormSelect>
);
