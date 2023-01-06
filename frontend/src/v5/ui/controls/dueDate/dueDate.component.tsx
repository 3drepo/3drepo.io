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

import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import { formatDayOfWeek } from '@controls/inputs/datePicker/dateFormatHelper';
import { DueDateFilledLabel } from './dueDateLabel/dueDateFilledLabel.component';
import { DueDateEmptyLabel } from './dueDateLabel/dueDateEmptyLabel.component';
import { StopBackgroundInteraction } from './dueDate.styles';

type DueDateProps = {
	value: number;
	disabled?: boolean;
	onBlur?: (val) => void;
};

export const DueDate = ({ value: initialValue, disabled, onBlur }: DueDateProps) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<number>(initialValue);

	const preventPropagation = (e) => { if (e.key !== 'Escape') e.stopPropagation(); };
	const handleClose = () => setOpen(false);
	const onClickDueDate = () => setOpen(!disabled);
	const onDateChange = (newValue) => {
		setValue(new Date(newValue).getTime());
		onBlur?.(newValue);
	};

	return (
		<div onClick={preventPropagation} aria-hidden="true">
			<StopBackgroundInteraction open={open} onClick={handleClose} />
			<DatePicker
				value={value}
				open={open}
				// onChange is a required prop in DatePicker, however it is not needed as onAccept works better
				// (onChange triggers when changing year, onAccept only when a date is finally chosen)
				onChange={() => true}
				onAccept={onDateChange}
				onClose={handleClose}
				dayOfWeekFormatter={formatDayOfWeek}
				disableHighlightToday
				renderInput={({ ref, inputRef, ...props }) => (
					<div ref={inputRef}>
						{ value ? (
							<DueDateFilledLabel onClick={onClickDueDate} {...props} value={value} disabled={disabled} />
						) : (
							<DueDateEmptyLabel onClick={onClickDueDate} {...props} disabled={disabled} />
						)}
					</div>
				)}
			/>
		</div>
	);
};
