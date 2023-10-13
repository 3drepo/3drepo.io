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

import { DateTimePickerProps } from '@controls/inputs/datePicker/dateTimePicker.component';
import SequencingIcon from '@assets/icons/outlined/sequence-outlined.svg';
import CloseIcon from '@assets/icons/controls/clear_circle.svg';
import { DateTimePicker } from '@controls/inputs/datePicker/dateTimePicker.component';
import { IconContainer, Icons } from './sequencingProperty.styles';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import { SequencesActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useFormContext } from 'react-hook-form';
import { SEQUENCING_MODULE_END, SEQUENCING_MODULE_START } from '@/v5/store/tickets/tickets.helpers';

export const SequencingProperty = ({ onChange, onBlur, value, ...props }: DateTimePickerProps) => {
	const { getValues } = useFormContext();

	const openSequencesCard = () => SequencesActionsDispatchers.showSequenceDate(new Date(value));

	const getDateTimeBoundary = (limit) => dayjs(limit === props.name ? null : getValues(limit));

	const handleChange = (newValue) => onChange(newValue ? newValue?.toDate()?.getTime() : newValue);

	useEffect(() => { onBlur(); }, [value]);

	return (
		<DateTimePicker
			components={{
				OpenPickerIcon: () => (value && (
					<Icons onClick={(e) => e.stopPropagation()}>
						<IconContainer onClick={openSequencesCard}>
							<SequencingIcon />
						</IconContainer>
						<IconContainer onClick={() => handleChange(null)}>
							<CloseIcon />
						</IconContainer>
					</Icons>
				)),
			}}
			value={value}
			// onChange is a required prop in DatePicker, however it is not needed as onAccept works better
			// (onChange triggers when changing year, onAccept only when a date is finally chosen)
			onChange={() => true}
			onAccept={handleChange}
			minDateTime={getDateTimeBoundary(SEQUENCING_MODULE_START)}
			maxDateTime={getDateTimeBoundary(SEQUENCING_MODULE_END)}
			{...props}
		/>
	);
};
