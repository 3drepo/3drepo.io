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

import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { getPropertiesInCamelCase, getTicketResourceUrl, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { Highlight } from '@controls/highlight';
import { useEffect, useRef } from 'react';
import { Ticket, Id, Title, Thumbnail, Description, FlexRow, CreationInfo } from './ticketItem.styles';
import { SafetibaseProperties } from '../../tickets.constants';
import { TicketItemChips } from './ticketItemChips/ticketItemChips.component';
import { TicketItemBottomRow } from './ticketItemBottomRow/ticketItemBottomRow.component';

type TicketItemProps = {
	ticket: ITicket;
	onClick: React.MouseEventHandler<HTMLDivElement>;
	selected?: boolean;
};

export const TicketItem = ({ ticket, onClick, selected }: TicketItemProps) => {
	const ref = useRef<HTMLDivElement>();
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const queries = TicketsCardHooksSelectors.selectFilteringQueries();

	const isFederation = modelIsFederation(containerOrFederation);
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket.type);
	const { status, defaultView = {}, description = '' } = getPropertiesInCamelCase(ticket.properties);

	const thumbnailSrc = defaultView?.screenshot ?
		getTicketResourceUrl(teamspace, project, containerOrFederation, ticket._id, defaultView.screenshot, isFederation) : null;

	const riskLevel = ticket.modules?.safetibase?.[SafetibaseProperties.LEVEL_OF_RISK];
	const treatmentStatus = ticket.modules?.safetibase?.[SafetibaseProperties.TREATMENT_STATUS];

	const expandTicket = () => TicketsCardActionsDispatchers.openTicket(ticket._id);

	useEffect(() => {
		if (selected && ref.current) {
			// @ts-ignore
			ref.current.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
		}
	}, []);

	return (
		<Ticket
			onClick={onClick}
			key={ticket._id}
			$selected={selected}
			ref={ref}
		>
			<FlexRow>
				{thumbnailSrc && <Thumbnail src={thumbnailSrc} />}
				<div>
					<Id>
						<Highlight search={queries}>
							{`${template?.code}:${ticket.number}`}
						</Highlight>
					</Id>
					<Title onClick={expandTicket}>
						<Highlight search={queries}>
							{ticket.title}
						</Highlight>
					</Title>
					<CreationInfo
						owner={ticket.properties.Owner}
						createdAt={ticket.properties['Created at']}
					/>
					<Description>
						{description}
					</Description>
				</div>
			</FlexRow>
			<TicketItemChips status={status} riskLevel={riskLevel} treatmentStatus={treatmentStatus} />
			<TicketItemBottomRow {...ticket} />
		</Ticket>
	);
};
