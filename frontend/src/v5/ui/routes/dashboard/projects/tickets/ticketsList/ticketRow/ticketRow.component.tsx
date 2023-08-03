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
import { TicketContainer } from './ticketRow.styles';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';

export const TicketRow = ({ ticket, onClick }: { ticket: ITicket, onClick: () => void }) => {
	const { teamspace } = useParams();
	const { _id, title, properties, number, type } = ticket;
	const template = TeamspacesHooksSelectors.selectTeamspaceTemplateById(teamspace, type);

	if (!properties || !template?.code) return (<span>Loading</span>);

	const {
		owner,
		assignees,
		priority,
		status,
		dueDate
	} = getPropertiesInCamelCase(properties);

	return (
		<TicketContainer key={_id} onClick={onClick}>
			<span><b>id:</b>{template.code}:{number} ~ </span>
			<span><b>title:</b>{title} ~ </span>
			<span>
				<b>assignees:</b>
				{assignees?.length || 0}
				~
			</span>
			<span><b>owner:</b>{owner} ~ </span>
			<span><b>due date:</b>{dueDate} ~ </span>
			<span><b>priority:</b>{priority} ~ </span>
			<span><b>status:</b>{status}</span>
		</TicketContainer>
	)
};
