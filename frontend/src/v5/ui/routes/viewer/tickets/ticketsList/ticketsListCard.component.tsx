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

import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { CardContainer, CardContent } from '@components/viewer/cards/card.styles';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import TicketsIcon from '@assets/icons/outlined/tickets-outlined.svg';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { TicketsList } from './ticketsList.component';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { ViewerParams } from '../../../routes.constants';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { formatMessage } from '@/v5/services/intl';
import PinIcon from '@assets/icons/filled/ticket_pin-filled.svg';
import { EllipsisMenuItemSwitch } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenuItemSwitch.component';
import { CardHeader } from '@components/viewer/cards/cardHeader.component';

export const TicketsListCard = () => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const isShowingPins = TicketsCardHooksSelectors.selectIsShowingPins();

	const onClickShowPins = () => {
		TicketsCardActionsDispatchers.setIsShowingPins(!isShowingPins);
	};

	return (
		<CardContainer>
			<CardHeader
				icon={<TicketsIcon />}
				title={formatMessage({ id: 'viewer.cards.tickets.title', defaultMessage: 'Tickets' })}
				actions={(
					<>
						{!readOnly && (<NewTicketMenu />)}
						<EllipsisMenu>
							<EllipsisMenuItemSwitch
								icon={<PinIcon />}
								title={formatMessage({ id: 'foobarbaz', defaultMessage: 'Show Pins' })}
								active={isShowingPins}
								onClick={onClickShowPins}
							/>
						</ EllipsisMenu>
					</>
				)}
			/>
			<CardContent onClick={TicketsCardActionsDispatchers.resetState}>
				{tickets.length ? (
					<TicketsList tickets={tickets} />
				) : (
					<EmptyListMessage>
						<FormattedMessage id="viewer.cards.tickets.noTickets" defaultMessage="No tickets have been created yet" />
					</EmptyListMessage>
				)}
			</CardContent>
		</CardContainer>
	);
};
