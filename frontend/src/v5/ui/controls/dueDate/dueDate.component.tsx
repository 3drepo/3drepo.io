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

import { FormInputProps } from '@controls/inputs/inputController.component';
import { Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { DateTimePicker } from '@controls/inputs/datePicker/dateTimePicker.component';
import { CalendarIcon, DateContainer, DueDateContainer, EmptyDateContainer } from './dueDate.styles';

export type DueDateProps = Omit<FormInputProps, 'onBlur'> & {
	tooltip?: string;
	onBlur?: () => void;
};

export const DueDate = ({ value, disabled, tooltip, className, ...props }: DueDateProps) => {
	const isOverdue = value < Date.now();
	return (
		<DueDateContainer className={className}>
			<DateTimePicker
				value={value}
				disabled={disabled}
				renderInput={
					({ inputRef, ...args }: any) => (
						<Tooltip title={disabled ? '' : tooltip} arrow>
							{value ? (
								<DateContainer {...args} ref={inputRef} isOverdue={isOverdue} disabled={disabled}>
									<CalendarIcon />
									{formatDateTime(value)}
								</DateContainer>
							) : (
								<EmptyDateContainer {...args} ref={inputRef} disabled={disabled}><CalendarIcon />
									{ disabled ? (
										<FormattedMessage id="dueDate.unset.enabled" defaultMessage="Date unset" />
									) : (
										<FormattedMessage id="dueDate.unset.disabled" defaultMessage="Set date" />
									)}
								</EmptyDateContainer>
							)}
						</Tooltip>
					)
				}
				{...props}
			/>
		</DueDateContainer>
	);
};
