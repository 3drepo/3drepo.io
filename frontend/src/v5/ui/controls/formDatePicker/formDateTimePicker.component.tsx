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
import { DateTimePicker, DateTimePickerProps } from '@mui/x-date-pickers';
import { FormBaseCalendarPicker, FormBaseCalendarPickerProps } from './formBaseCalendarPicker/formBaseCalendarPicker.component';
import { formatTime, getDateTimeMask } from './dateFormatHelper';

type FormDateTimePickerProps = FormBaseCalendarPickerProps & Partial<DateTimePickerProps<any, any>>;
export const FormDateTimePicker = (props: FormDateTimePickerProps) => (
	<FormBaseCalendarPicker
		PickerComponent={DateTimePicker}
		inputFormat={getDateTimeMask()}
		rifmFormatter={formatTime}
		{...props}
	/>
);
