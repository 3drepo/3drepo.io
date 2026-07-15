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
import { ElementType, ReactNode, useEffect, useRef, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { ClearDateAction, ApplyAction, ActionsRow, DateField, FieldsRow, PickerViewContainer, TimeClockContainer, PopperWrapper, TextField, TimeField } from './dateTimePicker.styles';
import { formatDateTime, getLocaleDateFormat } from '@/v5/helpers/intl.helper';
import { DateCalendar, TimeClock } from '@mui/x-date-pickers';
import { ClickAwayListener, Fade, IconButton, InputAdornment, Popper, InputProps } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { FormattedMessage } from 'react-intl';
import CalendarIcon from '@assets/icons/outlined/calendar-outlined.svg';
import ClockIcon from '@assets/icons/outlined/clock-outlined.svg';

export type PickerValue = Date | number | null;
	
export type DateTimePickerProps = {
	disabled?: boolean;
	helperText?: ReactNode;
	error?: boolean;
	required?: boolean;
	value?: PickerValue;
	onChange?: (value:  PickerValue) => void;
	onAccept?: (value:  PickerValue) => void;
	onBlur?: () => void;
	placeholder?: string;
	renderInput?: ElementType;
	minDateTime?: PickerValue;
	maxDateTime?: PickerValue;
	disableFuture?: boolean;
	disableHighlightToday?: boolean;
	label?: string | ReactNode;
	name?: string;
	slots?: {
		openPickerIcon?: ElementType;
	};
	slotProps?: {
		input?: InputProps;
	};
};

enum DatePickerView {
	time = 'time',
	calendar = 'calendar',
}

const DefaultTime = dayjs().hour(0).minute(0);

export const DateTimePicker = ({
	disabled,
	value,
	onChange,
	onBlur,
	placeholder,
	renderInput,
	minDateTime,
	maxDateTime,
	disableFuture,
	disableHighlightToday,
	slots,
	...props
}: DateTimePickerProps) => {
	const [view, setView] = useState(DatePickerView.calendar);
	const [open, setOpen] = useState(false);
	const [dateValue, setDateValue] = useState<Dayjs | null>(null);
	const [timeValue, setTimeValue] = useState<Dayjs | null>(DefaultTime);
	const markForUpdateRef =  useRef(false);
	const temporalValue = useRef(value);
	const inputRef = useRef<HTMLDivElement>(null);
	const [anchorEl, setAnchorEl] = useState(inputRef.current);

	const closePicker = () => {
		setOpen(false);
	};

  	const handleClick = (e) => {
		if (disabled) return;
		e.stopPropagation();
		setDateValue(value ? dayjs(value) : null);
		setTimeValue(value ? dayjs(value) : DefaultTime);
		setView(DatePickerView.calendar);
		setOpen(true);
	};

	const canopen = open && Boolean(document.body.contains(anchorEl));
  	const id = canopen ? 'transition-popper' : undefined;

	const consolidateNewValue = (newValue: any) => {
		markForUpdateRef.current = true;
		temporalValue.current = newValue;
		closePicker();
	};

	const InputComponent = renderInput || TextField;
	const minDate = minDateTime ? dayjs(minDateTime) : undefined;
	const maxDate = maxDateTime ? dayjs(maxDateTime) : undefined;
	const minTime = minDateTime && dateValue?.isSame(minDate, 'day') ? dayjs(minDateTime) : undefined;
	const maxTime = maxDateTime && dateValue?.isSame(maxDate, 'day') ? dayjs(maxDateTime) : undefined;
	
	const PickerIconValue =  slots?.openPickerIcon || CalendarIcon;

	useEffect(() => {
		if (!open) {
			if (anchorEl) setAnchorEl(null);
			return;
		}

		const onFrame = () => {
			if (document.body.contains(inputRef.current)) {
				setAnchorEl(inputRef.current);
			} else {
				window.requestAnimationFrame(onFrame);
			}
		};

		window.requestAnimationFrame(onFrame);
	}, [open, anchorEl]);

	return (
		<div>
			<InputComponent
				onKeyDown={(e) => e.preventDefault()}
				placeholder={placeholder ?? formatMessage({
					id: 'calendarPicker.placeholder',
					defaultMessage: 'Choose a date',
				})}

				value={value ? formatDateTime(value) : ''}
				onClick={handleClick}
				disabled={disabled}
				slotProps={{
					input: {
						endAdornment: 
							(<InputAdornment  position="end">
								<IconButton disabled={disabled} size="medium" edge="end">
									<PickerIconValue />
								</IconButton>
							</InputAdornment>)
						,
						autoComplete: 'off',
						readOnly: true,
						...props.slotProps?.input,
					},
				}}

				ref={inputRef}
				{...props}
			/>
			<Popper id={id} open={canopen} anchorEl={anchorEl} transition  style={{ zIndex: 10000 }}  
				onClick={(e) => { e.stopPropagation();}}>
				{({ TransitionProps }) => (
					<ClickAwayListener onClickAway={(e) => {
						e.stopImmediatePropagation();
						closePicker();
					}} mouseEvent="onMouseDown">
						<Fade {...TransitionProps} timeout={150} onExited={() => {
							TransitionProps?.onExited?.();
							if (!markForUpdateRef.current) return;
							markForUpdateRef.current = false;
							onChange?.(temporalValue.current ? temporalValue.current : null);
							onBlur?.();
						}}>
							<PopperWrapper>
								<FieldsRow>
									<DateField
										enableAccessibleFieldDOMStructure={false}
										format={getLocaleDateFormat()}
										value={dateValue}
										onChange={(newValue: Dayjs | null, context: any) => {
											if (newValue?.isValid() && !context.validationError) {
												setDateValue(newValue);
											}
										}}
										onFocus={() => setView(DatePickerView.calendar)}
										slotProps={{
											textField: {
												InputProps: {
													startAdornment: (
														<InputAdornment position="start">
															<CalendarIcon />
														</InputAdornment>
													),
												},
											},
										}}
									/>
									<TimeField
										enableAccessibleFieldDOMStructure={false}
										format="HH:mm"
										ampm={false}
										value={timeValue}
										onChange={(newValue: Dayjs | null, context: any) => {
											if (newValue?.isValid() && !context.validationError) {
												setTimeValue(newValue);
											}
										}}
										onFocus={() => setView(DatePickerView.time)}
										slotProps={{
											textField: {
												InputProps: {
													startAdornment: (
														<InputAdornment position="start">
															<ClockIcon />
														</InputAdornment>
													),
												},
											},
										}}
									/>
								</FieldsRow>
								<PickerViewContainer>
									{view === DatePickerView.calendar && (
										<DateCalendar 
											value={dateValue} 
											onChange={(newValue: Dayjs, selectionState) => {
												if (selectionState === 'finish') {
													setDateValue(newValue);
												}
											}}
											minDate={minDate}
											maxDate={maxDate}
											disableFuture={disableFuture}
											disableHighlightToday={disableHighlightToday}
										/>)}
									{view === DatePickerView.time && (
										<TimeClockContainer>
											<TimeClock
												value={timeValue}
												views={['hours', 'minutes']}
												onChange={(newValue: Dayjs, selectionState) => {
													setTimeValue(newValue);
													if (selectionState === 'finish') {
														if (!dateValue || !newValue) return;
													}
												}}
												minTime={minTime}
												maxTime={maxTime}
												disableFuture={disableFuture}
											/>
										</TimeClockContainer>
									)}
								</PickerViewContainer>
								<ActionsRow>
									<ClearDateAction onClick={()=> { consolidateNewValue(null);}}>
										<FormattedMessage id="datePicker.actionBar.clear" defaultMessage="Clear date" />
									</ClearDateAction>
									<ApplyAction
										onClick={() => {
											if (!dateValue) return;
											const tv = timeValue ?? DefaultTime;
											consolidateNewValue(dateValue.hour(tv.hour()).minute(tv.minute()).toDate().getTime());
										}}
									>
										<FormattedMessage id="datePicker.actionBar.apply" defaultMessage="Apply" />
									</ApplyAction>
								</ActionsRow>
							</PopperWrapper>
						</Fade>
					</ClickAwayListener>
				)}
			</Popper>
		</div>
	);
};
