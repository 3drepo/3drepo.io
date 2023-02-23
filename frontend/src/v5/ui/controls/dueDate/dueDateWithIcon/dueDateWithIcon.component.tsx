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

import { formatDate } from '@/v5/services/intl';
import { DatePicker } from '@controls/inputs/datePicker/datePicker.component';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { CalendarIcon, DueDateWithIconContainer } from '../dueDate.styles';
import { DateContainer, EmptyDateContainer } from '../dueDateWithLabel/dueDateLabel/dueDateLabel.styles';

export const DueDateWithIcon = ({ value, disabled, ...props }: FormInputProps) => {
	const isOverdue = value < Date.now();
	const formattedDate = formatDate(value, {
		day: 'numeric',
		month: 'numeric',
		year: '2-digit',
	});
	return (
		<DueDateWithIconContainer>
			<DatePicker
				value={value}
				disabled={disabled}
				renderInput={
					(args) => (value ? (
						<DateContainer {...args} isOverdue={isOverdue}><CalendarIcon /> {formattedDate}</DateContainer>
					) : (
						<EmptyDateContainer {...args} disabled={disabled}><CalendarIcon /> Unset</EmptyDateContainer>
					))
				}
				{...props}
			/>
		</DueDateWithIconContainer>
	);
};
