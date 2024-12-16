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
import { useState } from 'react';
import dayjs from 'dayjs';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { formatMessage } from '@/v5/services/intl';
import { TextField, Container } from './baseCalendarPicker.styles';
import { formatDayOfWeek } from '../dateFormatHelper';
import { StopBackgroundInteraction } from '@controls/dueDate/dueDate.styles';

export type BaseCalendarPickerProps = FormInputProps & {
	defaultValue?: Date;
	PickerComponent: any;
};

export const BaseCalendarPicker = ({
	disabled,
	defaultValue,
	PickerComponent,
	helperText,
	error,
	required,
	value,
	onChange,
	onBlur,
	...props
}: BaseCalendarPickerProps) => {
	const [open, setOpen] = useState(false);

	const closePicker = () => setOpen(false);

	const preventPropagation = (e) => {
		if (e.key !== 'Escape') {
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

	const onDateChange = (newValue) => {
		const timestamp = newValue?.toDate()?.getTime() || null;
		closePicker();
		onChange?.(timestamp);
		onBlur?.();
	};

	return (
		<Container onClick={handleClick} aria-hidden="true">
			<StopBackgroundInteraction open={open} onClick={closePicker} />
			<PickerComponent
				renderInput={({ ref, inputRef, ...textFieldProps }) => (
					<TextField
						{...textFieldProps}
						ref={inputRef}
						inputRef={inputRef}
						onClick={handleClick}
						onKeyDown={(e) => e.preventDefault()}
						error={error}
						helperText={helperText}
						required={required}
						inputProps={{
							...textFieldProps.inputProps,
							placeholder: formatMessage({
								id: 'calendarPicker.placeholder',
								defaultMessage: 'Choose a date',
							}),
						}}
					/>
				)}
				disableHighlightToday
				dayOfWeekFormatter={formatDayOfWeek}
				disabled={disabled}
				// onChange is a required prop in Date[Time]Picker, however it is not needed as onAccept works better
				// (onChange triggers even when changing year, onAccept only when a date is finally chosen)
				onChange={() => true}
				onAccept={onDateChange}
				value={value ? dayjs(value) : null}
				componentsProps={{
					actionBar: {
						hidden: required,
					},
				}}
				{...props}
				PaperProps={{ onClick: preventPropagation }}
				open={open}
				onOpen={() => setOpen(true)}
				onClose={() => {
					// This is to signal that the date has changed (we are using onblur to save changes)
					onBlur?.();
					setOpen(false);
				}}
			/>
		</Container>
	);
};
