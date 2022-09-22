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

import { useState } from 'react';
import { CardContainer } from '@components/viewer/cards/card.styles';
import { TicketsListCard } from './ticketsList/ticketListCard.component';
import { TicketsTabs } from './tickets.constants';
import { TicketsDetailsCard } from './ticketsDetails/ticketDetailsCard.component';

export const Tickets = () => {
	const [tabValue, setTabValue] = useState(TicketsTabs.List);
	const [tabProps, setTabProps] = useState<any>();

	switch (tabValue) {
		case TicketsTabs.List:
			return <TicketsListCard setTabValue={setTabValue} setTabProps={setTabProps} />;
			break;
		case TicketsTabs.New:
			return <CardContainer>New {JSON.stringify(tabProps)} </CardContainer>;
			break;
		case TicketsTabs.Details:
			return <TicketsDetailsCard setTabValue={setTabValue} {...tabProps} />;
			break;
		default:
			return <></>;
	}
};
