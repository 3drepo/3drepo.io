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
import { useRef, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { TextField } from './dateTimePicker.styles';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { DateCalendar, TimeClock } from '@mui/x-date-pickers';
import { ClickAwayListener, Fade, Popper  } from '@mui/material';
import { Box } from '@mui/system';
import dayjs, { Dayjs } from 'dayjs';

export type PickerValue = Date | number | null;
	
export type DateTimePickerProps = {
	disabled?: boolean;
	helperText?: React.ReactNode;
	error?: boolean;
	required?: boolean;
	value?: PickerValue;
	onChange?: (value:  PickerValue) => void;
	onAccept?: (value:  PickerValue) => void;
	onBlur?: () => void;
	placeholder?: string;
	renderInput?: React.ElementType;
	minDateTime?: PickerValue;
	maxDateTime?: PickerValue;
	disableFuture?: boolean;
	disableHighlightToday?: boolean;
	label?: string | React.ReactNode;
	name?: string;
	slots?: {
		openPickerIcon?: React.ElementType;
	};
};

enum DatePickerView {
	time = 'time',
	calendar = 'calendar',
}

const DefaultTime = dayjs().hour(0).minute(0);

export const DateTimePicker = ({
	disabled,
	helperText,
	error,
	required,
	value,
	onChange,
	onBlur,
	placeholder,
	renderInput,
	minDateTime,
	maxDateTime,
	disableFuture,
	disableHighlightToday,
	label,
	name,
}: DateTimePickerProps) => {
	const [view, setView] = useState(DatePickerView.calendar);
	const [open, setOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [calendarValue, setCalendarValue] = useState<Dayjs | null>(null);
	const [timeValue, setTimeValue] = useState<Dayjs | null>(DefaultTime);
	const markForUpdateRef =  useRef(false);
	const temporalValue = useRef(value);


	const closePicker = () => {
		setOpen(false);
	};
  	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		if (disabled) return;
		setAnchorEl(event.currentTarget);
		setCalendarValue(value ? dayjs(value) : null);
		setTimeValue(value ? dayjs(value) : DefaultTime);
		setView(DatePickerView.calendar);
		setOpen(true);
	};

	const canopen = open && Boolean(anchorEl);
  	const id = canopen ? 'transition-popper' : undefined;

	const consolidateNewValue = (newValue: any) => {
		markForUpdateRef.current = true;
		temporalValue.current = newValue;
		closePicker();
	};

	const InputComponent = renderInput || TextField;

	return (
		<div>
			<InputComponent
				onKeyDown={(e) => e.preventDefault()}
				placeholder={placeholder ?? formatMessage({
					id: 'calendarPicker.placeholder',
					defaultMessage: 'Choose a date',
				})}
				label={label}
				error={error}
				helperText={helperText}
				required={required}
				value={value ? formatDateTime(value) : null}
				onClick={handleClick}
				inputProps={{ form: { autoComplete: 'off' } }}
				name={name}
			/>
			<Popper id={id} open={open} anchorEl={anchorEl} transition  style={{ zIndex: 10000 }} >
				{({ TransitionProps }) => (
					<ClickAwayListener onClickAway={() => closePicker()} mouseEvent="onMouseDown">
						<Fade {...TransitionProps} timeout={150} onExited={() => {
							TransitionProps?.onExited?.();
							if (!markForUpdateRef.current) return;
							markForUpdateRef.current = false; 
							onChange?.(temporalValue.current ? temporalValue.current : null);
							onBlur?.();
						}}>
							<Box sx={{ border: 0, p: 1, bgcolor: 'background.paper' }}>
								{view === DatePickerView.calendar && (
									<DateCalendar 
										value={calendarValue} 
										onChange={(newValue, selectionState) => {
											if (selectionState === 'finish') {
												setCalendarValue(newValue);
												setView(DatePickerView.time);
											}
										}} 
									
										minDate={minDateTime ? dayjs(minDateTime) : undefined}
										maxDate={maxDateTime ? dayjs(maxDateTime) : undefined}
										disableFuture={disableFuture}
										disableHighlightToday={disableHighlightToday}
									/>)}
								{view === DatePickerView.time && (
									<TimeClock
										value={timeValue}
										showViewSwitcher
										views={['hours', 'minutes']}
										onChange={(newValue, selectionState) => {
											setTimeValue(newValue);
											if (selectionState === 'finish') {
												if (!calendarValue || !newValue) return;
												const valueToSet = calendarValue.hour(newValue.hour()).minute(newValue.minute()).toDate().getTime();
												consolidateNewValue(valueToSet);
											}
										}}
										ampm
										ampmInClock
										minTime={minDateTime ? dayjs(minDateTime) : undefined}
										maxTime={maxDateTime ? dayjs(maxDateTime) : undefined}
										disableFuture={disableFuture}
									/>
								)}
								<button 
									onClick={()=> {
										consolidateNewValue(null);
									}}
								> clear date</button>
							</Box>
						</Fade>
					</ClickAwayListener>
				)}
			</Popper>
		</div>
	);
};
