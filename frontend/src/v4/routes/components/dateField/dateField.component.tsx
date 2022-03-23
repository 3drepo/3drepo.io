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
import { ComponentType } from 'react';
import { DatePickerProps } from '@mui/lab/DatePicker';
import { DateTimePickerProps } from '@mui/lab/DateTimePicker';
import { TextField } from '@mui/material';
import { useState } from 'react';
import { Container, StyledDatePicker, StyledDateTimePicker } from './dateField.styles';

interface IProps {
	value?: any;
	defaultValue?: any;
	initialFocusedDate?: any;
	name: string;
	disabled?: boolean;
	inputFormat?: string;
	placeholder?: string;
	className?: string;
	dateTime?: boolean;
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
	disabled,
	dateTime,
	defaultValue,
	...dateFieldProps
}: IProps) => {
	const [value, setValue] = useState(propValue || null);
	const [selectedValue, setSelectedValue] = useState(value);

	const handleOpen = () => {
		setSelectedValue(selectedValue || new Date());
	};

	const handleAccept = (newValue) => {
		if (newValue) {
			setValue(selectedValue);
			if (onChange) {
				onChange({
					target: {
						value: newValue.valueOf(),
						name,
					}
				});
			}
		}
	};

	const handleChange = (newValue) => {
		setSelectedValue(newValue);
	};

	const Picker: ComponentType<DatePickerProps | DateTimePickerProps> = dateTime ? StyledDateTimePicker : StyledDatePicker;

	return (
	  <Container>
		<Picker
			value={selectedValue}
			onOpen={handleOpen}
			onAccept={handleAccept}
			onChange={handleChange}
			disableHighlightToday
			renderInput={(props) => (
				<TextField
					placeholder={placeholder}
					defaultValue={defaultValue}
					name={name}
					onBlur={onBlur}
					{...props}
				/>
			)}
			{...dateFieldProps}
		/>
	  </Container>
	);
};
