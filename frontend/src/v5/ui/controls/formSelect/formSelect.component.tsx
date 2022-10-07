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
import { SelectProps, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Select, TooltipAdapter, Tooltip } from './formSelect.styles';

export type FormSelectProps = SelectProps & {
	control: any;
	name: string;
	formError?: any;
	renderValue: () => any;
};

export const FormSelect = ({
	name,
	required,
	label,
	children,
	control,
	formError,
	disabled,
	hidden,
	value,
	defaultValue,
	multiple,
	renderValue,
	onOpen,
	onClose,
	...props
}: FormSelectProps) => {
	const [showTooltip, setShowTooltip] = useState(false);

	const handleOpen = (e) => {
		setShowTooltip(false)
		onOpen?.(e);
	};

	const handleClose = (e, field) => {
		if (value) {
			field.onChange({ target: { value } });
		}
		onClose?.(e);
	};

	return (
		<FormControl hiddenLabel={!!label}>
			{label && (
				<InputLabel
					id={`${name}-label`}
					required={required}
					disabled={disabled}
					hidden={hidden}
					error={!!formError}
				>
					{label}
				</InputLabel>
			)}
			<Tooltip
				title={multiple ? renderValue() : ''}
				open={showTooltip}
			>
				<TooltipAdapter
					onMouseEnter={() => setShowTooltip(true)}
					onMouseLeave={() => setShowTooltip(false)}
				>
					<Controller
						control={control}
						name={name}
						defaultValue={defaultValue ?? ''}
						render={({ field }) => (
							<Select
								{...field}
								inputRef={field.ref}
								labelId={`${name}-label`}
								id={name}
								label={label}
								disabled={disabled}
								hidden={hidden}
								onOpen={handleOpen}
								onClose={(e) => handleClose(e, field)}
								multiple={multiple}
								renderValue={renderValue}
								error={!!formError}
								{...props}
							>
								{children}
							</Select>
						)}
					/>
				</TooltipAdapter>
			</Tooltip>
			<FormHelperText error={!!formError}>{formError?.message}</FormHelperText>
		</FormControl>
	);
};
