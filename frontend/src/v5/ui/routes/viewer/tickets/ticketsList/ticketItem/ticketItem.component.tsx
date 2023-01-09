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

import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { RiskLevelChip, TicketStatusChip, TreatmentLevelChip } from '@controls/chip';
import { DueDate } from '@controls/dueDate/dueDate.component';
import { isEqual } from 'lodash';
import { useParams } from 'react-router-dom';
import { IssueProperties, SafetibaseProperties, TicketsCardViews } from '../../tickets.constants';
import { Ticket, Id, Title, ChipList, Assignees, IssuePropertiesRow, PriorityLevelChip } from './ticketItem.styles';

type TicketItemProps = {
	ticket: ITicket;
	onClick: () => void;
	selected?: boolean;
};

export const TicketItem = ({ ticket, onClick, selected }: TicketItemProps) => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket.type);
	const hasIssueProperties = ticket?.properties?.Priority;
	const {
		number,
		properties: {
			[IssueProperties.STATUS]: status,
			[IssueProperties.PRIORITY]: priority,
			[IssueProperties.ASSIGNEES]: assignees,
			[IssueProperties.DUE_DATE]: dueDate,
		},
	} = ticket;
	const riskLevel = ticket.modules?.safetibase?.[SafetibaseProperties.LEVEL_OF_RISK];
	const treatmentStatus = ticket.modules?.safetibase?.[SafetibaseProperties.TREATMENT_STATUS];
	const updateTicketProperty = (value) => TicketsActionsDispatchers
		.updateTicket(teamspace, project, containerOrFederation, ticket._id, { properties: value }, isFederation);
	const onBlurAssignees = (newVals) => {
		if (!isEqual(newVals, assignees)) updateTicketProperty({ [IssueProperties.ASSIGNEES]: newVals });
	};
	const onBlurDueDate = (newVal) => {
		if (newVal !== dueDate) updateTicketProperty({ [IssueProperties.DUE_DATE]: newVal });
	};

	const expandTicket = () => {
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.Details);
		TicketsCardActionsDispatchers.setSelectedTicket(ticket._id);
	};

	return (
		<Ticket
			onClick={onClick}
			key={ticket._id}
			$selected={selected}
		>
			<Id>{template?.code}:{number}</Id>
			<Title onClick={expandTicket}>{ticket.title}</Title>
			<ChipList>
				{status && <TicketStatusChip state={status} />}
				{riskLevel && <RiskLevelChip state={riskLevel} />}
				{treatmentStatus && <TreatmentLevelChip state={treatmentStatus} />}
			</ChipList>
			{hasIssueProperties && (
				<IssuePropertiesRow>
					<DueDate value={dueDate ?? null} onBlur={onBlurDueDate} />
					<PriorityLevelChip state={priority} />
					<Assignees values={assignees ?? []} onBlur={onBlurAssignees} />
				</IssuePropertiesRow>
			)}
		</Ticket>
	);
};
