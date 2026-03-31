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
import { useEffect, useRef, useState } from 'react';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { formatMessage } from '@/v5/services/intl';
import { TextField } from './dateTimePicker.styles';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { DateTimePicker as MUIDateTimePicker, DateTimePickerProps as MUIDateTimePickerProps } from '@mui/x-date-pickers';

export type DateTimePickerProps = FormInputProps & MUIDateTimePickerProps & {
	placeholder?: string;
};

export const DateTimePicker = ({
	disabled,
	helperText,
	error,
	required,
	value,
	onChange,
	onBlur,
	placeholder,
	...props
}: DateTimePickerProps) => {
	const [open, setOpen] = useState(false);
	const inputRef =  useRef(null);
	const changeAborted =  useRef(false);

	const closePicker = () => setOpen(false);

	const preventPropagation = (e) => {
		if (e.key !== 'Escape') {
			changeAborted.current = true;
			e.preventDefault();
			e.stopPropagation();
		}
	};

	const handleClick = (e) => {
		if (disabled) return;
		preventPropagation(e);
		if (!open) {
			setOpen(true);
		}
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.value = value ? formatDateTime(value) : null;
		}
	}, [inputRef.current, value]);

	return (<MUIDateTimePicker
		{...props}
		localeText={{ 
			clearButtonLabel:  formatMessage({
				id: 'calendarPicker.clearButtonLabel',
				defaultMessage: 'Clear' }),
		}} 
		slots={{
			textField: (textFieldProps) => {
				return (<TextField
					{...textFieldProps}
					onKeyDown={(e) => e.preventDefault()}
					placeholder={placeholder ?? formatMessage({
						id: 'calendarPicker.placeholder',
						defaultMessage: 'Choose a date',
					})}

					slotProps={{
						input: textFieldProps.InputProps,
					}}
					error={error}
					helperText={helperText}
					required={required}
					value={undefined}
					inputRef={inputRef}
					onClick={handleClick}
				/>);
			},
		}}

		slotProps={{ 
			actionBar: { actions: ['clear', 'cancel', 'accept'] },
			desktopPaper: {
				onMouseLeave: () => {
					changeAborted.current = true;
				},
				onMouseMove: () => {
					changeAborted.current = false;
				},
			},
		}}

		enableAccessibleFieldDOMStructure={false} 
		open={open}

		onChange={(val) => { 
			inputRef.current.value = formatDateTime(val);
		}}

		onAccept={(newValue) => {
			if (!changeAborted.current) {
				onChange?.(newValue ? newValue.toDate().getTime() : null);
				onBlur?.();
			}
			closePicker();
		}}

		onClose={() => {
			inputRef.current.value = formatDateTime(value);
			closePicker();
		}}

		disabled={disabled}
		{...props}
	/>);
};
