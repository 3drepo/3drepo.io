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
import { IssuePropertiesContainer, FlexRow, BottomRow, StatusChip, TicketItemContainer, Description, Id, Title, FlexColumn, PriorityChip, DueDate } from './ticketItem.styles';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { hasDefaultPin } from '../../ticketsForm/properties/coordsProperty/coordsProperty.helpers';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { ControlledAssigneesSelect as Assignees } from '@controls/assigneesSelect/controlledAssigneesSelect.component';
import { Highlight } from '@controls/highlight/highlight.component';
import { IssueProperties, TicketBaseKeys } from '../../tickets.constants';
import { has, isEqual } from 'lodash';
import { getPropertiesInCamelCase, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { TicketItemThumbnail } from './ticketItemThumbnail/ticketItemThumbnail.component';
import { PRIORITY_LEVELS_MAP } from '@controls/chip/chip.types';
import { getChipPropsFromConfig } from '@controls/chip/statusChip/statusChip.helpers';

type TicketItemProps = {
	ticket: ITicket;
};

export const TicketItem = ({ ticket }: TicketItemProps) => {
	const { teamspace, project, containerOrFederation, revision } = useParams<ViewerParams>();
	const ref = useRef<HTMLDivElement>();
	const selectedTicketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const isSelected = selectedTicketId === ticket._id;
	const isFederation = modelIsFederation(containerOrFederation);
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket.type);
	const queries = TicketsCardHooksSelectors.selectFilteringQueries();
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const { description = '', assignees = [], priority, dueDate = null } = getPropertiesInCamelCase(ticket[TicketBaseKeys.PROPERTIES]);
	const hasIssueProperties = has(template, [TicketBaseKeys.CONFIG, 'issueProperties']);
	const hasThumbnail = has(template, [TicketBaseKeys.CONFIG, 'defaultView']) || has(template, [TicketBaseKeys.CONFIG, 'defaultImage']);
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(containerOrFederation, ticket.type);

	const updateTicketProperty = (value) => TicketsActionsDispatchers
		.updateTicket(teamspace, project, containerOrFederation, ticket._id, { properties: value }, isFederation);

	const onBlurAssignees = (newVals) => {
		if (!isEqual(newVals, assignees)) updateTicketProperty({ [IssueProperties.ASSIGNEES]: newVals });
	};

	const onChangeDueDate = (newVal) => {
		if (newVal !== dueDate) updateTicketProperty({ [IssueProperties.DUE_DATE]: newVal });
	};

	const selectTicket = (event) => {
		event.stopPropagation();
		TicketsCardActionsDispatchers.setSelectedTicket(ticket._id);
		TicketsCardActionsDispatchers.setSelectedTicketPin(hasDefaultPin(ticket) ? ticket._id : null);
		TicketsActionsDispatchers.fetchTicketGroups(teamspace, project, containerOrFederation, ticket._id, revision);
	};

	const onClickTicket = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		selectTicket(event);
		TicketsCardActionsDispatchers.openTicket(ticket._id);
	};

	useEffect(() => {
		if (isSelected && ref.current) {
			// @ts-ignore
			ref.current.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
		}
	}, []);

	return (
		<TicketItemContainer key={ticket._id} ref={ref} onClick={onClickTicket} $selected={isSelected}>
			<FlexRow>
				<FlexColumn>
					<Title>
						<Highlight search={queries}>
							{ticket.title}
						</Highlight>
					</Title>
					{description && <Description>{description}</Description>}
					{hasIssueProperties && (
						<IssuePropertiesContainer>
							<Assignees
								value={assignees}
								maxItems={5}
								multiple
								showAddButton
								onBlur={onBlurAssignees}
								disabled={readOnly}
								excludeViewers
							/>
							<FlexRow>
								<DueDate value={dueDate} onChange={onChangeDueDate} disabled={readOnly} />
								<PriorityChip {...PRIORITY_LEVELS_MAP[priority]} />
							</FlexRow>
						</IssuePropertiesContainer>
					)}
				</FlexColumn>
				{hasThumbnail && <TicketItemThumbnail ticket={ticket} selectTicket={selectTicket} />}
			</FlexRow>
			<BottomRow>
				<Id>
					<Highlight search={queries}>
						{`${template?.code}:${ticket.number}`}
					</Highlight>
				</Id>
				<StatusChip {...getChipPropsFromConfig(statusConfig, ticket.properties.Status)} />
			</BottomRow>
		</TicketItemContainer>
	);
};
