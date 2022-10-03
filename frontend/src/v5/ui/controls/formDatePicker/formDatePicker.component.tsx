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
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { FormDateTextField } from './formDateTextField/formDateTextField.component';

export type FormDatePickerProps = Partial<DatePickerProps<any, any>> & {
	name: string;
	label: string | JSX.Element;
	control: any;
	formError?: any;
};

export const FormDatePicker = ({
	name,
	control,
	formError,
	...otherProps
}: FormDatePickerProps) => {
	const [open, setOpen] = useState(false);
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<DatePicker
					{...field}
					{...otherProps}
					onOpen={() => setOpen(true)}
					onClose={() => setOpen(false)}
					open={open}
					dayOfWeekFormatter={(day) => day[0].toUpperCase() + day[1]}
					disableHighlightToday
					renderInput={({ ref, ...textFieldProps }) => (
						<FormDateTextField {...textFieldProps} formError={formError} onClick={() => setOpen(true)} />
					)}
				/>
			)}
		/>
	);
};
