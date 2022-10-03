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
import { SelectProps, InputLabel, FormControl } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Select } from './formSelect.styles';

export type FormSelectProps = SelectProps & {
	control: any;
	name: string;
};

export const FormSelect = ({
	name,
	required,
	label,
	children,
	control,
	disabled,
	hidden,
	value,
	defaultValue = '',
	...otherProps
}: FormSelectProps) => (
	<FormControl hiddenLabel={!!label}>
		{label && (
			<InputLabel
				id={`${name}-label`}
				required={required}
				disabled={disabled}
				hidden={hidden}
			>
				{label}
			</InputLabel>
		)}
		<Controller
			control={control}
			name={name}
			defaultValue={defaultValue}
			render={({ field }) => (
				<Select
					{...field}
					inputRef={field.ref}
					labelId={`${name}-label`}
					id={name}
					label={label}
					disabled={disabled}
					hidden={hidden}
					onClose={value && (() => field.onChange({ target: { value } }))}
					{...otherProps}
				>
					{children}
				</Select>
			)}
		/>
	</FormControl>
);
