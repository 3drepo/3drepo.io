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
import { FormBaseCalendarPicker, FormBaseCalendarPickerProps } from './formBaseCalendarPicker/formBaseCalendarPicker.component';
import { getDateMask } from './dateFormatHelper';

type FormDatePickerProps = FormBaseCalendarPickerProps & Partial<DatePickerProps<any, any>>;
export const FormDatePicker = (props: FormDatePickerProps) => (
	<FormBaseCalendarPicker
		PickerComponent={DatePicker}
		inputFormat={getDateMask()}
		{...props}
	/>
);
