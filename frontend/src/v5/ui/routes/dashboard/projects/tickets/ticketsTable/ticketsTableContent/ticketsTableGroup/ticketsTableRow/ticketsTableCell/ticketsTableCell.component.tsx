/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors, TicketsHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { PRIORITY_LEVELS_MAP, RISK_LEVELS_MAP, TREATMENT_LEVELS_MAP } from '@controls/chip/chip.types';
import { TextCell } from '../textCell/textCell.component';
import { Cell, CellDate, CellOwner, SmallFont } from '../ticketsTableRow.styles';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { AssigneesSelect } from '@controls/assigneesSelect/assigneesSelect.component';
import { UserPopoverCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.component';
import { DueDate } from '@controls/dueDate/dueDate.component';
import { Chip } from '@controls/chip/chip.component';
import { getChipPropsFromConfig } from '@controls/chip/statusChip/statusChip.helpers';
import { get } from 'lodash';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { useContext } from 'react';
import { TicketsTableContext } from '../../../../ticketsTableContext/ticketsTableContext';

const DateCell = ({ name, value }) => (
	<Cell name={name}>
		<SmallFont>
			{formatDateTime(value)}
		</SmallFont>
	</Cell>
);

const BooleanCell = ({ name, value }) => (
	<Cell name={name}>
		{Boolean(value) ? 'True' : 'False'}
	</Cell>
);

const PROPERTIES_NAME_PREFIX = 'properties.';
const SAFETIBASE_NAME_PREFIX = 'modules.safetibase';
type TicketsTableCellProps = {
	name: string,
	modelId: string,
	ticket: ITicket,
};
export const TicketsTableCell = ({ name, modelId, ticket }: TicketsTableCellProps) => {
	const { title, properties, number, type: templateId, modules } = ticket;
	const { getDefaultValue, getPropertyType } = useContext(TicketsTableContext);
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(templateId);
	const container = ContainersHooksSelectors.selectContainerById(modelId);
	const federation = FederationsHooksSelectors.selectFederationById(modelId);
	const { name: modelName } = container || federation || {};
	const value = get(ticket, name) ?? getDefaultValue(name);
	
	const {
		owner,
		assignees,
		priority,
		status,
		dueDate,
	} = getPropertiesInCamelCase(properties);
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const ownerAsUser = UsersHooksSelectors.selectUser(teamspace, owner);

	if (name === 'id') return <TextCell name={name} value={`${template.code}:${number}`} />;
	if (name === BaseProperties.TITLE) return <TextCell name={name} value={title} />;
	if (name === 'modelName') return <TextCell name={name} value={modelName} />;

	if (name.startsWith(PROPERTIES_NAME_PREFIX)) {
		switch (name.replace(PROPERTIES_NAME_PREFIX, '')) {
			case IssueProperties.ASSIGNEES:
				return (
					<Cell name={name}>
						{!!assignees?.length && (<AssigneesSelect value={assignees} multiple disabled />)}
					</Cell>
				);
			case BaseProperties.OWNER:
				return (
					<CellOwner name={name}>
						<UserPopoverCircle user={ownerAsUser} />
					</CellOwner>
				);
			case IssueProperties.DUE_DATE:
				return (
					<CellDate name={name}>
						{!!dueDate && (<DueDate value={dueDate} disabled />)}
					</CellDate>
				);
			case IssueProperties.PRIORITY:
				return (
					<Cell name={name}>
						<Chip {...PRIORITY_LEVELS_MAP[priority]} variant="text" />
					</Cell>
				);
			case BaseProperties.STATUS:
				return (
					<Cell name={name}>
						<Chip {...getChipPropsFromConfig(statusConfig, status)} />
					</Cell>
				);
		}
	}

	if (name.startsWith(SAFETIBASE_NAME_PREFIX)) {
		const {
			treatmentStatus,
			levelOfRisk,
		} = getPropertiesInCamelCase(modules?.safetibase || {});
		switch (name.replace(SAFETIBASE_NAME_PREFIX, '')) {
			case SafetibaseProperties.LEVEL_OF_RISK:
				return (
					<Cell name={`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`}>
						<Chip {...RISK_LEVELS_MAP[levelOfRisk]} variant="filled" />
					</Cell>
				);
			case SafetibaseProperties.TREATMENT_STATUS:
				return (
					<Cell name={`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`}>
						<Chip {...TREATMENT_LEVELS_MAP[treatmentStatus]} variant="filled" />
					</Cell>
				);
		}
	}

	switch (getPropertyType(name)) {
		case 'boolean':
			return <BooleanCell name={name} value={value} />;
		case 'date':
		case 'pastDate':
			return <DateCell name={name} value={value} />;
		default:
			return <TextCell name={name} value={value} />;
	}
};