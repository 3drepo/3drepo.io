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
import { useContext, useEffect } from 'react';
import dayjs from 'dayjs';
import { SequencesActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useFormContext } from 'react-hook-form';
import { SequencingProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { TicketContext } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { Container, IconContainer, SequenceIconContainer } from './sequencingProperty.styles';

const SEQUENCING_START_TIME = `modules.sequencing.${SequencingProperties.START_TIME}`;
const SEQUENCING_END_TIME = `modules.sequencing.${SequencingProperties.END_TIME}`;

export const SequencingProperty = ({ onChange, onBlur, value, ...props }: DateTimePickerProps) => {
	const { watch } = useFormContext();
	const { isViewer } = useContext(TicketContext);

	const startTime = watch(SEQUENCING_START_TIME);
	const endTime = watch(SEQUENCING_END_TIME);
	const minDateTime = (props.name === SEQUENCING_START_TIME || !startTime) ? undefined : dayjs(startTime);
	const maxDateTime = (props.name === SEQUENCING_END_TIME || !endTime) ? undefined : dayjs(endTime);

	const openSequencesCard = () => SequencesActionsDispatchers.showSequenceDate(new Date(value));

	const handleChange = (newValue) => onChange(newValue ? newValue?.toDate()?.getTime() : newValue);

	const clearValue = (e) => {
		e.stopPropagation();
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
				minDateTime={minDateTime}
				maxDateTime={maxDateTime}
				{...props}
			/>
			{value && isViewer && (
				<SequenceIconContainer onClick={openSequencesCard}>
					<SequencingIcon />
				</SequenceIconContainer>
			)}
		</Container>
	);
};
