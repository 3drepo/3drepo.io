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

import FunnelIcon from '@assets/icons/filters/funnel.svg';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { CardContainer, CardContent } from '@components/viewer/cards/card.styles';
import { FormattedMessage } from 'react-intl';
import TicketsIcon from '@assets/icons/outlined/tickets-outlined.svg';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { TicketsList } from './ticketsList.component';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { CardHeader } from '@components/viewer/cards/cardHeader.component';
import { FilterSelection } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFiltersSelection.component';
import { TicketsEllipsisMenu } from '@components/viewer/cards/tickets/ticketsEllipsisMenu/ticketsEllipsisMenu.component';
import { CardFilters } from '@components/viewer/cards/cardFilters/cardFilters.component';
import { Tooltip } from '@mui/material';
import { CardAction } from '@components/viewer/cards/cardAction/cardAction.styles';

export const TicketsListCard = () => {
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const tickets = TicketsCardHooksSelectors.selectCurrentTickets();
	const availableTemplateIds = TicketsCardHooksSelectors.selectCurrentTemplates().map(({ _id }) => _id);
	const unusedFilters = TicketsCardHooksSelectors.selectAvailableTemplatesFilters(availableTemplateIds);
	
	return (
		<CardContainer>
			<CardHeader
				icon={<TicketsIcon />}
				title={formatMessage({ id: 'viewer.cards.tickets.title', defaultMessage: 'Tickets' })}
				actions={(
					<>
						{!readOnly && (<NewTicketMenu />)}
						<FilterSelection
							unusedFilters={unusedFilters}
							TriggerButton={(props) => (
								<Tooltip title={props.disabled ? '' : formatMessage({ id: 'viewer.card.tickets.addFilter', defaultMessage: 'Add Filter' })}>
									<CardAction {...props}>
										<FunnelIcon />
									</CardAction>
								</Tooltip>
							)}
						/>
						<TicketsEllipsisMenu />
					</>
				)}
			/>
			<CardContent onClick={TicketsCardActionsDispatchers.resetState}>
				<CardFilters />
				{tickets.length ? (
					<TicketsList />
				) : (
					<EmptyListMessage>
						<FormattedMessage id="viewer.cards.tickets.noTickets" defaultMessage="No tickets have been created yet" />
					</EmptyListMessage>
				)}
			</CardContent>
		</CardContainer>
	);
};
