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

import { ITicket } from '@/v5/store/tickets/tickets.types';
import { useEffect, useRef } from 'react';
import { FlexRow, TicketItemContainer } from './ticketItem.styles';
import { TicketItemBaseInfo as BaseInfo } from './ticketItemBaseInfo/ticketItemBaseInfo.component';
import { TicketItemChips as Chips } from './ticketItemChips/ticketItemChips.component';
import { TicketItemBottomRow as BottomRow } from './ticketItemBottomRow/ticketItemBottomRow.component';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketItemThumbnail } from './ticketItemThumbnail/ticketItemThumbnail.component';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { hasDefaultPin } from '../../ticketsForm/properties/coordsProperty/coordsProperty.helpers';

type TicketItemProps = {
	ticket: ITicket;
	selected?: boolean;
};

export const TicketItem = ({ ticket, selected }: TicketItemProps) => {
	const ref = useRef<HTMLDivElement>();
	const selectedTicketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const isSelected = selectedTicketId === ticket._id;

	const onClickTicket = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation();
		TicketsCardActionsDispatchers.openTicket(ticket._id);
		TicketsCardActionsDispatchers.setSelectedTicket(ticket._id);
		TicketsCardActionsDispatchers.setSelectedTicketPin(hasDefaultPin(ticket) ? ticket._id : null);
	};

	useEffect(() => {
		if (selected && ref.current) {
			// @ts-ignore
			ref.current.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
		}
	}, []);

	return (
		<TicketItemContainer
			onClick={onClickTicket}
			key={ticket._id}
			$selected={isSelected}
			ref={ref}
		>
			<FlexRow>
				<TicketItemThumbnail ticket={ticket} />
				<BaseInfo {...ticket} />
			</FlexRow>
			<Chips {...ticket} />
			<BottomRow {...ticket} />
		</TicketItemContainer>
	);
};
