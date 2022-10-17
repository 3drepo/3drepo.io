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
import { Controller } from 'react-hook-form';
import { FormControl, FormHelperText, InputLabel, SelectProps } from '@mui/material';
import { useState } from 'react';
import { Select, TooltipAdapter, Tooltip } from './formSelect.styles';

export type FormSelectProps = SelectProps & {
	control?: any;
	name: string;
	formError?: any;
	renderValueTooltip?: any;
	renderValue?: (value) => any;
};

export const FormSelect = ({
	name,
	control,
	value,
	required,
	formError,
	label,
	disabled,
	defaultValue,
	children,
	renderValueTooltip,
	onOpen,
	onChange,
	...props
}: FormSelectProps) => {
	const [showTooltip, setShowTooltip] = useState(false);

	const handleOpen = (e) => {
		setShowTooltip(false);
		onOpen?.(e);
	};

	const handleChange = (eventArgs, onFieldChange) => {
		const [event, child] = eventArgs;
		onFieldChange(value || { target: { value: event.target.value } });
		onChange?.(event, child);
	};

	return (
		<Controller
			control={control}
			name={name}
			defaultValue={defaultValue}
			render={({ field: { ref, onChange: onFieldChange, ...field } }) => (
				<FormControl required={required} disabled={disabled} error={!!formError}>
					<InputLabel id={`${name}-label`}>{label}</InputLabel>
					<Tooltip
						title={renderValueTooltip ?? ''}
						open={showTooltip}
					>
						<TooltipAdapter
							onMouseEnter={() => setShowTooltip(true)}
							onMouseLeave={() => setShowTooltip(false)}
						>
							<Select
								{...field}
								inputRef={ref}
								labelId={`${name}-label`}
								id={name}
								label={label}
								onOpen={handleOpen}
								onChange={(...args) => handleChange(args, onFieldChange)}
								error={!!formError}
								{...props}
							>
								{children}
							</Select>
						</TooltipAdapter>
					</Tooltip>
					<FormHelperText>{formError?.message}</FormHelperText>
				</FormControl>
			)}
		/>
	);
};
