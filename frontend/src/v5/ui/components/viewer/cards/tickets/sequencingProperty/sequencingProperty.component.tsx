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

import { DateTimePickerProps, DateTimePicker } from '@controls/inputs/datePicker/dateTimePicker.component';
import SequencingIcon from '@assets/icons/outlined/sequence-outlined.svg';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import { SequencesActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useFormContext } from 'react-hook-form';
import { SEQUENCING_MODULE_END, SEQUENCING_MODULE_START } from '@/v5/store/tickets/tickets.helpers';
import { Container, IconContainer, SequenceIconContainer } from './sequencingProperty.styles';

export const SequencingProperty = ({ onChange, onBlur, value, ...props }: DateTimePickerProps) => {
	const { getValues } = useFormContext();

	const openSequencesCard = () => SequencesActionsDispatchers.showSequenceDate(new Date(value));

	const getDateTimeBoundary = (limit) => {
		const limitVal = getValues(limit);
		if (limit === props.name || !limitVal) return undefined;
		return dayjs(new Date(limitVal));
	};

	const handleChange = (newValue) => onChange(newValue ? newValue?.toDate()?.getTime() : newValue);

	const clearValue = (e) => {
		(e) => e.stopPropagation();
		handleChange(null);
	};

	useEffect(() => { onBlur(); }, [value]);

	return (
		<Container>
			<DateTimePicker
				components={{
					OpenPickerIcon: () => value && (
						<IconContainer onClick={clearValue}>
							<CloseIcon />
						</IconContainer>
					),
				}}
				value={value}
				// onChange is a required prop in DatePicker, however it is not needed as onAccept works better
				// (onChange triggers at every change: year, minutes, hours, etc., onAccept only when a date is finally chosen)
				onChange={() => true}
				onAccept={handleChange}
				minDateTime={getDateTimeBoundary(SEQUENCING_MODULE_START)}
				maxDateTime={getDateTimeBoundary(SEQUENCING_MODULE_END)}
				{...props}
			/>
			{value && (
				<SequenceIconContainer onClick={openSequencesCard}>
					<SequencingIcon />
				</SequenceIconContainer>
			)}
		</Container>
	);
};
