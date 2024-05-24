/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { FormChipSelect } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import { BaseProperties, TicketsCardViews } from '../../../tickets.constants';
import { PropertyTitle, Property } from './statusProperty.styles';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { useContext, useMemo } from 'react';
import { getStatusPropertyValues } from '@controls/chip/statusChip/statusChip.helpers';
import { TicketContext } from '../../../ticket.context';

type StatusPropertyProps = {
	onBlur: () => void;
	readOnly: boolean;
};

export const StatusProperty = ({ onBlur, readOnly }: StatusPropertyProps) => {
	const { template: templateIdTabularView } = useParams<DashboardTicketsParams>();
	const { containerOrFederation } = useContext(TicketContext);
	
	const templateIdExistingTicket = TicketsCardHooksSelectors.selectSelectedTicket()?.type;
	const templateIdNewTicket = TicketsCardHooksSelectors.selectSelectedTemplateId() || templateIdTabularView;
	const ticketView = TicketsCardHooksSelectors.selectView();
	const templateId = ticketView === TicketsCardViews.New ? templateIdNewTicket : templateIdExistingTicket ?? templateIdTabularView;

	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(containerOrFederation, templateId);
	const values = useMemo(() => getStatusPropertyValues(statusConfig), [templateId]);
	return (
		<Property>
			<PropertyTitle>
				<FormattedMessage
					id="ticket.topPanel.status.label"
					defaultMessage="Status"
				/>
			</PropertyTitle>
			<FormChipSelect
				variant="text"
				tooltip={formatMessage({
					id: 'ticket.topPanel.status.tooltip',
					defaultMessage: 'Set status',
				})}
				name={`properties.${BaseProperties.STATUS}`}
				onBlur={onBlur}
				key={BaseProperties.STATUS}
				values={values}
				disabled={readOnly}
			/>
		</Property>
	);
};
