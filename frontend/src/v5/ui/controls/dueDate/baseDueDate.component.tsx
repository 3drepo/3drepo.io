/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { formatDayOfWeek } from '@controls/inputs/datePicker/dateFormatHelper';
import { DatePicker } from '@mui/x-date-pickers';
import { ReactElement, useState } from 'react';
import { StopBackgroundInteraction } from './dueDate.styles';

type IBaseDueDate = {
	value: number;
	disabled?: boolean;
	onBlur: (newValue) => void;
	renderInput: (props) => ReactElement;
};

export const BaseDueDate = ({ value: initialValue, disabled, onBlur, ...props }: IBaseDueDate) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<number>(initialValue);

	const preventPropagation = (e) => { if (e.key !== 'Escape') e.stopPropagation(); };
	const handleClose = () => setOpen(false);
	const handleClick = (e) => {
		preventPropagation(e);
		if (!open) setOpen(!disabled);
	};
	const onDateChange = (newValue) => {
		setOpen(false);
		setValue(new Date(newValue).getTime());
		onBlur?.(newValue);
	};

	return (
		<div onClick={handleClick} aria-hidden="true">
			<StopBackgroundInteraction open={open} onClick={handleClose} />
			<DatePicker
				// If value is 0 display it as null to prevent it showing as 1/1/1970
				value={value || null}
				open={open}
				// onChange is a required prop in DatePicker, however it is not needed as onAccept works better
				// (onChange triggers when changing year, onAccept only when a date is finally chosen)
				onChange={() => true}
				onAccept={onDateChange}
				onClose={handleClose}
				dayOfWeekFormatter={formatDayOfWeek}
				disableHighlightToday
				{...props}
			/>
		</div>
	);
};
