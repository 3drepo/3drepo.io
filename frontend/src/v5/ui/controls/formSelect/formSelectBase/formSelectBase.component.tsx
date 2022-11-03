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
import { Select, Tooltip } from './formSelectBase.styles';

export type FormSelectBaseProps = SelectProps & {
	control?: any;
	name: string;
	formError?: any;
	renderValueTooltip?: any;
	renderValue?: (value) => any;
};

export const FormSelectBase = ({
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
	onClose,
	onChange,
	...props
}: FormSelectBaseProps) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const handleOpen = (e) => {
		setMenuOpen(true);
		onOpen?.(e);
	};

	const handleClose = (e) => {
		setMenuOpen(false);
		onClose?.(e);
	};

	const handleChange = (eventArgs, onFieldChange) => {
		const [event, child] = eventArgs;
		event.target.value = value;
		onFieldChange(event);
		onChange?.(event, child);
	};

	const getTooltipTitle = () => {
		if (menuOpen) return '';
		return renderValueTooltip ?? '';
	};

	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { ref, onChange: onFieldChange, value: fieldValue, ...field } }) => (
				<FormControl required={required} disabled={disabled} error={!!formError}>
					<InputLabel id={`${name}-label`}>{label}</InputLabel>
					<Tooltip title={getTooltipTitle()}>
						<div>
							<Select
								{...field}
								value={fieldValue || []}
								inputRef={ref}
								labelId={`${name}-label`}
								id={name}
								label={label}
								onOpen={handleOpen}
								onClose={handleClose}
								onChange={(...args) => handleChange(args, onFieldChange)}
								error={!!formError}
								{...props}
								defaultValue={undefined}
							>
								{children}
							</Select>
						</div>
					</Tooltip>
					<FormHelperText>{formError?.message}</FormHelperText>
				</FormControl>
			)}
		/>
	);
};
