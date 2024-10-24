/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { DateTimePicker } from '@controls/inputs/datePicker/dateTimePicker.component';

interface IProps {
	value?: any;
	defaultValue?: any;
	initialFocusedDate?: any;
	name: string;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
	onChange?: (event) => void;
	onBlur?: (event) => void;
	shouldDisableDate?: (day: any) => boolean;
}

export const DateField = ({
	onBlur,
	onChange,
	name,
	value: propValue,
	placeholder,
	defaultValue,
	...dateFieldProps
}: IProps) => {
	const [value, setValue] = useState(propValue || null);

	const handleAccept = (newValue) => {
		if (newValue) {
			setValue(newValue);
			onChange?.({
				target: {
					value: newValue.valueOf(),
					name,
				}
			});
		}
	};

	useEffect(() => {
		setValue(propValue || null);
	}, [propValue]);

	return (
		<DateTimePicker
			value={value}
			onAccept={handleAccept}
			onChange={() => {}}
			disableHighlightToday
			// @ts-ignore
			inputProps={{ readOnly: true, placeholder }}
			components={{ ActionBar: null }}
			renderInput={(props) => (
				<TextField
					defaultValue={defaultValue}
					name={name}
					{...props}
					InputProps={{ endAdornment: null }}
				/>
			)}
			{...dateFieldProps}
		/>
	);
};
