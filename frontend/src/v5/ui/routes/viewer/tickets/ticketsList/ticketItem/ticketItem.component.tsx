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
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { getPropertiesInCamelCase, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { Chip } from '@controls/chip/chip.component';
import { PRIORITY_LEVELS_MAP, RISK_LEVELS_MAP, STATUS_MAP, TREATMENT_LEVELS_MAP } from '@controls/chip/chip.types';
import { DueDateWithLabel } from '@controls/dueDate/dueDateWithLabel/dueDateWithLabel.component';
import { isEqual } from 'lodash';
import { useParams } from 'react-router-dom';
import { Highlight } from '@controls/highlight';
import { Ticket, Id, Title, ChipList, Assignees, IssuePropertiesRow } from './ticketItem.styles';
import { IssueProperties, SafetibaseProperties } from '../../tickets.constants';

type TicketItemProps = {
	ticket: ITicket;
	onClick: React.MouseEventHandler<HTMLDivElement>;
	selected?: boolean;
};

export const TicketItem = ({ ticket, onClick, selected }: TicketItemProps) => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const queries = TicketsCardHooksSelectors.selectFilteringQueries();

	const isFederation = modelIsFederation(containerOrFederation);
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket.type);
	const { status, priority, assignees = [], dueDate = null } = getPropertiesInCamelCase(ticket.properties);
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
		TicketsCardActionsDispatchers.openTicket(ticket._id);
	};

	return (
		<Ticket
			onClick={onClick}
			key={ticket._id}
			$selected={selected}
		>
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
			<ChipList>
				{status && <Chip {...STATUS_MAP[status]} variant="outlined" />}
				{riskLevel && <Chip {...RISK_LEVELS_MAP[riskLevel]} variant="filled" />}
				{treatmentStatus && <Chip {...TREATMENT_LEVELS_MAP[treatmentStatus]} variant="filled" />}
			</ChipList>
			{priority && (
				<IssuePropertiesRow>
					<DueDateWithLabel value={dueDate} onBlur={onBlurDueDate} disabled={readOnly} />
					<Chip {...PRIORITY_LEVELS_MAP[priority]} variant="text" label="" />
					<Assignees value={assignees} onBlur={onBlurAssignees} disabled={readOnly} />
				</IssuePropertiesRow>
			)}
		</Ticket>
	);
};
