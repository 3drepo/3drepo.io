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
import { useContext } from 'react';
import { SearchContext } from '@controls/search/searchContext';
import { Highlight } from '@controls/highlight';
import { DueDateWithIcon } from '@controls/dueDate/dueDateWithIcon/dueDateWithIcon.component';
import { Chip } from '@controls/chip/chip.component';
import { RISK_LEVELS_MAP, STATUS_MAP, TREATMENT_LEVELS_MAP } from '@controls/chip/chip.types';
import { Row, Cell } from './ticketsTableRow.styles';

export const TicketsTableRow = ({ ticket, onClick }: { ticket: ITicket, onClick: () => void }) => {
	const { query } = useContext(SearchContext);
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
			<Cell>
				<Highlight search={query}>{`${template.code}:${number}`}</Highlight>
			</Cell>
			<Cell>
				<Highlight search={query}>{title}</Highlight>
			</Cell>
			<Cell>{assignees?.length || 0}</Cell>
			<Cell>{owner}</Cell>
			<Cell>
				<DueDateWithIcon value={dueDate} />
			</Cell>
			<Cell>{priority}</Cell>
			<Cell>
				{status && (<Chip {...STATUS_MAP[status]} variant="outlined" />) }
			</Cell>
			<Cell>
				{levelOfRisk && (<Chip {...RISK_LEVELS_MAP[levelOfRisk]} variant="filled" />)}
			</Cell>
			<Cell>
				{treatmentStatus && (<Chip {...TREATMENT_LEVELS_MAP[treatmentStatus]} variant="filled" />)}
			</Cell>
		</Row>
	);
};
