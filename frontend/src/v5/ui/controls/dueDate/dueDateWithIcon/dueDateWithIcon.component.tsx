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

import { formatShortDate } from '@/v5/helpers/intl.helper';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseDueDate } from '../baseDueDate.component';
import { CalendarIcon, DueDateWithIconContainer } from '../dueDate.styles';
import { DateContainer, EmptyDateContainer } from '../dueDateWithLabel/dueDateLabel/dueDateLabel.styles';

export type DueDateWithIconProps = Omit<FormInputProps, 'onBlur'> & {
	tooltip?: string;
	onBlur?: (newValue) => void;
};

export const DueDateWithIcon = ({ value, disabled, tooltip, ...props }: DueDateWithIconProps) => {
	const isOverdue = value < Date.now();
	return (
		<DueDateWithIconContainer>
			<BaseDueDate
				value={value}
				disabled={disabled}
				renderInput={
					({ inputRef, ...args }) => (
						<Tooltip title={disabled ? '' : tooltip} arrow>
							{value ? (
								<DateContainer {...args} ref={inputRef} isOverdue={isOverdue} disabled={disabled}><CalendarIcon /> {formatShortDate(value)}</DateContainer>
							) : (
								<EmptyDateContainer {...args} ref={inputRef} disabled={disabled}><CalendarIcon />
									{ disabled ? (
										<FormattedMessage id="dueDate.withIcon.unset.enabled" defaultMessage="Date unset" />
									) : (
										<FormattedMessage id="dueDate.withIcon.unset.disabled" defaultMessage="Set date" />
									)}
								</EmptyDateContainer>
							)}
						</Tooltip>
					)
				}
				{...props}
			/>
		</DueDateWithIconContainer>
	);
};
