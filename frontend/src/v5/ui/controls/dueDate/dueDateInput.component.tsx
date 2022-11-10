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

import { Backdrop } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import { DueDate } from './dueDate.component';

type DueDateInputProps = {
	value: number;
	disabled?: boolean;
	onBlur: (val) => void;
};

export const DueDateInput = ({ value: initialValue, disabled, onBlur }: DueDateInputProps) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<number>(initialValue);

	const preventPropagation = (e) => { if (e.key !== 'Escape') e.stopPropagation(); };
	const handleClose = () => setOpen(false);
	const onClickDueDate = () => setOpen(true);
	const onDateChange = (newValue) => {
		setValue(new Date(newValue).getTime());
		onBlur(newValue);
	};
	const onClickBackdrop = (e) => {
		preventPropagation(e);
		handleClose();
	};

	return (
		<div onClick={preventPropagation} aria-hidden="true">
			<Backdrop /* Prevents clicking background elements */
				sx={{ zIndex: 15 }}
				open={open}
				onClick={onClickBackdrop}
			/>
			<DatePicker
				value={value}
				open={open}
				onChange={() => true}
				onAccept={onDateChange}
				onClose={handleClose}
				disabled={disabled}
				dayOfWeekFormatter={(day) => day[0].toUpperCase() + day[1]}
				disableHighlightToday
				renderInput={({ ref, inputRef, ...props }) => (
					<div ref={inputRef}>
						<DueDate onClick={onClickDueDate} {...props} value={value} />
					</div>
				)}
			/>
		</div>
	);
};
