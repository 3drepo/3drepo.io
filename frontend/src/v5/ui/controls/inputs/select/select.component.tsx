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
import { useEffect, useState } from 'react';

export type SelectProps = Omit<MuiSelectProps, 'variant'> & FormInputProps & { children?: any[], saveOnClose?: boolean };

export const Select = ({
	required = false,
	helperText,
	label,
	className,
	onClose,
	onChange,
	value: originalValue,
	// if true, the value will be saved on close instead of on change
	saveOnClose = false,
	...props
}: SelectProps) => {
	const [value, setValue] = useState(originalValue);

	const handleChange = (e) => {
		if (saveOnClose) {
			setValue(e.target.value);
			return;
		}
		onChange?.(e);
	};

	const handleClose = (event) => {
		if (saveOnClose) {
			onChange?.({ target: { value } });
		}
		onClose?.(event);
	};
	
	useEffect(() => { setValue(originalValue); }, [originalValue]);

	return (
		<FormControl required={required} disabled={props.disabled} error={props.error} className={className}>
			<InputLabel id={`${props.name}-label`}>{label}</InputLabel>
			<MuiSelect
				renderValue={() => props.children.find(({ key }) => key === value)?.props.children ?? value}
				value={value}
				onChange={handleChange}
				onClose={handleClose}
				{...props}
			/>
			<FormHelperText>{helperText}</FormHelperText>
		</FormControl>
	);
};