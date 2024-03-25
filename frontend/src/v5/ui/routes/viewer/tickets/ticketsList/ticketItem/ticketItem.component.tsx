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
import { Assignees, FloatingStatus, TicketItemContainer } from './ticketItem.styles';
import { TicketItemBaseInfo as BaseInfo } from './ticketItemBaseInfo/ticketItemBaseInfo.component';
import { TicketItemBottomRow as BottomRow } from './ticketItemBottomRow/ticketItemBottomRow.component';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { hasDefaultPin } from '../../ticketsForm/properties/coordsProperty/coordsProperty.helpers';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { Id } from './ticketItemBaseInfo/ticketItemBaseInfo.styles';
import { Highlight } from '@controls/highlight/highlight.component';
import { IssueProperties } from '../../tickets.constants';
import { isEqual } from 'lodash';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';

type TicketItemProps = {
	ticket: ITicket;
};

export const TicketItem = ({ ticket }: TicketItemProps) => {
	const { teamspace, project, containerOrFederation, revision } = useParams<ViewerParams>();
	const ref = useRef<HTMLDivElement>();
	const selectedTicketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const isSelected = selectedTicketId === ticket._id;
	const isFederation = modelIsFederation(containerOrFederation);

	const hasIssueProperties = !!ticket.properties.priority;

	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket.type);
	const queries = TicketsCardHooksSelectors.selectFilteringQueries();
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();

	const assignees = ticket.properties.assignees;

	const updateTicketProperty = (value) => TicketsActionsDispatchers
		.updateTicket(teamspace, project, containerOrFederation, ticket._id, { properties: value }, isFederation);

	const onBlurAssignees = (newVals) => {
		if (!isEqual(newVals, assignees)) updateTicketProperty({ [IssueProperties.ASSIGNEES]: newVals });
	};

	const onClickTicket = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation();
		TicketsCardActionsDispatchers.openTicket(ticket._id);
		TicketsCardActionsDispatchers.setSelectedTicket(ticket._id);
		TicketsCardActionsDispatchers.setSelectedTicketPin(hasDefaultPin(ticket) ? ticket._id : null);
		TicketsActionsDispatchers.fetchTicketGroups(teamspace, project, containerOrFederation, ticket._id, revision);
	};

	useEffect(() => {
		if (isSelected && ref.current) {
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
			<BaseInfo ticket={ticket} />
			{hasIssueProperties && (<Assignees value={assignees} onBlur={onBlurAssignees} disabled={readOnly} />)}
			<Id>
				<Highlight search={queries}>
					{`${template?.code}:${ticket.number}`}
				</Highlight>
			</Id>
			<BottomRow {...ticket} />
			<FloatingStatus value={ticket.properties.Status} modelId={containerOrFederation} templateId={ticket.type} variant="outlined" />
		</TicketItemContainer>
	);
};
