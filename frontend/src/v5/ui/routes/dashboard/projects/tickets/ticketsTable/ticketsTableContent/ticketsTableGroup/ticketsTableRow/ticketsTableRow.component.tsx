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
import { ProjectsHooksSelectors, TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { useContext } from 'react';
import { SearchContext } from '@controls/search/searchContext';
import { Highlight } from '@controls/highlight';
import { DueDateWithIcon } from '@controls/dueDate/dueDateWithIcon/dueDateWithIcon.component';
import { Chip } from '@controls/chip/chip.component';
import { PRIORITY_LEVELS_MAP, RISK_LEVELS_MAP, STATUS_MAP, TREATMENT_LEVELS_MAP } from '@controls/chip/chip.types';
import { UserPopoverCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.component';
import { AssigneesSelect } from '@controls/assigneesSelect/assigneesSelect.component';
import { Tooltip } from '@mui/material';
import { Row, Cell, CellChipText, CellOwner, OverflowContainer } from './ticketsTableRow.styles';

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

	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const ownerAsUser = UsersHooksSelectors.selectUser(teamspace, owner);

	const {
		treatmentStatus,
		levelOfRisk,
	} = getPropertiesInCamelCase(modules?.safetibase || {});

	const handleClick = (e) => {
		e.preventDefault();
		onClick();
	};

	return (
		<Row key={id} onClickCapture={handleClick}>
			<Cell>
				<Highlight search={query}>{`${template.code}:${number}`}</Highlight>
			</Cell>
			<Cell>
				<Tooltip title={title}>
					<OverflowContainer>
						<Highlight search={query}>
							{title}
						</Highlight>
					</OverflowContainer>
				</Tooltip>
			</Cell>
			<Cell>
				<AssigneesSelect value={assignees} multiple disabled />
			</Cell>
			<CellOwner>
				<UserPopoverCircle user={ownerAsUser} />
			</CellOwner>
			<Cell>
				<DueDateWithIcon value={dueDate} disabled />
			</Cell>
			<CellChipText>
				{priority && (<Chip {...PRIORITY_LEVELS_MAP[priority]} variant="text" />) }
			</CellChipText>
			<CellChipText>
				{status && (<Chip {...STATUS_MAP[status]} variant="text" />) }
			</CellChipText>
			<Cell>
				{levelOfRisk && (<Chip {...RISK_LEVELS_MAP[levelOfRisk]} variant="filled" />)}
			</Cell>
			<Cell>
				{treatmentStatus && (<Chip {...TREATMENT_LEVELS_MAP[treatmentStatus]} variant="filled" />)}
			</Cell>
		</Row>
	);
};
