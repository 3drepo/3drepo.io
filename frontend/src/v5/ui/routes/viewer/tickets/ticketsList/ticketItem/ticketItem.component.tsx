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

import { getPropertiesInCamelCase, getTicketResourceUrl, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Thumbnail, FlexRow, TicketItemContainer } from './ticketItem.styles';
import { TicketItemBaseInfo as BaseInfo } from './ticketItemBaseInfo/ticketItemBaseInfo.component';
import { TicketItemChips as Chips } from './ticketItemChips/ticketItemChips.component';
import { TicketItemBottomRow as BottomRow } from './ticketItemBottomRow/ticketItemBottomRow.component';

type TicketItemProps = {
	ticket: ITicket;
	onClick: React.MouseEventHandler<HTMLDivElement>;
	selected?: boolean;
};

export const TicketItem = ({ ticket, onClick, selected }: TicketItemProps) => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const ref = useRef<HTMLDivElement>();

	const isFederation = modelIsFederation(containerOrFederation);
	const { defaultView = {} } = getPropertiesInCamelCase(ticket.properties);

	const thumbnailSrc = defaultView?.screenshot ?
		getTicketResourceUrl(teamspace, project, containerOrFederation, ticket._id, defaultView.screenshot, isFederation) : null;

	useEffect(() => {
		if (selected && ref.current) {
			// @ts-ignore
			ref.current.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
		}
	}, []);

	return (
		<TicketItemContainer
			onClick={onClick}
			key={ticket._id}
			$selected={selected}
			ref={ref}
		>
			<FlexRow>
				{thumbnailSrc && (<Thumbnail src={thumbnailSrc} loading="lazy" />)}
				<BaseInfo {...ticket} />
			</FlexRow>
			<Chips {...ticket} />
			<BottomRow {...ticket} />
		</TicketItemContainer>
	);
};
