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

import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { BaseProperties, IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { PRIORITY_LEVELS_MAP } from '@controls/chip/chip.types';
import { AssigneesSelect } from '@controls/assigneesSelect/assigneesSelect.component';
import { DueDate } from '@controls/dueDate/dueDate.component';
import { Chip } from '@controls/chip/chip.component';
import { getChipPropsFromConfig } from '@controls/chip/statusChip/statusChip.helpers';
import { get } from 'lodash';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { useContext } from 'react';
import { TicketsTableContext } from '../../../../ticketsTableContext/ticketsTableContext';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { FALSE_LABEL, TRUE_LABEL } from '@controls/inputs/booleanSelect/booleanSelect.component';
import { CellDate } from './ticketsTableCell.styles';
import { Cell } from './cell/cell.component';

const PROPERTIES_NAME_PREFIX = 'properties.';
type TicketsTableCellProps = {
	name: string,
	modelId: string,
	ticket: ITicket,
};
export const TicketsTableCell = ({ name, modelId, ticket }: TicketsTableCellProps) => {
	const { title, properties, number, type: templateId } = ticket;
	const { getPropertyType, isJobAndUsersType } = useContext(TicketsTableContext);
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(templateId);
	const container = ContainersHooksSelectors.selectContainerById(modelId);
	const federation = FederationsHooksSelectors.selectFederationById(modelId);
	const { name: modelName } = container || federation || {};
	const value = get(ticket, name);
	
	const {
		owner,
		priority,
		status,
		dueDate,
	} = getPropertiesInCamelCase(properties);
	const propertyType = getPropertyType(name);

	if (name === 'id') return (
		<Cell name={name}>
			{`${template.code}:${number}`}
		</Cell>
	);
	if (name === BaseProperties.TITLE) return (
		<Cell name={name}>
			{title}
		</Cell>
	);
	if (name === 'modelName') return (
		<Cell name={name}>
			{modelName}
		</Cell>
	);

	if (name.startsWith(PROPERTIES_NAME_PREFIX)) {
		switch (name.replace(PROPERTIES_NAME_PREFIX, '')) {
			case BaseProperties.OWNER:
				return (
					<Cell name={name}>
						<AssigneesSelect value={owner} disabled />
					</Cell>
				);
			case IssueProperties.DUE_DATE:
				return (
					<CellDate>
						<Cell name={name}>
							{!!dueDate && (
								<DueDate value={dueDate} disabled />
							)}
						</Cell>
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

	if (['oneOf', 'manyOf'].includes(propertyType) && isJobAndUsersType(name)) {
		const multiple = propertyType === 'manyOf';
		return (
			<Cell name={name}>
				{!!value?.length && (<AssigneesSelect value={value} multiple={multiple} disabled />)}
			</Cell>
		);
	}

	switch (getPropertyType(name)) {
		case 'manyOf':
			return (
				<Cell name={name}>
					{value?.join(', ')}
				</Cell>
			);
		case 'boolean':
			return (
				<Cell name={name}>
					{!!value ? TRUE_LABEL : FALSE_LABEL}
				</Cell>
			);
		case 'date':
		case 'pastDate':
			return (
				<CellDate>
					<Cell name={name}>
						{formatDateTime(value)}
					</Cell>
				</CellDate>
			);
		default:
			return <Cell name={name}>{value}</Cell>;
	}
};