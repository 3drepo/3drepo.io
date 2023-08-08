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
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { Row } from './ticketTableGroupRow.styles';

export const TicketsGroupsRow = ({ ticket, onClick }: { ticket: ITicket, onClick: () => void }) => {
	const { _id: id, title, properties, number, type, modules } = ticket;
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(type);

	if (!properties || !template?.code) return (<span>Loading</span>);

	const {
		owner,
		assignees,
		priority,
		status,
		dueDate,
	} = getPropertiesInCamelCase(properties);

	const {
		treatmentStatus,
		levelOfRisk,
	} = getPropertiesInCamelCase(modules?.safetibase || {});

	return (
		<Row key={id} onClick={onClick}>
			<span>{template.code}:{number}</span>
			<span>{title}</span>
			<span>{assignees?.length || 0}</span>
			<span>{owner}</span>
			<span>{dueDate ? new Date(dueDate).toLocaleDateString() : 'unset'}</span>
			<span>{priority}</span>
			<span>{status}</span>
			<span>{levelOfRisk}</span>
			<span>{treatmentStatus}</span>
		</Row>
	);
};
