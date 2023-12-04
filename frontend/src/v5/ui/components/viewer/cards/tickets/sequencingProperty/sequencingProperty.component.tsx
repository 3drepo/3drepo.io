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
import { SEQUENCING_START_TIME, SEQUENCING_END_TIME } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { TicketContext } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { formatMessage } from '@/v5/services/intl';
import { SequencesHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, IconContainer, SequenceIconContainer } from './sequencingProperty.styles';

const LABELS = {
	[SEQUENCING_START_TIME]: formatMessage({ id: 'modules.sequencing.startTime', defaultMessage: 'Start time' }),
	[SEQUENCING_END_TIME]: formatMessage({ id: 'modules.sequencing.endTime', defaultMessage: 'End time' }),
};

export const SequencingProperty = ({ onChange, onBlur, value, ...props }: DateTimePickerProps) => {
	const { watch } = useFormContext();
	const { isViewer } = useContext(TicketContext);
	const currentSequenceDateTime = SequencesHooksSelectors.selectSelectedDate();

	const startTime = watch(SEQUENCING_START_TIME);
	const endTime = watch(SEQUENCING_END_TIME);
	const minDateTime = (props.name === SEQUENCING_START_TIME || !startTime) ? undefined : dayjs(startTime);
	const maxDateTime = (props.name === SEQUENCING_END_TIME || !endTime) ? undefined : dayjs(endTime);
	const defaultCalendarDate = !currentSequenceDateTime ? undefined : dayjs(currentSequenceDateTime);

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
				defaultCalendarMonth={minDateTime || maxDateTime || defaultCalendarDate}
				onAccept={handleChange}
				minDateTime={minDateTime}
				maxDateTime={maxDateTime}
				{...props}
				label={LABELS[props.name]}
			/>
			{value && isViewer && (
				<SequenceIconContainer onClick={openSequencesCard}>
					<SequencingIcon />
				</SequenceIconContainer>
			)}
		</Container>
	);
};
