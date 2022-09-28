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
import { Controller } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import { FormDateTextField } from './formDateTextField/formDateTextField.component';

export type FormDateTimePickerProps = Partial<DateTimePickerProps<any, any>> & {
	name: string;
	label: string | JSX.Element;
	control: any;
};

export const FormDateTimePicker = ({
	name,
	control,
	...otherProps
}: FormDateTimePickerProps) => {
	const formatTime = (time) => time.replace('@', formatMessage({
		id: 'form.dateTime.at',
		defaultMessage: 'at',
	}));
	 
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<DateTimePicker
					{...field}
					{...otherProps}
					dayOfWeekFormatter={(day) => day[0].toUpperCase() + day[1]}
					disableHighlightToday
					inputFormat="DD/MM/YYYY @ hh:mma"
					rifmFormatter={formatTime}
					renderInput={FormDateTextField}
				/>
			)}
		/>
	);
};
