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

import { formatMessage } from '@/v5/services/intl';
import { PRIORITY_LEVELS_MAP } from '@controls/chip/chip.types';
import { FormChipSelect, FormDueDate } from '@controls/inputs/formInputs.component';
import { FormattedMessage } from 'react-intl';
import { IssueProperties } from '../../../tickets.constants';
import { Property, PropertyTitle } from '../statusProperty/statusProperty.styles';
import { StatusProperty } from '../statusProperty/statusProperty.component';

type IIssuePropertiesInputs = {
	onBlur: () => void;
	readOnly: boolean;
};
export const IssuePropertiesInputs = ({ onBlur, readOnly }: IIssuePropertiesInputs) => (
	<>
		<StatusProperty onBlur={onBlur} readOnly={readOnly} />
		<Property>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.priority.label"
					defaultMessage="Priority"
				/>
			</PropertyTitle>
			<FormChipSelect
				variant="text"
				tooltip={formatMessage({
					id: 'customTicket.topPanel.priority.tooltip',
					defaultMessage: 'Set priority',
				})}
				name={`properties.${IssueProperties.PRIORITY}`}
				onBlur={onBlur}
				key={IssueProperties.PRIORITY}
				values={PRIORITY_LEVELS_MAP}
				disabled={readOnly}
			/>
		</Property>
		<Property>
			<PropertyTitle>
				<FormattedMessage
					id="ticketTopPanel.dueDate.label"
					defaultMessage="Due"
				/>
			</PropertyTitle>
			<FormDueDate
				tooltip={formatMessage({
					id: 'customTicket.topPanel.dueDate.tooltip',
					defaultMessage: 'Set due date',
				})}
				name={`properties.${IssueProperties.DUE_DATE}`}
				onBlur={onBlur}
				key={IssueProperties.DUE_DATE}
				disabled={readOnly}
			/>
		</Property>
	</>
);
