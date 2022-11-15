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

import { SelectProps, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';

export interface SelectWithLabelProps extends SelectProps {
	required?: boolean;
	helperText?: string;
}

export const SelectWithLabel = ({ required = false, helperText, label, ...props }: SelectWithLabelProps) => (
	<FormControl required={required} disabled={props.disabled} error={props.error} className={props.className}>
		<InputLabel id={`${props.name}-label`}>{label}</InputLabel>
		<Select {...props} />
		<FormHelperText>{helperText}</FormHelperText>
	</FormControl>
);
