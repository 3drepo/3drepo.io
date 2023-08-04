/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { ColumnsContainer, TicketRowContainer } from './ticketGroup.styles';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';

export const TicketRow = ({ ticket, onClick }: { ticket: ITicket, onClick: () => void }) => {
	const { teamspace } = useParams();
	const { _id, title, properties, number, type, modules } = ticket;
	const template = TeamspacesHooksSelectors.selectTeamspaceTemplateById(teamspace, type);

	if (!properties || !template?.code) return (<span>Loading</span>);

	const {
		owner,
		assignees,
		priority,
		status,
		dueDate
	} = getPropertiesInCamelCase(properties);

	const {
		treatmentStatus,
		levelOfRisk,
	} = getPropertiesInCamelCase(modules?.safetibase || {});

	return (
		<TicketRowContainer key={_id} onClick={onClick}>
			<span>{template.code}:{number}</span>
			<span>{title}</span>
			<span>{assignees?.length || 0}</span>
			<span>{owner}</span>
			<span>{dueDate}</span>
			<span>{priority}</span>
			<span>{status}</span>
			<span>{levelOfRisk}</span>
			<span>{treatmentStatus}</span>
		</TicketRowContainer>
	)
};

export const TicketGroup = ({ tickets, onTicketClick }) => {
	if (!tickets?.length) return (<button> create new ticket </button>);

	return (
		<>
			<ColumnsContainer>
				<b>id</b>
				<b>title</b>
				<b>assignees</b>
				<b>owner</b>
				<b>due date</b>
				<b>priority</b>
				<b>status</b>
				<b>level of risk</b>
				<b>treatment status</b>
			</ColumnsContainer>
			<div>
				{tickets.map((ticket: ITicket) => (
					<TicketRow
						key={ticket._id}
						ticket={ticket}
						onClick={() => onTicketClick(ticket)}
					/>
				))}
			</div>
		</>
	);
};
