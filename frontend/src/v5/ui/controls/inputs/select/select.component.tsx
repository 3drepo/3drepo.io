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
import {
	SelectProps as MuiSelectProps,
	Select as MuiSelect,
	FormControl,
	InputLabel,
	FormHelperText,
} from '@mui/material';
import { FormInputProps } from '@controls/inputs/inputController.component';

export type SelectProps = Omit<MuiSelectProps, 'variant'> & FormInputProps & { children?: any[] };

export const Select = ({
	required = false,
	helperText,
	label,
	className,
	...props
}: SelectProps) => (
	<FormControl required={required} disabled={props.disabled} error={props.error} className={className}>
		<InputLabel id={`${props.name}-label`}>{label}</InputLabel>
		<MuiSelect
			renderValue={(value) => props.children.find(({ key }) => key === value)?.props.children ?? value}
			{...props}
		/>
		<FormHelperText>{helperText}</FormHelperText>
	</FormControl>
);