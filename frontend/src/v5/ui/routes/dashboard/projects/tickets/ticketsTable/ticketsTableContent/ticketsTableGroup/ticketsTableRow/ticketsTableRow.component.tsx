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
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors, TicketsHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { useContext } from 'react';
import { SearchContext } from '@controls/search/searchContext';
import { Highlight } from '@controls/highlight';
import { DueDate } from '@controls/dueDate/dueDate.component';
import { Chip } from '@controls/chip/chip.component';
import { PRIORITY_LEVELS_MAP, RISK_LEVELS_MAP, TREATMENT_LEVELS_MAP } from '@controls/chip/chip.types';
import { UserPopoverCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.component';
import { AssigneesSelect } from '@controls/assigneesSelect/assigneesSelect.component';
import { Tooltip } from '@mui/material';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { Row, Cell, CellChipText, CellOwner, OverflowContainer, SmallFont, CellDate } from './ticketsTableRow.styles';
import { getChipPropsFromConfig } from '@controls/chip/statusChip/statusChip.helpers';

type TicketsTableRowProps = {
	ticket: ITicket,
	showModelName: boolean,
	modelId: string,
	selected: boolean,
	onClick: () => void,
};
export const TicketsTableRow = ({ ticket, onClick, showModelName, modelId, selected }: TicketsTableRowProps) => {
	const { query } = useContext(SearchContext);
	const { _id: id, title, properties, number, type, modules } = ticket;
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(type);
	const container = ContainersHooksSelectors.selectContainerById(modelId);
	const federation = FederationsHooksSelectors.selectFederationById(modelId);

	const { name: modelName } = container || federation || {};
	
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(type);

	if (!properties || !template?.code) return null;

	const {
		owner,
		assignees,
		priority,
		status,
		dueDate,
		createdAt,
	} = getPropertiesInCamelCase(properties);

	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const ownerAsUser = UsersHooksSelectors.selectUser(teamspace, owner);

	const {
		treatmentStatus,
		levelOfRisk,
	} = getPropertiesInCamelCase(modules?.safetibase || {});

	const hasProperties = template?.config?.issueProperties;
	const hasSafetibase = template?.modules?.some((module) => module.type === 'safetibase');

	const handleClick = (e) => {
		e.preventDefault();
		onClick();
	};

	return (
		<Row key={id} onClickCapture={handleClick} $selected={selected}>
			<Cell width={80}>
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
			<Cell width={145} hidden={!showModelName}>
				<Tooltip title={modelName}>
					<OverflowContainer>
						<Highlight search={query}>
							{modelName}
						</Highlight>
					</OverflowContainer>
				</Tooltip>
			</Cell>
			<Cell width={127}>
				<SmallFont>
					{formatDateTime(createdAt)}
				</SmallFont>
			</Cell>
			<Cell width={96} hidden={!hasProperties}>
				{!!assignees?.length && (<AssigneesSelect value={assignees} multiple disabled />)}
			</Cell>
			<CellOwner width={52}>
				<UserPopoverCircle user={ownerAsUser} />
			</CellOwner>
			<CellDate width={147} hidden={!hasProperties}>
				{!!dueDate && (<DueDate value={dueDate} disabled />)}
			</CellDate>
			<CellChipText width={90} hidden={!hasProperties}>
				<Chip {...PRIORITY_LEVELS_MAP[priority]} variant="text" />
			</CellChipText>
			<CellChipText width={150}>
				<Chip {...getChipPropsFromConfig(statusConfig, status)} />
			</CellChipText>
			<Cell width={137} hidden={!hasSafetibase}>
				<Chip {...RISK_LEVELS_MAP[levelOfRisk]} variant="filled" />
			</Cell>
			<Cell width={134} hidden={!hasSafetibase}>
				<Chip {...TREATMENT_LEVELS_MAP[treatmentStatus]} variant="filled" />
			</Cell>
		</Row>
	);
};
