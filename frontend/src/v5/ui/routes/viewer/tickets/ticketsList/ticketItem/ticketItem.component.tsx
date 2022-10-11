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

import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { PriorityLevelChip, RiskLevelChip, TicketStatusChip, TreatmentLevelChip } from '@controls/chip';
import { DueDate } from '@controls/dueDate/dueDate.component';
import { useParams } from 'react-router-dom';
import { Ticket, Id, Title, ChipList, Assignees, DateAndPriority } from './ticketItem.styles';

type TicketItemProps = {
	ticket: ITicket;
	onClick: () => void;
	selected?: boolean;
};

export const TicketItem = ({ ticket, onClick, selected }: TicketItemProps) => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket.type);
	const {
		number,
		properties: {
			Status: status = undefined,
			Priority: priority = undefined,
			Risk: risk = undefined,
			Treatment: treatment = undefined,
			Assignees: assignees = undefined,
			'Due Date': dueDate = undefined,
		},
	} = ticket;
	return (
		<Ticket
			onClick={onClick}
			key={ticket._id}
			$selected={selected}
		>
			<Id>{template?.code}:{number}</Id>
			<Title>{ticket.title}</Title>
			<ChipList>
				{status && <TicketStatusChip state={status} />}
				{risk && <RiskLevelChip state={risk} />}
				{treatment && <TreatmentLevelChip state={treatment} />}
			</ChipList>
			<DateAndPriority>
				{dueDate && <DueDate epochTime={dueDate} onClick={() => { /* Edit Due Date */ }} />}
				{priority && <PriorityLevelChip noLabel state={priority} />}
			</DateAndPriority>
			{assignees && <Assignees assignees={assignees} max={7} />}
		</Ticket>
	);
};
