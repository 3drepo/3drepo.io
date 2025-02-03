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

import { SearchSelect } from '@controls/searchSelect/searchSelect.component';
import { SelectProps } from '../select/select.component';
import { FormControl, FormHelperText } from '@mui/material';

export const MultiSelect = ({ defaultValue = [], className, helperText, ...props }: SelectProps) => (
	<FormControl required={false} disabled={props.disabled} error={props.error} className={className}>
		<SearchSelect
			defaultValue={defaultValue}
			renderValue={(val) => (val as any[]).join(', ')}
			{...props}
			multiple
		/>
		<FormHelperText>{helperText}</FormHelperText>
	</FormControl>
);
