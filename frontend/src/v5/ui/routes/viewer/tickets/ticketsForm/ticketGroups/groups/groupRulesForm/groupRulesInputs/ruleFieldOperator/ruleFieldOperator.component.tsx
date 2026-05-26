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

import { FormSelect } from '@controls/inputs/formInputs.component';
import { MenuItem } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { OPERATION_DISPLAY_NAMES } from '../../groupRulesForm.helpers';
import { FieldOperator } from '@/v5/store/tickets/tickets.types';

export const RuleFieldOperator = ({ disabled }) => (
	<FormSelect
		name="field.operator"
		label={formatMessage({ id: 'tickets.groups.field.label', defaultMessage: 'Field' })}
		disabled={disabled}
		renderValue={(value: FieldOperator) => OPERATION_DISPLAY_NAMES[value]}
	>
		<MenuItem value="IS">{OPERATION_DISPLAY_NAMES.IS}</MenuItem>
		<MenuItem value="CONTAINS">{OPERATION_DISPLAY_NAMES.CONTAINS}</MenuItem>
		<MenuItem value="STARTS_WITH">{OPERATION_DISPLAY_NAMES.STARTS_WITH}</MenuItem>
		<MenuItem value="ENDS_WITH">{OPERATION_DISPLAY_NAMES.ENDS_WITH}</MenuItem>
		<MenuItem value="REGEX">{OPERATION_DISPLAY_NAMES.REGEX}</MenuItem>
	</FormSelect>
);
